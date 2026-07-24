import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { milkSaleService } from '../services/milk-sale.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';
import { MilkShift, MilkType } from '@prisma/client';

export class MilkSaleController {
  public async recordSale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context.branchId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to record milk sale.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to record milk sale.');
      }
      if (!branchId) {
        throw new DomainValidationError('Branch context required to record milk sale.');
      }

      if (!req.body.customerId) {
        throw new DomainValidationError('Customer ID is required.');
      }
      if (!req.body.shift || !Object.values(MilkShift).includes(req.body.shift)) {
        throw new DomainValidationError(`Invalid shift. Must be one of: ${Object.values(MilkShift).join(', ')}`);
      }
      if (!req.body.milkType || !Object.values(MilkType).includes(req.body.milkType)) {
        throw new DomainValidationError(`Invalid milkType. Must be one of: ${Object.values(MilkType).join(', ')}`);
      }
      if (req.body.quantity === undefined || Number(req.body.quantity) <= 0) {
        throw new DomainValidationError('Valid milk quantity greater than zero is required.');
      }

      const sale = await milkSaleService.recordSale({
        tenantId,
        companyId,
        branchId,
        customerId: req.body.customerId,
        rateChartId: req.body.rateChartId,
        saleDate: new Date(req.body.saleDate || Date.now()),
        shift: req.body.shift,
        milkType: req.body.milkType,
        quantity: Number(req.body.quantity),
        totalAmount: req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : undefined,
        fat: req.body.fat !== undefined ? Number(req.body.fat) : undefined,
        snf: req.body.snf !== undefined ? Number(req.body.snf) : undefined,
        clr: req.body.clr !== undefined ? Number(req.body.clr) : undefined,
        water: req.body.water !== undefined ? Number(req.body.water) : undefined,
        ratePerLiter: req.body.ratePerLiter !== undefined ? Number(req.body.ratePerLiter) : undefined,
        remarks: req.body.remarks,
      });

      res.status(201).json({
        success: true,
        message: 'Milk sale recorded successfully',
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }

  public async listSales(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await milkSaleService.listSales(
        {
          page,
          limit,
          customerId: req.query.customerId as string,
          startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
          endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
          shift: req.query.shift as MilkShift,
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

  public async getSaleById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const sale = await milkSaleService.getSaleById(id, tenantId);

      res.status(200).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const milkSaleController = new MilkSaleController();
