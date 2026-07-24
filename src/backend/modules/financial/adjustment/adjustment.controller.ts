import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { adjustmentService } from '../services/adjustment.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';
import { AdjustmentType } from '@prisma/client';

export class AdjustmentController {
  public async recordAdjustment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context?.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context?.branchId;
      const userId = req.user?.userId || context?.userId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to record adjustment.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to record adjustment.');
      }
      if (!branchId) {
        throw new DomainValidationError('Branch context required to record adjustment.');
      }

      if (!req.body.adjustmentType || !Object.values(AdjustmentType).includes(req.body.adjustmentType)) {
        throw new DomainValidationError(`Invalid adjustmentType. Must be one of: ${Object.values(AdjustmentType).join(', ')}`);
      }
      if (req.body.amount === undefined || Number(req.body.amount) <= 0) {
        throw new DomainValidationError('Valid adjustment amount greater than zero is required.');
      }
      if (!req.body.reason || !req.body.reason.trim()) {
        throw new DomainValidationError('Reason is required for financial adjustment.');
      }

      const adjustment = await adjustmentService.recordAdjustment({
        tenantId,
        companyId,
        branchId,
        adjustmentType: req.body.adjustmentType,
        adjustmentNumber: req.body.adjustmentNumber,
        farmerId: req.body.farmerId,
        customerId: req.body.customerId,
        billId: req.body.billId,
        amount: Number(req.body.amount),
        reason: req.body.reason,
        approvedBy: req.body.approvedBy,
        userId,
      });

      res.status(201).json({
        success: true,
        message: 'Financial adjustment recorded successfully',
        data: adjustment,
      });
    } catch (error) {
      next(error);
    }
  }

  public async listAdjustments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context?.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await adjustmentService.listAdjustments(
        {
          page,
          limit,
          farmerId: req.query.farmerId as string,
          customerId: req.query.customerId as string,
          billId: req.query.billId as string,
          adjustmentType: req.query.adjustmentType as AdjustmentType,
          sortBy: req.query.sortBy as string,
          sortOrder: req.query.sortOrder as 'asc' | 'desc',
        },
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
      const tenantId = req.user?.tenantId || context?.tenantId;
      const { id } = req.params;

      const adjustment = await adjustmentService.getAdjustmentById(id, tenantId);

      res.status(200).json({
        success: true,
        data: adjustment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adjustmentController = new AdjustmentController();
