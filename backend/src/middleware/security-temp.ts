// Temporary simplified security middleware for testing
import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { logger } from '../utils/logger';

// Basic rate limiting
export const createRateLimit = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.maxRequests,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  res.setHeader('Server', 'Salon-Management-System');
  next();
};

export const requestFingerprint = (req: Request, res: Response, next: NextFunction): void => {
  req.fingerprint = 'temp-fingerprint';
  next();
};

export const suspiciousActivityDetection = (req: Request, res: Response, next: NextFunction): void => {
  // Simplified - just continue for now
  next();
};

export const ipBlocking = (req: Request, res: Response, next: NextFunction): void => {
  // Simplified - just continue for now
  next();
};

export const inputSanitization = (req: Request, res: Response, next: NextFunction): void => {
  // Simplified - just continue for now
  next();
};

export const getClientIP = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      fingerprint?: string;
    }
  }
}