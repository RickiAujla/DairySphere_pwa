import { Tenant, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class TenantRepository extends BaseRepository {
  public async findById(id: string, tx?: DbClient): Promise<Tenant | null> {
    const client = this.getClient(tx);
    return client.tenant.findUnique({
      where: { id },
    });
  }

  public async findByCode(code: string, tx?: DbClient): Promise<Tenant | null> {
    const client = this.getClient(tx);
    return client.tenant.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  public async findMany(params?: PaginationParams, tx?: DbClient): Promise<PaginatedResult<Tenant>> {
    const client = this.getClient(tx);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const [data, total] = await Promise.all([
      client.tenant.findMany({
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
      }),
      client.tenant.count(),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(data: Prisma.TenantCreateInput, tx?: DbClient): Promise<Tenant> {
    const client = this.getClient(tx);
    return client.tenant.create({ data });
  }

  public async update(id: string, data: Prisma.TenantUpdateInput, tx?: DbClient): Promise<Tenant> {
    const client = this.getClient(tx);
    return client.tenant.update({
      where: { id },
      data,
    });
  }
}

export const tenantRepository = new TenantRepository();
