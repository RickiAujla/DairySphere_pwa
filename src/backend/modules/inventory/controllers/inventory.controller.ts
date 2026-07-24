import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { inventoryService } from '../services/inventory.service';
import { getRequestContext } from '../../../common/context/request-context';

export class InventoryController {
  public async getInventorySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await inventoryService.getInventorySummary(
        {
          page,
          limit,
          productId: req.query.productId as string,
          category: req.query.category as string,
          search: req.query.search as string,
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

  public async getProductInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;
      const { productId } = req.params;

      const item = await inventoryService.getProductInventory(productId, tenantId, branchId);

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  public async listStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await inventoryService.listMovements(
        {
          page,
          limit,
          productId: req.query.productId as string,
          movementType: req.query.movementType as any,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
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
}

export const inventoryController = new InventoryController();
