import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { rateChartService } from '../services/rate-chart.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';
import { RateChartType, MilkType, RateStatus } from '@prisma/client';

export class RateChartController {
  public async createRateChart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context.branchId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to create rate chart.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to create rate chart.');
      }

      if (!req.body.type || !Object.values(RateChartType).includes(req.body.type)) {
        throw new DomainValidationError(`Invalid type. Must be one of: ${Object.values(RateChartType).join(', ')}`);
      }

      if (!req.body.milkType || !Object.values(MilkType).includes(req.body.milkType)) {
        throw new DomainValidationError(`Invalid milkType. Must be one of: ${Object.values(MilkType).join(', ')}`);
      }

      const rateChart = await rateChartService.createRateChart({
        tenantId,
        companyId,
        branchId,
        code: req.body.code,
        name: req.body.name,
        type: req.body.type,
        milkType: req.body.milkType,
        baseRate: Number(req.body.baseRate),
        fatBase: req.body.fatBase !== undefined ? Number(req.body.fatBase) : undefined,
        snfBase: req.body.snfBase !== undefined ? Number(req.body.snfBase) : undefined,
        effectiveFrom: new Date(req.body.effectiveFrom || Date.now()),
        effectiveTo: req.body.effectiveTo ? new Date(req.body.effectiveTo) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Rate chart created successfully',
        data: rateChart,
      });
    } catch (error) {
      next(error);
    }
  }

  public async listRateCharts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = (req.query.companyId as string) || req.user?.companyId || context.companyId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await rateChartService.listRateCharts(
        {
          page,
          limit,
          type: req.query.type as RateChartType,
          milkType: req.query.milkType as MilkType,
          status: req.query.status as RateStatus,
          search: req.query.search as string,
          sortBy: req.query.sortBy as string,
          sortOrder: req.query.sortOrder as 'asc' | 'desc',
        },
        tenantId,
        companyId,
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

  public async getRateChartById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const rateChart = await rateChartService.getRateChartById(id, tenantId);

      res.status(200).json({
        success: true,
        data: rateChart,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateRateChart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const userId = req.user?.userId || context.userId;
      const { id } = req.params;

      const updated = await rateChartService.updateRateChart(
        id,
        {
          name: req.body.name,
          baseRate: req.body.baseRate !== undefined ? Number(req.body.baseRate) : undefined,
          fatBase: req.body.fatBase !== undefined ? Number(req.body.fatBase) : undefined,
          snfBase: req.body.snfBase !== undefined ? Number(req.body.snfBase) : undefined,
          effectiveFrom: req.body.effectiveFrom ? new Date(req.body.effectiveFrom) : undefined,
          effectiveTo: req.body.effectiveTo ? new Date(req.body.effectiveTo) : undefined,
          status: req.body.status as RateStatus,
          reason: req.body.reason,
          changedBy: userId,
        },
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Rate chart updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateRateChartStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(RateStatus).includes(status)) {
        throw new DomainValidationError(`Invalid status provided. Must be one of: ${Object.values(RateStatus).join(', ')}`);
      }

      const updated = await rateChartService.updateRateChartStatus(id, status, tenantId);

      res.status(200).json({
        success: true,
        message: `Rate chart status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const rateChartController = new RateChartController();
