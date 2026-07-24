import { Farmer, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class FarmerRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<Farmer | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.farmer.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        details: true,
        branch: true,
      },
    });
  }

  public async findByCode(farmerCode: string, branchId: string, tx?: DbClient): Promise<Farmer | null> {
    const client = this.getClient(tx);

    return client.farmer.findUnique({
      where: {
        branchId_farmerCode: {
          branchId,
          farmerCode,
        },
      },
      include: {
        details: true,
      },
    });
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Farmer>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.FarmerWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
    };

    const [data, total] = await Promise.all([
      client.farmer.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
        include: { details: true, branch: true },
      }),
      client.farmer.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(data: Prisma.FarmerUncheckedCreateInput, tx?: DbClient): Promise<Farmer> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.farmer.create({
      data: {
        ...data,
        tenantId,
      },
      include: { details: true },
    });
  }

  public async update(
    id: string,
    data: Prisma.FarmerUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Farmer> {
    const client = this.getClient(tx);

    return client.farmer.update({
      where: { id },
      data,
      include: { details: true },
    });
  }
}

export const farmerRepository = new FarmerRepository();
