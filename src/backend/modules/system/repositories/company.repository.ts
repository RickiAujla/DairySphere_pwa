import { Company, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class CompanyRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<Company | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.company.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
    });
  }

  public async findByCode(code: string, tenantId?: string, tx?: DbClient): Promise<Company | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.company.findUnique({
      where: {
        tenantId_code: {
          tenantId: effectiveTenantId,
          code,
        },
      },
    });
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Company>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.CompanyWhereInput = { tenantId: effectiveTenantId };

    const [data, total] = await Promise.all([
      client.company.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
      }),
      client.company.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(data: Prisma.CompanyUncheckedCreateInput, tx?: DbClient): Promise<Company> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.company.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.CompanyUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Company> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.company.update({
      where: { id },
      data,
    });
  }
}

export const companyRepository = new CompanyRepository();
