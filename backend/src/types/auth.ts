export interface JWTPayload {
  staffId: string;
  userId?: string; // Backward compatibility
  email: string;
  tenantId: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  iat?: number;
  exp?: number;
}

// Session type extension
declare module 'express-session' {
  interface SessionData {
    temp2FASecret?: string;
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

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
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