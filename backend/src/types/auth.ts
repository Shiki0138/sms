export interface JWTPayload {
  staffId: string;
  userId: string; // staffIdと同じ値（後方互換性）
  email: string;
  tenantId: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  isAdmin?: boolean; // 管理者フラグ
  iat?: number;
  exp?: number;
}

// Session type extension
declare module 'express-session' {
  interface SessionData {
    temp2FASecret?: string;
  }
}

// Express Request extension for rawBody and user
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      recordLoginAttempt?: (success: boolean) => void;
    }
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'STAFF';
    tenantId: string;
  };
  token: string;
  expiresIn: string;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  params: any;
  query: any;
  body: any;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  tenantId: string;
  role?: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}