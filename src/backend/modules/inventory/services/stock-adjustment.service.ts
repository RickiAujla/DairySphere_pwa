import { BaseService } from '../../../common/services/base.service';
import { StockAdjustmentRepository, stockAdjustmentRepository } from '../repositories/stock-adjustment.repository';
import { StockMovementRepository, stockMovementRepository } from '../repositories/stock-movement.repository';
import { productService } from '../../product/services/product.service';
import { auditLogRepository } from '../../system/repositories/audit-log.repository';
import { StockAdjustmentRecord, StockMovementType, CreateStockAdjustmentDto } from '../dto/inventory.dto';
import { DomainValidationError, ConflictError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';
import { ProductStatus } from '@prisma/client';

export class StockAdjustmentService extends BaseService {
  constructor(
    private readonly repo: StockAdjustmentRepository = stockAdjustmentRepository,
    private readonly movementRepo: StockMovementRepository = stockMovementRepository
  ) {
    super();
  }

  public async recordAdjustment(
    data: CreateStockAdjustmentDto & { tenantId: string; companyId: string; branchId: string; userId?: string },
    tx?: DbClient
  ): Promise<StockAdjustmentRecord> {
    if (!data.productId) {
      throw new DomainValidationError('Product ID is required for stock adjustment.');
    }
    if (!data.quantity || Number(data.quantity) <= 0) {
      throw new DomainValidationError('Adjustment quantity must be greater than zero.');
    }
    if (!data.reason || !data.reason.trim()) {
      throw new DomainValidationError('Reason is mandatory for stock adjustment.');
    }

    const qty = Number(data.quantity);
    const rawType = data.adjustmentType?.toUpperCase();

    let movementType: StockMovementType;
    if (rawType === 'INCREASE' || rawType === StockMovementType.ADJUSTMENT_IN) {
      movementType = StockMovementType.ADJUSTMENT_IN;
    } else if (rawType === 'DECREASE' || rawType === StockMovementType.ADJUSTMENT_OUT) {
      movementType = StockMovementType.ADJUSTMENT_OUT;
    } else if (rawType === StockMovementType.DAMAGE) {
      movementType = StockMovementType.DAMAGE;
    } else {
      throw new DomainValidationError(
        'Invalid adjustment type. Must be INCREASE, DECREASE, ADJUSTMENT_IN, ADJUSTMENT_OUT, or DAMAGE.'
      );
    }

    return this.withTransaction(async (transactionClient) => {
      // 1. Validate Product
      const product = await productService.getProductById(data.productId, data.tenantId, transactionClient);
      if (product.status !== ProductStatus.ACTIVE) {
        throw new DomainValidationError(`Product '${product.name}' is inactive and cannot be adjusted.`);
      }

      // 2. Validate Stock Availability for decrease operations
      const isDecrease =
        movementType === StockMovementType.ADJUSTMENT_OUT ||
        movementType === StockMovementType.DAMAGE;

      if (isDecrease) {
        const stockInfo = await this.movementRepo.calculateStockLevel(
          data.productId,
          data.tenantId,
          data.branchId,
          transactionClient
        );

        if (stockInfo.currentStock < qty) {
          throw new DomainValidationError(
            `Cannot reduce stock by ${qty} ${product.unitOfMeasure}. Available stock for '${product.name}' is only ${stockInfo.currentStock} ${product.unitOfMeasure}.`
          );
        }
      }

      const generatedNumber =
        data.adjustmentNumber?.trim().toUpperCase() ||
        `ADJ-${Date.now().toString().slice(-8)}`;

      const existing = await this.repo.findByAdjustmentNumber(generatedNumber, data.branchId, transactionClient);
      if (existing) {
        throw new ConflictError(`Adjustment number '${generatedNumber}' already exists in this branch.`);
      }

      // 3. Create Stock Adjustment Record
      const adjustment = await this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          adjustmentNumber: generatedNumber,
          productId: data.productId,
          adjustmentType: movementType,
          quantity: qty,
          reason: data.reason.trim(),
          userId: data.userId,
        },
        transactionClient
      );

      // 4. Create Stock Movement Record
      await this.movementRepo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          productId: data.productId,
          movementType,
          quantity: qty,
          unit: product.unitOfMeasure,
          userId: data.userId,
          timestamp: new Date(),
          referenceDocument: adjustment.adjustmentNumber,
          remarks: data.reason.trim(),
        },
        transactionClient
      );

      // 5. Audit Log
      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          userId: data.userId,
          action: 'ADJUSTMENT',
          entity: 'StockAdjustment',
          entityId: adjustment.id,
          details: {
            adjustmentNumber: adjustment.adjustmentNumber,
            movementType,
            productCode: product.productCode,
            productName: product.name,
            quantity: qty,
            reason: data.reason.trim(),
          },
        },
        transactionClient
      );

      return adjustment;
    }, tx);
  }

  public async listAdjustments(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<StockAdjustmentRecord>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async getAdjustmentById(id: string, tenantId?: string, tx?: DbClient): Promise<StockAdjustmentRecord> {
    const adjustment = await this.repo.findById(id, tenantId, tx);
    if (!adjustment) {
      throw new DomainValidationError(`Stock adjustment record with ID '${id}' not found.`);
    }
    return adjustment;
  }
}

export const stockAdjustmentService = new StockAdjustmentService();
