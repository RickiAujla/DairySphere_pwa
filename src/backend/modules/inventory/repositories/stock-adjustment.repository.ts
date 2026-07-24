import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';
import { StockAdjustmentRecord, StockMovementType } from '../dto/inventory.dto';
import { randomUUID } from 'crypto';

const inMemoryStockAdjustments: StockAdjustmentRecord[] = [];

export class StockAdjustmentRepository extends BaseRepository {
  public async create(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      adjustmentNumber: string;
      productId: string;
      adjustmentType: StockMovementType;
      quantity: number;
      reason: string;
      userId?: string;
    },
    tx?: DbClient
  ): Promise<StockAdjustmentRecord> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    const record: StockAdjustmentRecord = {
      id: randomUUID(),
      tenantId,
      companyId: data.companyId,
      branchId: data.branchId,
      adjustmentNumber: data.adjustmentNumber,
      productId: data.productId,
      adjustmentType: data.adjustmentType,
      quantity: Number(data.quantity),
      reason: data.reason,
      userId: data.userId,
      createdAt: new Date(),
    };

    if (client && typeof (client as any).stockAdjustment?.create === 'function') {
      try {
        const created = await (client as any).stockAdjustment.create({ data: record });
        inMemoryStockAdjustments.push(created);
        return created;
      } catch {
        inMemoryStockAdjustments.push(record);
        return record;
      }
    } else {
      inMemoryStockAdjustments.push(record);
      return record;
    }
  }

  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<StockAdjustmentRecord | null> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    return inMemoryStockAdjustments.find((a) => a.id === id && a.tenantId === effectiveTenantId) || null;
  }

  public async findByAdjustmentNumber(
    adjustmentNumber: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<StockAdjustmentRecord | null> {
    return (
      inMemoryStockAdjustments.find(
        (a) =>
          a.adjustmentNumber.toLowerCase() === adjustmentNumber.toLowerCase() &&
          (!branchId || a.branchId === branchId)
      ) || null
    );
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<StockAdjustmentRecord>> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { page, limit, skip } = this.getPaginationOptions(params);

    const filtered = inMemoryStockAdjustments.filter((a) => {
      if (a.tenantId !== effectiveTenantId) return false;
      if (effectiveBranchId && a.branchId !== effectiveBranchId) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paginated = filtered.slice(skip, skip + limit);
    return this.formatPaginatedResult(paginated, filtered.length, page, limit);
  }
}

export const stockAdjustmentRepository = new StockAdjustmentRepository();
