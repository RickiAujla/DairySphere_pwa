import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { ForbiddenError, AuthenticationError } from '../errors';
import { updateRequestContext } from '../context/request-context';

export function tenantIsolationGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    if (!req.user || !req.user.tenantId) {
      throw new AuthenticationError('Unauthenticated request. User context missing.');
    }

    const authenticatedTenantId = req.user.tenantId;

    // Check if client passed conflicting tenantId in header, query, or params
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    const paramTenantId = req.params?.tenantId;
    const queryTenantId = req.query?.tenantId as string | undefined;

    if (headerTenantId && headerTenantId !== authenticatedTenantId) {
      throw new ForbiddenError('Cross-tenant access forbidden. Header tenant mismatch.');
    }

    if (paramTenantId && paramTenantId !== authenticatedTenantId) {
      throw new ForbiddenError('Cross-tenant access forbidden. Parameter tenant mismatch.');
    }

    if (queryTenantId && queryTenantId !== authenticatedTenantId) {
      throw new ForbiddenError('Cross-tenant access forbidden. Query tenant mismatch.');
    }

    // Lock tenant ID in request context to verified token tenant ID
    updateRequestContext({ tenantId: authenticatedTenantId });

    next();
  } catch (err) {
    next(err);
  }
}

export const tenantGuard = tenantIsolationGuard;
