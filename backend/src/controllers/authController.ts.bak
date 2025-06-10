import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  hashPassword,
  comparePassword,
  generateToken,
  validatePassword,
  generateRandomPassword,
} from '../utils/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
} from '../types/auth';

const prisma = new PrismaClient();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * User login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = loginSchema.parse(req.body);

  // Find user by email
  const user = await prisma.staff.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated', 401);
  }

  if (!user.tenant.isActive) {
    throw createError('Organization account is deactivated', 401);
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw createError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
  });

  // Update last login time
  await prisma.staff.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'LOGIN',
      entityType: 'Staff',
      entityId: user.id,
      description: `User ${user.email} logged in`,
      staffId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId: user.tenantId,
    },
  });

  logger.info(`User login successful: ${user.email}`, {
    userId: user.id,
    tenantId: user.tenantId,
    ip: req.ip,
  });

  const response: LoginResponse = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };

  res.status(200).json(response);
});

/**
 * User registration (admin only)
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, tenantId, role = 'STAFF' }: RegisterRequest = 
    registerSchema.parse(req.body);

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw createError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  // Check if user already exists
  const existingUser = await prisma.staff.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError('User already exists with this email', 409);
  }

  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw createError('Invalid tenant ID', 400);
  }

  if (!tenant.isActive) {
    throw createError('Tenant is deactivated', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = await prisma.staff.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      tenantId,
    },
    include: { tenant: true },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'USER_CREATED',
      entityType: 'Staff',
      entityId: newUser.id,
      description: `New user created: ${newUser.email}`,
      staffId: req.user?.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`New user registered: ${newUser.email}`, {
    userId: newUser.id,
    tenantId,
    createdBy: req.user?.userId,
  });

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenantId,
    },
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const user = await prisma.staff.findUnique({
    where: { id: req.user.userId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          plan: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.status(200).json({ user });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const { currentPassword, newPassword }: ChangePasswordRequest = 
    changePasswordSchema.parse(req.body);

  // Validate new password strength
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw createError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  // Get current user
  const user = await prisma.staff.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.password);
  if (!isValidPassword) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.staff.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'PASSWORD_CHANGED',
      entityType: 'Staff',
      entityId: user.id,
      description: `User ${user.email} changed password`,
      staffId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId: user.tenantId,
    },
  });

  logger.info(`Password changed for user: ${user.email}`, {
    userId: user.id,
    tenantId: user.tenantId,
  });

  res.status(200).json({ message: 'Password changed successfully' });
});

/**
 * Request password reset
 */
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email }: ResetPasswordRequest = resetPasswordSchema.parse(req.body);

  const user = await prisma.staff.findUnique({
    where: { email },
  });

  // Always return success for security (don't reveal if email exists)
  res.status(200).json({ message: 'Password reset instructions sent to email' });

  if (!user || !user.isActive) {
    logger.warn(`Password reset requested for non-existent or inactive user: ${email}`);
    return;
  }

  // Generate temporary password
  const tempPassword = generateRandomPassword(12);
  const hashedTempPassword = await hashPassword(tempPassword);

  // Update user with temporary password
  await prisma.staff.update({
    where: { id: user.id },
    data: { password: hashedTempPassword },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'PASSWORD_RESET',
      entityType: 'Staff',
      entityId: user.id,
      description: `Password reset for user ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId: user.tenantId,
    },
  });

  // TODO: Send email with temporary password
  // For now, log the temporary password (remove in production)
  logger.info(`Temporary password generated for ${email}: ${tempPassword}`);
});

/**
 * Logout (invalidate token on client side)
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        entityType: 'Staff',
        entityId: req.user.userId,
        description: `User logout`,
        staffId: req.user.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        tenantId: req.user.tenantId,
      },
    });

    logger.info(`User logout: ${req.user.email}`, {
      userId: req.user.userId,
      tenantId: req.user.tenantId,
    });
  }

  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * Refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Verify user still exists and is active
  const user = await prisma.staff.findUnique({
    where: { id: req.user.userId },
    include: { tenant: true },
  });

  if (!user || !user.isActive || !user.tenant.isActive) {
    throw createError('User or tenant is deactivated', 401);
  }

  // Generate new token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
  });

  res.status(200).json({
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
});