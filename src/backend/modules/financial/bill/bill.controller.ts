import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { billService } from '../services/bill.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';
import { BillType, BillStatus } from '@prisma/client';

export class BillController {
  public async generateBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context?.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context?.branchId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to generate bill.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to generate bill.');
      }
      if (!branchId) {
        throw new DomainValidationError('Branch context required to generate bill.');
      }

      if (!req.body.billType || !Object.values(BillType).includes(req.body.billType)) {
        throw new DomainValidationError(`Invalid billType. Must be one of: ${Object.values(BillType).join(', ')}`);
      }
      if (!req.body.periodStart || !req.body.periodEnd) {
        throw new DomainValidationError('Billing periodStart and periodEnd dates are required.');
      }

      const bill = await billService.generateBill({
        tenantId,
        companyId,
        branchId,
        billType: req.body.billType,
        billNumber: req.body.billNumber,
        farmerId: req.body.farmerId,
        customerId: req.body.customerId,
        periodStart: new Date(req.body.periodStart),
        periodEnd: new Date(req.body.periodEnd),
        totalDeductions: req.body.totalDeductions ? Number(req.body.totalDeductions) : undefined,
        totalIncentives: req.body.totalIncentives ? Number(req.body.totalIncentives) : undefined,
        remarks: req.body.remarks,
      });

      res.status(201).json({
        success: true,
        message: 'Bill generated successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  public async listBills(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context?.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await billService.listBills(
        {
          page,
          limit,
          farmerId: req.query.farmerId as string,
          customerId: req.query.customerId as string,
          billType: req.query.billType as BillType,
          status: req.query.status as BillStatus,
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

  public async getBillById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const { id } = req.params;

      const bill = await billService.getBillById(id, tenantId);

      res.status(200).json({
        success: true,
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  public async finalizeBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const userId = req.user?.userId || context?.userId;
      const { id } = req.params;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to finalize bill.');
      }

      const bill = await billService.finalizeBill(id, tenantId, userId);

      res.status(200).json({
        success: true,
        message: 'Bill finalized successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }

  public async reviseBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const userId = req.user?.userId || context?.userId;
      const { id } = req.params;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to revise bill.');
      }

      const bill = await billService.reviseBill(id, {
        tenantId,
        reason: req.body.reason,
        revisedBy: userId,
        totalDeductions: req.body.totalDeductions !== undefined ? Number(req.body.totalDeductions) : undefined,
        totalIncentives: req.body.totalIncentives !== undefined ? Number(req.body.totalIncentives) : undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Bill revised successfully',
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const billController = new BillController();
