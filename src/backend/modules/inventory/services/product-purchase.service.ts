import { BaseService } from '../../../common/services/base.service';
import { ProductPurchaseRepository, productPurchaseRepository } from '../repositories/product-purchase.repository';
import { StockMovementRepository, stockMovementRepository } from '../repositories/stock-movement.repository';
import { productService } from '../../product/services/product.service';
import { auditLogRepository } from '../../system/repositories/audit-log.repository';
import { ProductPurchaseRecord, StockMovementType, CreateProductPurchaseDto } from '../dto/inventory.dto';
import { DomainValidationError, ConflictError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';
import { ProductStatus } from '@prisma/client';

export class ProductPurchaseService extends BaseService {
  constructor(
    private readonly repo: ProductPurchaseRepository = productPurchaseRepository,
    private readonly movementRepo: StockMovementRepository = stockMovementRepository
  ) {
    super();
  }

  public async recordPurchase(
    data: CreateProductPurchaseDto & { tenantId: string; companyId: string; branchId: string; userId?: string },
    tx?: DbClient
  ): Promise<ProductPurchaseRecord> {
    if (!data.productId) {
      throw new DomainValidationError('Product ID is required for purchase.');
    }
    if (!data.quantity || Number(data.quantity) <= 0) {
      throw new DomainValidationError('Purchase quantity must be greater than zero.');
    }
    if (data.unitPrice === undefined || Number(data.unitPrice) < 0) {
      throw new DomainValidationError('Unit price cannot be negative.');
    }

    const qty = Number(data.quantity);
    const unitPrice = Number(data.unitPrice);
    const totalAmount = Number((qty * unitPrice).toFixed(2));

    return this.withTransaction(async (transactionClient) => {
      // 1. Validate Product
      const product = await productService.getProductById(data.productId, data.tenantId, transactionClient);
      if (product.status !== ProductStatus.ACTIVE) {
        throw new DomainValidationError(`Product '${product.name}' is inactive and cannot be purchased.`);
      }

      const generatedNumber =
        data.purchaseNumber?.trim().toUpperCase() ||
        `PUR-${Date.now().toString().slice(-8)}`;

      const existing = await this.repo.findByPurchaseNumber(generatedNumber, data.branchId, transactionClient);
      if (existing) {
        throw new ConflictError(`Purchase number '${generatedNumber}' already exists in this branch.`);
      }

      // 2. Create Purchase Record
      const purchase = await this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          purchaseNumber: generatedNumber,
          productId: data.productId,
          quantity: qty,
          unitPrice,
          totalAmount,
          vendorName: data.vendorName?.trim(),
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
          remarks: data.remarks?.trim(),
          userId: data.userId,
        },
        transactionClient
      );

      // 3. Create Stock Movement Record (PURCHASE => + quantity)
      await this.movementRepo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          productId: data.productId,
          movementType: StockMovementType.PURCHASE,
          quantity: qty,
          unit: product.unitOfMeasure,
          userId: data.userId,
          timestamp: purchase.purchaseDate,
          referenceDocument: purchase.purchaseNumber,
          remarks: data.vendorName ? `Purchase from ${data.vendorName}` : 'Product Purchase',
        },
        transactionClient
      );

      // 4. Audit Log
      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          userId: data.userId,
          action: 'PURCHASE',
          entity: 'ProductPurchase',
          entityId: purchase.id,
          details: {
            purchaseNumber: purchase.purchaseNumber,
            productCode: product.productCode,
            productName: product.name,
            quantity: qty,
            unitPrice,
            totalAmount,
            vendorName: data.vendorName,
          },
        },
        transactionClient
      );

      return purchase;
    }, tx);
  }

  public async listPurchases(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<ProductPurchaseRecord>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async getPurchaseById(id: string, tenantId?: string, tx?: DbClient): Promise<ProductPurchaseRecord> {
    const purchase = await this.repo.findById(id, tenantId, tx);
    if (!purchase) {
      throw new DomainValidationError(`Purchase record with ID '${id}' not found.`);
    }
    return purchase;
  }
}

export const productPurchaseService = new ProductPurchaseService();
