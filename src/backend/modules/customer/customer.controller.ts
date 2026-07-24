import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { customerService } from './services/customer.service';
import { getRequestContext } from '../../common/context/request-context';
import { DomainValidationError } from '../../common/errors';
import { CustomerStatus } from '@prisma/client';

export class CustomerController {
  public async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context.branchId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;

      if (!tenantId) {
        throw new DomainValidationError('Tenant context required to create customer.');
      }
      if (!branchId) {
        throw new DomainValidationError('Branch context required to create customer.');
      }
      if (!companyId) {
        throw new DomainValidationError('Company context required to create customer.');
      }

      const customer = await customerService.createCustomer({
        tenantId,
        companyId,
        branchId,
        customerCode: req.body.customerCode,
        name: req.body.name,
        customerType: req.body.customerType,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await customerService.listCustomers(
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

  public async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const customer = await customerService.getCustomerById(id, tenantId);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const updated = await customerService.updateCustomer(
        id,
        {
          ...(req.body.name ? { name: req.body.name } : {}),
          ...(req.body.customerType ? { customerType: req.body.customerType } : {}),
          ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
          ...(req.body.email !== undefined ? { email: req.body.email } : {}),
          ...(req.body.address !== undefined ? { address: req.body.address } : {}),
          ...(req.body.status ? { status: req.body.status as CustomerStatus } : {}),
        },
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Customer profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateCustomerStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(CustomerStatus).includes(status)) {
        throw new DomainValidationError(`Invalid status provided. Must be one of: ${Object.values(CustomerStatus).join(', ')}`);
      }

      const updated = await customerService.updateCustomer(id, { status }, tenantId);

      res.status(200).json({
        success: true,
        message: `Customer status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
