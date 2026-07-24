import { prisma } from '../../prisma/client';
import { getRequestContext } from '../context/request-context';
import { DbClient, PaginationParams, PaginatedResult } from './types';
import { AuthenticationError } from '../errors';

export abstract class BaseRepository {
  /**
   * Returns either the provided transaction client or default Prisma instance.
   */
  protected getClient(tx?: DbClient): DbClient {
    return tx || prisma;
  }

  /**
   * Resolves verified tenantId from context or explicit input.
   * Throws AuthenticationError if tenant context is missing.
   */
  protected getRequiredTenantId(explicitTenantId?: string): string {
    const context = getRequestContext();
    const tenantId = explicitTenantId || context?.tenantId;

    if (!tenantId) {
      throw new AuthenticationError('Tenant context is missing for database operation');
    }

    return tenantId;
  }

  /**
   * Resolves optional branchId from context or explicit input.
   */
  protected getOptionalBranchId(explicitBranchId?: string): string | undefined {
    const context = getRequestContext();
    return explicitBranchId || context?.branchId;
  }

  /**
   * Generates pagination query parameters (skip, take).
   */
  protected getPaginationOptions(params?: PaginationParams): { skip: number; take: number; page: number; limit: number } {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));
    const skip = (page - 1) * limit;

    return { skip, take: limit, page, limit };
  }

  /**
   * Formats database results into a standardized PaginatedResult structure.
   */
  protected formatPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
