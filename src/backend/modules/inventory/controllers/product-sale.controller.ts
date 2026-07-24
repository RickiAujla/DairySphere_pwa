import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { productSaleService } from '../services/product-sale.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';

export class ProductSaleController {
  public async createSale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context.branchId;

      if (!tenantId) throw new DomainValidationError('Tenant context required for product sale.');
      if (!companyId) throw new DomainValidationError('Company context required for product sale.');
      if (!branchId) throw new DomainValidationError('Branch context required for product sale.');

      const sale = await productSaleService.recordSale({
        tenantId,
        companyId,
        branchId,
        productId: req.body.productId,
        quantity: req.body.quantity,
        unitPrice: req.body.unitPrice,
        saleNumber: req.body.saleNumber,
        customerName: req.body.customerName,
        customerId: req.body.customerId,
        saleDate: req.body.saleDate,
        remarks: req.body.remarks,
        userId: req.user?.userId,
      });

      res.status(201).json({
        success: true,
        message: 'Product sale recorded successfully',
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getSaleList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await productSaleService.listSales(
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

  public async getSaleById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const sale = await productSaleService.getSaleById(id, tenantId);

      res.status(200).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productSaleController = new ProductSaleController();
