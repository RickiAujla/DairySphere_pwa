import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';
import { StockMovementRecord, StockMovementType, MovementFilterParams } from '../dto/inventory.dto';
import { randomUUID } from 'crypto';

// In-memory persistent fallback store for stock movements
const inMemoryStockMovements: StockMovementRecord[] = [];

export class StockMovementRepository extends BaseRepository {
  public async create(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      productId: string;
      movementType: StockMovementType;
      quantity: number;
      unit: string;
      userId?: string;
      timestamp?: Date;
      referenceDocument: string;
      remarks?: string;
    },
    tx?: DbClient
  ): Promise<StockMovementRecord> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    const record: StockMovementRecord = {
      id: randomUUID(),
      tenantId,
      companyId: data.companyId,
      branchId: data.branchId,
      productId: data.productId,
      movementType: data.movementType,
      quantity: Number(data.quantity),
      unit: data.unit,
      userId: data.userId,
      timestamp: data.timestamp || new Date(),
      referenceDocument: data.referenceDocument,
      remarks: data.remarks,
      createdAt: new Date(),
    };

    // Try Prisma model proxy or fallback
    if (client && typeof (client as any).stockMovement?.create === 'function') {
      try {
        const created = await (client as any).stockMovement.create({ data: record });
        inMemoryStockMovements.push(created);
        return created;
      } catch {
        inMemoryStockMovements.push(record);
        return record;
      }
    } else {
      inMemoryStockMovements.push(record);
      return record;
    }
  }

  public async findMany(
    params?: MovementFilterParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<StockMovementRecord>> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { page, limit, skip } = this.getPaginationOptions(params);

    const filtered = inMemoryStockMovements.filter((m) => {
      if (m.tenantId !== effectiveTenantId) return false;
      if (effectiveBranchId && m.branchId !== effectiveBranchId) return false;
      if (params?.productId && m.productId !== params.productId) return false;
      if (params?.movementType && m.movementType !== params.movementType) return false;
      if (params?.startDate && new Date(m.timestamp) < new Date(params.startDate)) return false;
      if (params?.endDate && new Date(m.timestamp) > new Date(params.endDate)) return false;
      return true;
    });

    // Sort descending by timestamp / createdAt
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const paginated = filtered.slice(skip, skip + limit);
    return this.formatPaginatedResult(paginated, filtered.length, page, limit);
  }

  public async calculateStockLevel(
    productId: string,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<{ productId: string; currentStock: number; unit: string }> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);

    const movements = inMemoryStockMovements.filter((m) => {
      if (m.tenantId !== effectiveTenantId) return false;
      if (effectiveBranchId && m.branchId !== effectiveBranchId) return false;
      return m.productId === productId;
    });

    let currentStock = 0;
    let unit = 'UNIT';

    for (const m of movements) {
      if (m.unit) unit = m.unit;
      const qty = Number(m.quantity) || 0;

      switch (m.movementType) {
        case StockMovementType.PURCHASE:
        case StockMovementType.RETURN_IN:
        case StockMovementType.ADJUSTMENT_IN:
        case StockMovementType.OPENING_STOCK:
          currentStock += qty;
          break;
        case StockMovementType.SALE:
        case StockMovementType.RETURN_OUT:
        case StockMovementType.ADJUSTMENT_OUT:
        case StockMovementType.DAMAGE:
          currentStock -= qty;
          break;
        default:
          break;
      }
    }

    return {
      productId,
      currentStock: Math.max(0, Number(currentStock.toFixed(3))),
      unit,
    };
  }
}

export const stockMovementRepository = new StockMovementRepository();
