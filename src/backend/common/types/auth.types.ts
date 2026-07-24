import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  companyId?: string;
  activeBranchId?: string;
  roles: string[];
  permissions: string[];
}

export interface JwtAccessTokenPayload extends AuthenticatedUser {
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface JwtRefreshTokenPayload {
  userId: string;
  tenantId: string;
  tokenId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
