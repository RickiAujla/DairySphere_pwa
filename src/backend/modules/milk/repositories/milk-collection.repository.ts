import { MilkCollection, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class MilkCollectionRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<MilkCollection | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.milkCollection.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        farmer: true,
        qualityRecord: true,
        appliedRateSnapshot: true,
        rateChart: true,
        branch: true,
      },
    });
  }

  public async findMany(
    params?: PaginationParams & {
      farmerId?: string;
      startDate?: Date;
      endDate?: Date;
      shift?: Prisma.EnumMilkShiftFilter | any;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<MilkCollection>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.MilkCollectionWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params?.farmerId ? { farmerId: params.farmerId } : {}),
      ...(params?.shift ? { shift: params.shift } : {}),
      ...(params?.startDate || params?.endDate
        ? {
            collectionDate: {
              ...(params.startDate ? { gte: params.startDate } : {}),
              ...(params.endDate ? { lte: params.endDate } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      client.milkCollection.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { collectionDate: 'desc' },
        include: {
          farmer: true,
          qualityRecord: true,
          appliedRateSnapshot: true,
        },
      }),
      client.milkCollection.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(
    data: Prisma.MilkCollectionUncheckedCreateInput,
    qualityData?: Prisma.MilkQualityRecordCreateInput,
    rateSnapshotData?: Prisma.AppliedRateSnapshotCreateInput,
    tx?: DbClient
  ): Promise<MilkCollection> {
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

    return client.milkCollection.create({
      data: {
        ...data,
        tenantId,
        qualityRecordId,
        appliedRateSnapshotId,
      },
      include: {
        qualityRecord: true,
        appliedRateSnapshot: true,
        farmer: true,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.MilkCollectionUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<MilkCollection> {
    const client = this.getClient(tx);

    return client.milkCollection.update({
      where: { id },
      data,
      include: {
        qualityRecord: true,
        appliedRateSnapshot: true,
        farmer: true,
      },
    });
  }
}

export const milkCollectionRepository = new MilkCollectionRepository();
