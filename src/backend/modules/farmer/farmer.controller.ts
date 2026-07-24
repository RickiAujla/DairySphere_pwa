import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { farmerService } from './services/farmer.service';
import { getRequestContext } from '../../common/context/request-context';
import { DomainValidationError } from '../../common/errors';
import { FarmerStatus } from '@prisma/client';

export class FarmerController {
  public async createFarmer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context.branchId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to create farmer.');
      }
      if (!branchId) {
        throw new DomainValidationError('Branch context required to create farmer.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to create farmer.');
      }

      const farmer = await farmerService.createFarmer({
        tenantId,
        companyId,
        branchId,
        farmerCode: req.body.farmerCode,
        firstName: req.body.firstName,
        lastName: req.body.lastName || '',
        phone: req.body.phone,
        email: req.body.email,
        bankName: req.body.bankName,
        bankAccountNo: req.body.bankAccountNo,
        bankIfscCode: req.body.bankIfscCode,
      });

      res.status(201).json({
        success: true,
        message: 'Farmer registered successfully',
        data: farmer,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getFarmerList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await farmerService.listFarmers(
        { page, limit, sortBy: req.query.sortBy as string, sortOrder: req.query.sortOrder as 'asc' | 'desc' },
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

  public async getFarmerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const farmer = await farmerService.getFarmerById(id, tenantId);

      res.status(200).json({
        success: true,
        data: farmer,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateFarmer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const updated = await farmerService.updateFarmer(
        id,
        {
          ...(req.body.firstName ? { firstName: req.body.firstName } : {}),
          ...(req.body.lastName !== undefined ? { lastName: req.body.lastName } : {}),
          ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
          ...(req.body.email !== undefined ? { email: req.body.email } : {}),
          ...(req.body.status ? { status: req.body.status as FarmerStatus } : {}),
        },
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Farmer profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateFarmerStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(FarmerStatus).includes(status)) {
        throw new DomainValidationError(`Invalid status provided. Must be one of: ${Object.values(FarmerStatus).join(', ')}`);
      }

      const updated = await farmerService.updateFarmer(id, { status }, tenantId);

      res.status(200).json({
        success: true,
        message: `Farmer status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const farmerController = new FarmerController();
