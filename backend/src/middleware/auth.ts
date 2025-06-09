import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, hasRequiredRole, hasPermission } from '../utils/auth';
import { createError } from './errorHandler';
import { JWTPayload } from '../types/auth';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw createError('Access token is required', 401);
    }

    const payload = verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    next(createError('Invalid or expired token', 401));
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (requiredRole: 'ADMIN' | 'MANAGER' | 'STAFF') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    if (!hasRequiredRole(req.user.role, requiredRole)) {
      return next(createError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(createError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Tenant isolation middleware
 * Ensures user can only access data from their tenant
 */
export const ensureTenantAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  // Add tenant filter to request for use in controllers
  req.tenantId = req.user.tenantId;
  
  next();
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize('ADMIN');

/**
 * Manager or Admin middleware
 */
export const managerOrAdmin = authorize('MANAGER');

/**
 * Staff, Manager, or Admin middleware (any authenticated user)
 */
export const staffOrHigher = authorize('STAFF');

// Extend Request type to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}