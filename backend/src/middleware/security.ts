import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Request security tracking
interface SecurityEvent {
  type: 'LOGIN_ATTEMPT' | 'FAILED_AUTH' | 'SUSPICIOUS_ACTIVITY' | 'API_ABUSE' | 'DATA_ACCESS';
  ip: string;
  userAgent: string;
  userId?: string;
  tenantId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, any>;
}

// IP-based security tracking
const suspiciousIPs = new Map<string, {
  failedAttempts: number;
  lastFailure: Date;
  blocked: boolean;
}>();

/**
 * Enhanced rate limiting with different tiers
 */
export const createRateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.maxRequests,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
    skipFailedRequests: options.skipFailedRequests,
    handler: (req: Request, res: Response) => {
      logSecurityEvent({
        type: 'API_ABUSE',
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'Unknown',
        userId: req.user?.staffId,
        tenantId: req.user?.tenantId,
        severity: 'HIGH',
        details: {
          path: req.path,
          method: req.method,
          rateLimitExceeded: true,
        },
      });
      
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
  ].join('; '));

  // Remove server information
  res.removeHeader('X-Powered-By');
  res.setHeader('Server', 'Salon-Management-System');

  next();
};

/**
 * Request fingerprinting for security tracking
 */
export const requestFingerprint = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || '';
  const acceptLanguage = req.get('accept-language') || '';
  const acceptEncoding = req.get('accept-encoding') || '';
  
  // Create a fingerprint
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}:${acceptLanguage}:${acceptEncoding}`)
    .digest('hex');
  
  req.fingerprint = fingerprint;
  next();
};

/**
 * Suspicious activity detection
 */
export const suspiciousActivityDetection = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || '';
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /(?:union|select|insert|delete|update|drop|create|alter)/i, // SQL injection
    /<script[^>]*>.*?<\/script>/gi, // XSS
    /(?:\.\.\/|\.\.\\)/g, // Path traversal
    /(?:file|http|ftp|javascript):/i, // Protocol injection
  ];
  
  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers,
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ip,
        userAgent,
        userId: req.user?.staffId,
        tenantId: req.user?.tenantId,
        severity: 'HIGH',
        details: {
          pattern: pattern.source,
          path: req.path,
          method: req.method,
          matchedContent: requestData.match(pattern)?.[0],
        },
      });
      
      // Block the request
      res.status(400).json({
        success: false,
        error: 'Suspicious request detected',
      });
      return;
    }
  }
  
  next();
};

/**
 * IP blocking middleware
 */
export const ipBlocking = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIP(req);
  const ipInfo = suspiciousIPs.get(ip);
  
  if (ipInfo?.blocked) {
    // Check if block should be lifted (24 hours)
    const blockDuration = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - ipInfo.lastFailure.getTime() > blockDuration) {
      suspiciousIPs.delete(ip);
    } else {
      res.status(403).json({
        success: false,
        error: 'IP address is temporarily blocked due to suspicious activity',
      });
      return;
    }
  }
  
  next();
};

/**
 * Track failed authentication attempts
 */
export const trackAuthFailure = (req: Request, ip?: string): void => {
  const clientIP = ip || getClientIP(req);
  const currentInfo = suspiciousIPs.get(clientIP) || {
    failedAttempts: 0,
    lastFailure: new Date(),
    blocked: false,
  };
  
  currentInfo.failedAttempts++;
  currentInfo.lastFailure = new Date();
  
  // Block IP after 10 failed attempts
  if (currentInfo.failedAttempts >= 10) {
    currentInfo.blocked = true;
    
    logSecurityEvent({
      type: 'FAILED_AUTH',
      ip: clientIP,
      userAgent: req.get('user-agent') || 'Unknown',
      severity: 'CRITICAL',
      details: {
        failedAttempts: currentInfo.failedAttempts,
        autoBlocked: true,
      },
    });
  }
  
  suspiciousIPs.set(clientIP, currentInfo);
};

/**
 * Clear auth failure tracking on successful login
 */
export const clearAuthFailure = (req: Request, ip?: string): void => {
  const clientIP = ip || getClientIP(req);
  suspiciousIPs.delete(clientIP);
};

/**
 * Data access logging for sensitive operations
 */
export const logDataAccess = (
  operation: string,
  resourceType: string,
  resourceId?: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Log before processing
    logSecurityEvent({
      type: 'DATA_ACCESS',
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'Unknown',
      userId: req.user?.staffId,
      tenantId: req.user?.tenantId,
      severity: 'LOW',
      details: {
        operation,
        resourceType,
        resourceId,
        path: req.path,
        method: req.method,
      },
    });
    
    next();
  };
};

/**
 * Session security validation
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next();
      return;
    }
    
    // Check if refresh token exists and is valid
    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        staffId: req.user.staffId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: 'Session expired or invalid',
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('Session validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Session validation failed',
    });
  }
};

/**
 * CSRF protection for state-changing operations
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }
  
  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = (req.session as any)?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF token mismatch',
    });
    return;
  }
  
  next();
};

/**
 * Input validation and sanitization
 */
export const inputSanitization = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize common XSS patterns
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

/**
 * Helper functions
 */
export const getClientIP = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

export const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
  try {
    // Log to console/file
    logger.warn('Security Event', event);
    
    // Store in database if tenantId is available
    if (event.tenantId) {
      await prisma.securityEvent.create({
        data: {
          eventType: event.type,
          description: `Security event: ${event.type}`,
          ipAddress: event.ip,
          userAgent: event.userAgent,
          staffId: event.userId,
          tenantId: event.tenantId,
          severity: event.severity,
          metadata: JSON.stringify(event.details),
        },
      });
    }
    
    // Send alert for critical events
    if (event.severity === 'CRITICAL') {
      // TODO: Implement alert notification system
      logger.error('CRITICAL SECURITY EVENT:', event);
    }
  } catch (error) {
    logger.error('Failed to log security event:', error);
  }
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      fingerprint?: string;
    }
  }
}