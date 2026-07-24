import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { paymentService } from '../services/payment.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';
import { PaymentType, PaymentMode, PaymentStatus } from '@prisma/client';

export class PaymentController {
  public async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context?.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context?.branchId;
      const userId = req.user?.userId || context?.userId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to record payment.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to record payment.');
      }
      if (!branchId) {
        throw new DomainValidationError('Branch context required to record payment.');
      }

      if (!req.body.paymentType || !Object.values(PaymentType).includes(req.body.paymentType)) {
        throw new DomainValidationError(`Invalid paymentType. Must be one of: ${Object.values(PaymentType).join(', ')}`);
      }
      if (!req.body.paymentMode || !Object.values(PaymentMode).includes(req.body.paymentMode)) {
        throw new DomainValidationError(`Invalid paymentMode. Must be one of: ${Object.values(PaymentMode).join(', ')}`);
      }
      if (req.body.amount === undefined || Number(req.body.amount) <= 0) {
        throw new DomainValidationError('Valid payment amount greater than zero is required.');
      }

      const payment = await paymentService.recordPayment({
        tenantId,
        companyId,
        branchId,
        paymentType: req.body.paymentType,
        paymentNumber: req.body.paymentNumber,
        farmerId: req.body.farmerId,
        customerId: req.body.customerId,
        amount: Number(req.body.amount),
        paymentMode: req.body.paymentMode,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined,
        referenceNumber: req.body.referenceNumber,
        remarks: req.body.remarks,
        userId,
        allocations: req.body.allocations,
      });

      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  public async listPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context?.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await paymentService.listPayments(
        {
          page,
          limit,
          farmerId: req.query.farmerId as string,
          customerId: req.query.customerId as string,
          paymentType: req.query.paymentType as PaymentType,
          status: req.query.status as PaymentStatus,
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

  public async getPaymentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const { id } = req.params;

      const payment = await paymentService.getPaymentById(id, tenantId);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
