import { Tenant, Prisma } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { TenantRepository, tenantRepository } from '../repositories/tenant.repository';
import { ConflictError, NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class TenantService extends BaseService {
  constructor(private readonly repo: TenantRepository = tenantRepository) {
    super();
  }

  public async getTenantById(id: string, tx?: DbClient): Promise<Tenant> {
    const tenant = await this.repo.findById(id, tx);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID ${id} not found.`);
    }
    return tenant;
  }

  public async getTenantByCode(code: string, tx?: DbClient): Promise<Tenant> {
    const tenant = await this.repo.findByCode(code, tx);
    if (!tenant) {
      throw new NotFoundError(`Tenant with code '${code}' not found.`);
    }
    return tenant;
  }

  public async listTenants(params?: PaginationParams, tx?: DbClient): Promise<PaginatedResult<Tenant>> {
    return this.repo.findMany(params, tx);
  }

  public async createTenant(data: { name: string; code: string }, tx?: DbClient): Promise<Tenant> {
    if (!data.name || !data.name.trim()) {
      throw new DomainValidationError('Tenant name is required.');
    }
    if (!data.code || !data.code.trim()) {
      throw new DomainValidationError('Tenant code is required.');
    }

    const uppercaseCode = data.code.trim().toUpperCase();

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByCode(uppercaseCode, transactionClient);
      if (existing) {
        throw new ConflictError(`Tenant code '${uppercaseCode}' already exists.`);
      }

      return this.repo.create(
        {
          name: data.name.trim(),
          code: uppercaseCode,
        },
        transactionClient
      );
    }, tx);
  }

  public async updateTenant(id: string, data: Prisma.TenantUpdateInput, tx?: DbClient): Promise<Tenant> {
    await this.getTenantById(id, tx);
    return this.repo.update(id, data, tx);
  }
}

export const tenantService = new TenantService();
