import { BaseService } from '../../../common/services/base.service';
import { InventoryRepository, inventoryRepository } from '../repositories/inventory.repository';
import { StockMovementRepository, stockMovementRepository } from '../repositories/stock-movement.repository';
import { InventoryFilterParams, MovementFilterParams, InventorySummaryItem, StockMovementRecord } from '../dto/inventory.dto';
import { NotFoundError } from '../../../common/errors';
import { DbClient, PaginatedResult } from '../../../common/repositories/types';

export class InventoryService extends BaseService {
  constructor(
    private readonly repo: InventoryRepository = inventoryRepository,
    private readonly movementRepo: StockMovementRepository = stockMovementRepository
  ) {
    super();
  }

  public async getInventorySummary(
    params?: InventoryFilterParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<InventorySummaryItem>> {
    return this.repo.getInventorySummary(params, tenantId, branchId, tx);
  }

  public async getProductInventory(
    productId: string,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<InventorySummaryItem> {
    const item = await this.repo.getProductInventory(productId, tenantId, branchId, tx);
    if (!item) {
      throw new NotFoundError(`Inventory record for product ID '${productId}' not found.`);
    }
    return item;
  }

  public async listMovements(
    params?: MovementFilterParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<StockMovementRecord>> {
    return this.movementRepo.findMany(params, tenantId, branchId, tx);
  }
}

export const inventoryService = new InventoryService();
