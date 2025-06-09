export interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  iat?: number;
  exp?: number;
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