import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface RequestContext {
  requestId: string;
  userId?: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  roles?: string[];
  permissions?: string[];
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function updateRequestContext(partial: Partial<RequestContext>): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    if (partial.userId !== undefined) store.userId = partial.userId;
    if (partial.tenantId !== undefined) store.tenantId = partial.tenantId;
    if (partial.companyId !== undefined) store.companyId = partial.companyId;
    if (partial.branchId !== undefined) store.branchId = partial.branchId;
    if (partial.roles !== undefined) store.roles = partial.roles;
    if (partial.permissions !== undefined) store.permissions = partial.permissions;
  }
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const userId = req.headers['x-user-id'] as string | undefined;
  const tenantId = req.headers['x-tenant-id'] as string | undefined;
  const companyId = req.headers['x-company-id'] as string | undefined;
  const branchId = req.headers['x-branch-id'] as string | undefined;

  const context: RequestContext = {
    requestId,
    userId,
    tenantId,
    companyId,
    branchId,
  };

  res.setHeader('X-Request-ID', requestId);

  // Extend express request object for easy access
  (req as Request & { context?: RequestContext }).context = context;

  asyncLocalStorage.run(context, () => {
    next();
  });
}
