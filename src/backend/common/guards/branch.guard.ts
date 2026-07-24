import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { ForbiddenError, AuthenticationError } from '../errors';
import { updateRequestContext } from '../context/request-context';

export function branchAccessGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      throw new AuthenticationError('Unauthenticated request. User context missing.');
    }

    // Extract requested branch ID from headers, params, query, or body
    const requestedBranchId =
      (req.headers['x-branch-id'] as string | undefined) ||
      req.params?.branchId ||
      (req.query?.branchId as string | undefined) ||
      req.body?.branchId;

    const activeBranchId = req.user.activeBranchId;

    // Admin override check
    const isTenantOrSystemAdmin =
      req.user.roles.includes('TENANT_ADMIN') ||
      req.user.roles.includes('SYSTEM_ADMIN') ||
      req.user.roles.includes('SUPER_ADMIN');

    if (requestedBranchId) {
      if (!isTenantOrSystemAdmin && activeBranchId && requestedBranchId !== activeBranchId) {
        throw new ForbiddenError('Branch access restricted. User does not have access to requested branch.');
      }
      updateRequestContext({ branchId: requestedBranchId });
    } else if (activeBranchId) {
      updateRequestContext({ branchId: activeBranchId });
    }

    next();
  } catch (err) {
    next(err);
  }
}

export const branchGuard = branchAccessGuard;
