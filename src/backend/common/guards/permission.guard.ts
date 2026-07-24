import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { ForbiddenError, AuthenticationError } from '../errors';

/**
 * Checks if user's permissions satisfy a required permission using exact or wildcard matching.
 * Format: module:resource:action (e.g., "milk:collection:create")
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes('*:*:*') || userPermissions.includes('*')) {
    return true;
  }

  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  const [reqModule, reqResource, reqAction] = requiredPermission.split(':');

  for (const userPerm of userPermissions) {
    const [uModule, uResource, uAction] = userPerm.split(':');

    const moduleMatch = uModule === '*' || uModule === reqModule;
    const resourceMatch = uResource === '*' || uResource === reqResource;
    const actionMatch = uAction === '*' || uAction === reqAction;

    if (moduleMatch && resourceMatch && actionMatch) {
      return true;
    }
  }

  return false;
}

/**
 * Guard factory enforcing that the authenticated user possesses all specified permissions.
 */
export function requirePermissions(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Unauthenticated request. User context missing.');
      }

      const userPermissions = req.user.permissions || [];

      // System admins bypass fine-grained permission checks
      const isAdmin =
        req.user.roles.includes('SYSTEM_ADMIN') ||
        req.user.roles.includes('SUPER_ADMIN') ||
        req.user.roles.includes('TENANT_ADMIN');

      if (isAdmin) {
        return next();
      }

      const missingPermissions = requiredPermissions.filter(
        (perm) => !hasPermission(userPermissions, perm)
      );

      if (missingPermissions.length > 0) {
        throw new ForbiddenError(
          `Access denied. Missing required permission(s): ${missingPermissions.join(', ')}`
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Guard factory enforcing that the authenticated user possesses at least one of the specified permissions.
 */
export function requireAnyPermission(...permissions: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Unauthenticated request. User context missing.');
      }

      const userPermissions = req.user.permissions || [];

      const isAdmin =
        req.user.roles.includes('SYSTEM_ADMIN') ||
        req.user.roles.includes('SUPER_ADMIN') ||
        req.user.roles.includes('TENANT_ADMIN');

      if (isAdmin) {
        return next();
      }

      const hasAny = permissions.some((perm) => hasPermission(userPermissions, perm));

      if (!hasAny) {
        throw new ForbiddenError(
          `Access denied. Requires at least one of: ${permissions.join(', ')}`
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export const permissionGuard = requirePermissions;
