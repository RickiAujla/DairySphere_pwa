import { Response, NextFunction } from 'express';
import { jwtService } from '../../modules/auth/jwt.service';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/auth.types';
import { AuthenticationError } from '../errors';
import { updateRequestContext } from '../context/request-context';

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required. Missing Bearer token.');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new AuthenticationError('Authentication required. Empty token.');
    }

    const payload = jwtService.verifyAccessToken(token);

    const user: AuthenticatedUser = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      activeBranchId: payload.activeBranchId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };

    req.user = user;

    updateRequestContext({
      userId: user.userId,
      tenantId: user.tenantId,
      branchId: user.activeBranchId,
      roles: user.roles,
      permissions: user.permissions,
    });

    next();
  } catch (err) {
    next(err);
  }
}

export const authenticationGuard = authenticate;
