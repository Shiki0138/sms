import { JWTPayload } from './types/auth';

declare global {
  namespace Express {
    interface Request {
      staffId?: string;
      tenantId?: string;
      role?: string;
      user?: JWTPayload;
      staff?: JWTPayload;
    }
  }
}

export {};