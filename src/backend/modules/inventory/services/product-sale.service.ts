import { BaseService } from '../../../common/services/base.service';
import { ProductSaleRepository, productSaleRepository } from '../repositories/product-sale.repository';
import { StockMovementRepository, stockMovementRepository } from '../repositories/stock-movement.repository';
import { productService } from '../../product/services/product.service';
import { auditLogRepository } from '../../system/repositories/audit-log.repository';
import { ProductSaleRecord, StockMovementType, CreateProductSaleDto } from '../dto/inventory.dto';
import { DomainValidationError, ConflictError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';
import { ProductStatus } from '@prisma/client';

export class ProductSaleService extends BaseService {
  constructor(
    private readonly repo: ProductSaleRepository = productSaleRepository,
    private readonly movementRepo: StockMovementRepository = stockMovementRepository
  ) {
    super();
  }

  public async recordSale(
    data: CreateProductSaleDto & { tenantId: string; companyId: string; branchId: string; userId?: string },
    tx?: DbClient
  ): Promise<ProductSaleRecord> {
    if (!data.productId) {
      throw new DomainValidationError('Product ID is required for sale.');
    }
    if (!data.quantity || Number(data.quantity) <= 0) {
      throw new DomainValidationError('Sale quantity must be greater than zero.');
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
        throw new DomainValidationError(`Product '${product.name}' is inactive and cannot be sold.`);
      }

      // 2. Validate Available Stock (CRITICAL BUSINESS RULE: Never allow negative stock)
      const stockInfo = await this.movementRepo.calculateStockLevel(
        data.productId,
        data.tenantId,
        data.branchId,
        transactionClient
      );

      if (stockInfo.currentStock < qty) {
        throw new DomainValidationError(
          `Insufficient stock available for product '${product.name}'. Available: ${stockInfo.currentStock} ${product.unitOfMeasure}, Requested: ${qty} ${product.unitOfMeasure}.`
        );
      }

      const generatedNumber =
        data.saleNumber?.trim().toUpperCase() ||
        `PSALE-${Date.now().toString().slice(-8)}`;

      const existing = await this.repo.findBySaleNumber(generatedNumber, data.branchId, transactionClient);
      if (existing) {
        throw new ConflictError(`Sale number '${generatedNumber}' already exists in this branch.`);
      }

      // 3. Create Sale Record
      const sale = await this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          saleNumber: generatedNumber,
          productId: data.productId,
          quantity: qty,
          unitPrice,
          totalAmount,
          customerName: data.customerName?.trim(),
          customerId: data.customerId,
          saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
          remarks: data.remarks?.trim(),
          userId: data.userId,
        },
        transactionClient
      );

      // 4. Create Stock Movement Record (SALE => - quantity)
      await this.movementRepo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          productId: data.productId,
          movementType: StockMovementType.SALE,
          quantity: qty,
          unit: product.unitOfMeasure,
          userId: data.userId,
          timestamp: sale.saleDate,
          referenceDocument: sale.saleNumber,
          remarks: data.customerName ? `Sale to ${data.customerName}` : 'Product Sale',
        },
        transactionClient
      );

      // 5. Audit Log
      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          userId: data.userId,
          action: 'SALE',
          entity: 'ProductSale',
          entityId: sale.id,
          details: {
            saleNumber: sale.saleNumber,
            productCode: product.productCode,
            productName: product.name,
            quantity: qty,
            unitPrice,
            totalAmount,
            customerName: data.customerName,
          },
        },
        transactionClient
      );

      return sale;
    }, tx);
  }

  public async listSales(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<ProductSaleRecord>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async getSaleById(id: string, tenantId?: string, tx?: DbClient): Promise<ProductSaleRecord> {
    const sale = await this.repo.findById(id, tenantId, tx);
    if (!sale) {
      throw new DomainValidationError(`Sale record with ID '${id}' not found.`);
    }
    return sale;
  }
}

export const productSaleService = new ProductSaleService();
