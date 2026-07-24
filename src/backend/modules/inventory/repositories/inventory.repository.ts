import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginatedResult } from '../../../common/repositories/types';
import { InventorySummaryItem, InventoryFilterParams } from '../dto/inventory.dto';
import { productRepository } from '../../master/repositories/product.repository';
import { stockMovementRepository } from './stock-movement.repository';

export class InventoryRepository extends BaseRepository {
  public async getInventorySummary(
    params?: InventoryFilterParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<InventorySummaryItem>> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { page, limit, skip } = this.getPaginationOptions(params);

    // Fetch products
    const productsResult = await productRepository.findMany(
      { page: 1, limit: 1000 },
      effectiveTenantId,
      undefined,
      tx
    );

    let products = productsResult.data;

    // Apply category / search filter if provided
    if (params?.category) {
      products = products.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q)
      );
    }
    if (params?.productId) {
      products = products.filter((p) => p.id === params.productId);
    }

    // Calculate stock for each product
    const summaryItems: InventorySummaryItem[] = [];

    for (const product of products) {
      const stockInfo = await stockMovementRepository.calculateStockLevel(
        product.id,
        effectiveTenantId,
        effectiveBranchId,
        tx
      );

      const basePrice = Number(product.basePrice) || 0;
      const stockValue = Number((stockInfo.currentStock * basePrice).toFixed(2));

      summaryItems.push({
        productId: product.id,
        productCode: product.productCode,
        productName: product.name,
        category: product.category,
        unitOfMeasure: product.unitOfMeasure,
        basePrice,
        currentStock: stockInfo.currentStock,
        stockValue,
        status: product.status,
      });
    }

    const paginated = summaryItems.slice(skip, skip + limit);
    return this.formatPaginatedResult(paginated, summaryItems.length, page, limit);
  }

  public async getProductInventory(
    productId: string,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<InventorySummaryItem | null> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const product = await productRepository.findById(productId, effectiveTenantId, tx);

    if (!product) return null;

    const stockInfo = await stockMovementRepository.calculateStockLevel(
      productId,
      effectiveTenantId,
      branchId,
      tx
    );

    const basePrice = Number(product.basePrice) || 0;
    const stockValue = Number((stockInfo.currentStock * basePrice).toFixed(2));

    return {
      productId: product.id,
      productCode: product.productCode,
      productName: product.name,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure,
      basePrice,
      currentStock: stockInfo.currentStock,
      stockValue,
      status: product.status,
    };
  }
}

export const inventoryRepository = new InventoryRepository();
