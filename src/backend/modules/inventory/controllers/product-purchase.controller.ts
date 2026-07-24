import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { productPurchaseService } from '../services/product-purchase.service';
import { getRequestContext } from '../../../common/context/request-context';
import { DomainValidationError } from '../../../common/errors';

export class ProductPurchaseController {
  public async createPurchase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const companyId = req.body.companyId || req.user?.companyId || context.companyId;
      const branchId = req.body.branchId || req.user?.activeBranchId || context.branchId;

      if (!tenantId) throw new DomainValidationError('Tenant context required for product purchase.');
      if (!companyId) throw new DomainValidationError('Company context required for product purchase.');
      if (!branchId) throw new DomainValidationError('Branch context required for product purchase.');

      const purchase = await productPurchaseService.recordPurchase({
        tenantId,
        companyId,
        branchId,
        productId: req.body.productId,
        quantity: req.body.quantity,
        unitPrice: req.body.unitPrice,
        purchaseNumber: req.body.purchaseNumber,
        vendorName: req.body.vendorName,
        purchaseDate: req.body.purchaseDate,
        remarks: req.body.remarks,
        userId: req.user?.userId,
      });

      res.status(201).json({
        success: true,
        message: 'Product purchase recorded successfully',
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getPurchaseList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await productPurchaseService.listPurchases(
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

  public async getPurchaseById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const { id } = req.params;

      const purchase = await productPurchaseService.getPurchaseById(id, tenantId);

      res.status(200).json({
        success: true,
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productPurchaseController = new ProductPurchaseController();
