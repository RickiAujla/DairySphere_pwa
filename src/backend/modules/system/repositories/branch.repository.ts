import { Branch, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class BranchRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<Branch | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.branch.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
    });
  }

  public async findByCode(code: string, companyId: string, tx?: DbClient): Promise<Branch | null> {
    const client = this.getClient(tx);

    return client.branch.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
    });
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    companyId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Branch>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.BranchWhereInput = {
      tenantId: effectiveTenantId,
      ...(companyId ? { companyId } : {}),
    };

    const [data, total] = await Promise.all([
      client.branch.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
      }),
      client.branch.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(data: Prisma.BranchUncheckedCreateInput, tx?: DbClient): Promise<Branch> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.branch.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.BranchUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Branch> {
    const client = this.getClient(tx);
    return client.branch.update({
      where: { id },
      data,
    });
  }
}

export const branchRepository = new BranchRepository();
