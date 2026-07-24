import { FinancialAdjustment, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class AdjustmentRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<FinancialAdjustment | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.financialAdjustment.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        farmer: true,
        customer: true,
        bill: true,
      },
    });
  }

  public async findByAdjustmentNumber(adjustmentNumber: string, branchId: string, tx?: DbClient): Promise<FinancialAdjustment | null> {
    const client = this.getClient(tx);

    return client.financialAdjustment.findUnique({
      where: {
        branchId_adjustmentNumber: {
          branchId,
          adjustmentNumber,
        },
      },
    });
  }

  public async findMany(
    params?: PaginationParams & {
      farmerId?: string;
      customerId?: string;
      billId?: string;
      adjustmentType?: Prisma.EnumAdjustmentTypeFilter | any;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<FinancialAdjustment>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.FinancialAdjustmentWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params?.farmerId ? { farmerId: params.farmerId } : {}),
      ...(params?.customerId ? { customerId: params.customerId } : {}),
      ...(params?.billId ? { billId: params.billId } : {}),
      ...(params?.adjustmentType ? { adjustmentType: params.adjustmentType } : {}),
    };

    const [data, total] = await Promise.all([
      client.financialAdjustment.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
        include: {
          farmer: true,
          customer: true,
          bill: true,
        },
      }),
      client.financialAdjustment.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(
    data: Prisma.FinancialAdjustmentUncheckedCreateInput,
    tx?: DbClient
  ): Promise<FinancialAdjustment> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.financialAdjustment.create({
      data: {
        ...data,
        tenantId,
      },
      include: {
        farmer: true,
        customer: true,
        bill: true,
      },
    });
  }
}

export const adjustmentRepository = new AdjustmentRepository();
