import { JWTPayload } from './auth';

declare namespace Express {
  interface Request {
    staffId?: string;
    tenantId?: string;
    role?: string;
    user?: JWTPayload;
  }
}