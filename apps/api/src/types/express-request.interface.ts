import { Request } from 'express';

interface JwtPayload {
  userId: string;
  email: string;
  tenantId: string;
}

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
