import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { stockAdjustmentService } from '../services/stock-adjustment.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';

export class StockAdjustmentController {
  public async createAdjustment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context.branchId;

      if (!tenantId) throw new DomainValidationError('Tenant context required for stock adjustment.');
      if (!companyId) throw new DomainValidationError('Company context required for stock adjustment.');
      if (!branchId) throw new DomainValidationError('Branch context required for stock adjustment.');

      const adjustment = await stockAdjustmentService.recordAdjustment({
        tenantId,
        companyId,
        branchId,
        productId: req.body.productId,
        adjustmentType: req.body.adjustmentType,
        quantity: req.body.quantity,
        reason: req.body.reason,
        adjustmentNumber: req.body.adjustmentNumber,
        userId: req.user?.userId,
      });

      res.status(201).json({
        success: true,
        message: 'Stock adjustment recorded successfully',
        data: adjustment,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAdjustmentList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await stockAdjustmentService.listAdjustments(
        { page, limit },
        tenantId,
        branchId
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAdjustmentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const adjustment = await stockAdjustmentService.getAdjustmentById(id, tenantId);

      res.status(200).json({
        success: true,
        data: adjustment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const stockAdjustmentController = new StockAdjustmentController();
