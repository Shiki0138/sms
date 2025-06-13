import { Request, Response, NextFunction } from 'express';
import { performanceService } from '../services/performanceService';
import { logger } from '../utils/logger';

// Extend Request interface for performance tracking
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      dbQueryCount?: number;
      dbQueryTime?: number;
    }
  }
}

/**
 * Performance monitoring middleware
 */
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction): void => {
  req.startTime = Date.now();
  req.dbQueryCount = 0;
  req.dbQueryTime = 0;

  // Track database queries
  const originalQuery = req.app.locals.db?.query || (() => {});
  if (req.app.locals.db) {
    req.app.locals.db.query = (...args: any[]) => {
      const queryStart = Date.now();
      req.dbQueryCount = (req.dbQueryCount || 0) + 1;
      
      const result = originalQuery.apply(req.app.locals.db, args);
      
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          req.dbQueryTime = (req.dbQueryTime || 0) + (Date.now() - queryStart);
        });
      } else {
        req.dbQueryTime = (req.dbQueryTime || 0) + (Date.now() - queryStart);
        return result;
      }
    };
  }

  // Capture response details
  const originalSend = res.send;
  res.send = function(body: any) {
    const responseTime = Date.now() - (req.startTime || Date.now());
    const memoryUsage = process.memoryUsage().heapUsed;

    // Record performance metrics
    performanceService.recordMetrics({
      endpoint: req.route?.path || req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      memoryUsage,
      cpuUsage: 0, // TODO: Calculate actual CPU usage
      dbQueryCount: req.dbQueryCount || 0,
      dbQueryTime: req.dbQueryTime || 0,
      cacheHitRate: 0, // TODO: Calculate cache hit rate
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Response compression middleware
 */
export const smartCompression = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    const contentType = res.getHeader('content-type') as string || '';
    const bodySize = Buffer.byteLength(JSON.stringify(body), 'utf8');

    if (performanceService.shouldCompress(contentType, bodySize)) {
      res.setHeader('Content-Encoding', 'gzip');
      // Note: In production, use compression middleware like compression
    }

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Response optimization middleware
 */
export const responseOptimization = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json;
  
  res.json = function(obj: any) {
    // Get field selection from query params
    const fields = req.query.fields as string;
    const fieldArray = fields ? fields.split(',') : undefined;

    // Optimize response data
    const optimizedData = performanceService.optimizeApiResponse(obj, fieldArray);

    return originalJson.call(this, optimizedData);
  };

  next();
};

/**
 * Caching middleware for GET requests
 */
export const apiCaching = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Generate cache key
    const cacheKey = `api:${req.originalUrl}:${req.user?.staffId || 'anonymous'}`;

    try {
      // Check cache
      const cachedData = await performanceService.getCachedData(cacheKey);
      
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.json(cachedData);
        return;
      }

      // Cache miss - proceed with request
      res.setHeader('X-Cache', 'MISS');
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(obj: any) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          performanceService.cacheData(cacheKey, obj, ttl).catch((error: any) => {
            logger.error('Caching error:', error);
          });
        }
        
        return originalJson.call(this, obj);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Database query optimization middleware
 */
export const queryOptimization = (req: Request, res: Response, next: NextFunction): void => {
  // Add pagination defaults
  if (req.query.page && !req.query.limit) {
    req.query.limit = '20'; // Default page size
  }

  // Limit maximum page size
  if (req.query.limit && parseInt(req.query.limit as string) > 100) {
    req.query.limit = '100';
  }

  // Add default sorting
  if (!req.query.sort && req.method === 'GET') {
    req.query.sort = 'createdAt:desc';
  }

  next();
};

/**
 * Memory optimization middleware
 */
export const memoryOptimization = (req: Request, res: Response, next: NextFunction): void => {
  // Monitor memory usage
  const memoryUsage = process.memoryUsage();
  const usagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  if (usagePercentage > 85) {
    // Trigger memory optimization
    performanceService.optimizeMemory();
  }

  // Add memory usage headers in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Memory-Usage', Math.round(usagePercentage));
  }

  next();
};

/**
 * Connection pool optimization middleware
 */
export const connectionPoolOptimization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Optimize database connections periodically
    if (Math.random() < 0.01) { // 1% chance to run optimization
      performanceService.optimizeConnectionPool().catch((error: any) => {
        logger.error('Connection pool optimization error:', error);
      });
    }

    next();
  } catch (error) {
    logger.error('Connection pool middleware error:', error);
    next();
  }
};

/**
 * Health check middleware for load balancers
 */
export const healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.path === '/health' || req.path === '/healthz') {
    try {
      const health = await performanceService.getSystemHealth();
      
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'warning' ? 200 : 503;
      
      res.status(statusCode).json({
        status: health.status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: health.metrics.memory,
        responseTime: health.metrics.responseTime,
        alerts: health.alerts,
      });
      return;
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(503).json({
        status: 'error',
        error: 'Health check failed',
      });
      return;
    }
  }

  next();
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          timeout: timeoutMs,
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Response time header middleware
 */
export const responseTimeHeader = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
  });

  next();
};

/**
 * Rate limiting with performance awareness
 */
export const performanceAwareRateLimit = (baseLimit: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await performanceService.getSystemHealth();
      
      // Reduce rate limit if system is under stress
      let adjustedLimit = baseLimit;
      
      if (health.status === 'critical') {
        adjustedLimit = Math.floor(baseLimit * 0.5); // 50% of normal
      } else if (health.status === 'warning') {
        adjustedLimit = Math.floor(baseLimit * 0.75); // 75% of normal
      }

      // Store adjusted limit for use by rate limiting middleware
      req.adjustedRateLimit = adjustedLimit;
      
      next();
    } catch (error) {
      logger.error('Performance-aware rate limit error:', error);
      next();
    }
  };
};

// Extend Request interface for rate limiting
declare global {
  namespace Express {
    interface Request {
      adjustedRateLimit?: number;
    }
  }
}