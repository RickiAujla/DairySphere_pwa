import { MilkSale, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class MilkSaleRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<MilkSale | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.milkSale.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        customer: true,
        qualityRecord: true,
        appliedRateSnapshot: true,
        rateChart: true,
        branch: true,
      },
    });
  }

  public async findMany(
    params?: PaginationParams & {
      customerId?: string;
      startDate?: Date;
      endDate?: Date;
      shift?: Prisma.EnumMilkShiftFilter | any;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<MilkSale>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.MilkSaleWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params?.customerId ? { customerId: params.customerId } : {}),
      ...(params?.shift ? { shift: params.shift } : {}),
      ...(params?.startDate || params?.endDate
        ? {
            saleDate: {
              ...(params.startDate ? { gte: params.startDate } : {}),
              ...(params.endDate ? { lte: params.endDate } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      client.milkSale.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { saleDate: 'desc' },
        include: {
          customer: true,
          qualityRecord: true,
          appliedRateSnapshot: true,
        },
      }),
      client.milkSale.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(
    data: Prisma.MilkSaleUncheckedCreateInput,
    qualityData?: Prisma.MilkQualityRecordCreateInput,
    rateSnapshotData?: Prisma.AppliedRateSnapshotCreateInput,
    tx?: DbClient
  ): Promise<MilkSale> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    let qualityRecordId = data.qualityRecordId;
    if (!qualityRecordId && qualityData) {
      const qRec = await client.milkQualityRecord.create({ data: qualityData });
      qualityRecordId = qRec.id;
    }

    let appliedRateSnapshotId = data.appliedRateSnapshotId;
    if (!appliedRateSnapshotId && rateSnapshotData) {
      const rSnap = await client.appliedRateSnapshot.create({ data: rateSnapshotData });
      appliedRateSnapshotId = rSnap.id;
    }

    return client.milkSale.create({
      data: {
        ...data,
        tenantId,
        qualityRecordId,
        appliedRateSnapshotId,
      },
      include: {
        qualityRecord: true,
        appliedRateSnapshot: true,
        customer: true,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.MilkSaleUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<MilkSale> {
    const client = this.getClient(tx);

    return client.milkSale.update({
      where: { id },
      data,
      include: {
        qualityRecord: true,
        appliedRateSnapshot: true,
        customer: true,
      },
    });
  }
}

export const milkSaleRepository = new MilkSaleRepository();
