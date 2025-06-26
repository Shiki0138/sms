import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate random password for initial setup
 */
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Role hierarchy for permission checking
 */
export const ROLE_HIERARCHY = {
  ADMIN: 3,
  MANAGER: 2,
  STAFF: 1,
} as const;

/**
 * Check if user has required role or higher
 */
export const hasRequiredRole = (
  userRole: keyof typeof ROLE_HIERARCHY,
  requiredRole: keyof typeof ROLE_HIERARCHY
): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Customer management
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  CUSTOMER_DELETE: 'customer:delete',
  
  // Message management
  MESSAGE_READ: 'message:read',
  MESSAGE_WRITE: 'message:write',
  MESSAGE_DELETE: 'message:delete',
  
  // Reservation management
  RESERVATION_READ: 'reservation:read',
  RESERVATION_WRITE: 'reservation:write',
  RESERVATION_DELETE: 'reservation:delete',
  
  // Staff management
  STAFF_READ: 'staff:read',
  STAFF_WRITE: 'staff:write',
  STAFF_DELETE: 'staff:delete',
  
  // Template management
  TEMPLATE_READ: 'template:read',
  TEMPLATE_WRITE: 'template:write',
  TEMPLATE_DELETE: 'template:delete',
  
  // Analytics
  ANALYTICS: 'analytics:read',
  ANALYTICS_READ: 'analytics:read',
  
  // Admin permissions
  ADMIN: 'admin:all',
  
  // System settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  
  // Super admin permissions
  SUPER_ADMIN: 'super_admin:all',
} as const;

/**
 * Role-based permissions mapping
 */
const STAFF_PERMISSIONS = [
  PERMISSIONS.CUSTOMER_READ,
  PERMISSIONS.MESSAGE_READ,
  PERMISSIONS.MESSAGE_WRITE,
  PERMISSIONS.RESERVATION_READ,
  PERMISSIONS.TEMPLATE_READ,
];

const MANAGER_PERMISSIONS = [
  ...STAFF_PERMISSIONS,
  PERMISSIONS.CUSTOMER_WRITE,
  PERMISSIONS.CUSTOMER_DELETE,
  PERMISSIONS.MESSAGE_DELETE,
  PERMISSIONS.RESERVATION_WRITE,
  PERMISSIONS.RESERVATION_DELETE,
  PERMISSIONS.TEMPLATE_WRITE,
  PERMISSIONS.TEMPLATE_DELETE,
  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.STAFF_READ,
];

const ADMIN_PERMISSIONS = [
  ...MANAGER_PERMISSIONS,
  PERMISSIONS.STAFF_WRITE,
  PERMISSIONS.STAFF_DELETE,
  PERMISSIONS.SETTINGS_READ,
  PERMISSIONS.SETTINGS_WRITE,
  PERMISSIONS.ADMIN,
];

export const ROLE_PERMISSIONS = {
  STAFF: STAFF_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
} as const;

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  userRole: keyof typeof ROLE_PERMISSIONS,
  permission: string
): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission as any);
};