import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { reportsService } from '../services/reports.service';
import { getRequestContext } from '../../../common/context/request-context';

export class ReportsController {
  // 1. Milk Collection Report
  public async getMilkCollectionReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await reportsService.getMilkCollectionReport(
        {
          page,
          limit,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          farmerId: req.query.farmerId as string,
          milkType: req.query.milkType as any,
          shift: req.query.shift as any,
          sortBy: req.query.sortBy as string,
          sortOrder: req.query.sortOrder as any,
        },
        tenantId,
        branchId
      );

      res.status(200).json({
        success: true,
        data: result.data,
        summary: result.summary,
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

  // 2. Milk Sales Report
  public async getMilkSalesReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await reportsService.getMilkSalesReport(
        {
          page,
          limit,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          customerId: req.query.customerId as string,
          milkType: req.query.milkType as any,
          shift: req.query.shift as any,
          sortBy: req.query.sortBy as string,
          sortOrder: req.query.sortOrder as any,
        },
        tenantId,
        branchId
      );

      res.status(200).json({
        success: true,
        data: result.data,
        summary: result.summary,
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

  // 3. Farmer Report
  public async getFarmerReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await reportsService.getFarmerReport(
        {
          page,
          limit,
          farmerId: req.query.farmerId as string,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        },
        tenantId,
        branchId
      );

      res.status(200).json({
        success: true,
        summary: result.summary,
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

  // 4. Customer Report
  public async getCustomerReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await reportsService.getCustomerReport(
        {
          page,
          limit,
          customerId: req.query.customerId as string,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        },
        tenantId,
        branchId
      );

      res.status(200).json({
        success: true,
        summary: result.summary,
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

  // 5. Financial Report
  public async getFinancialReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await reportsService.getFinancialReport(
        {
          page,
          limit,
          accountType: req.query.accountType as any,
          partyId: req.query.partyId as string,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        },
        tenantId,
        branchId
      );

      res.status(200).json({
        success: true,
        data: {
          ledgerSummary: result.ledgerSummary,
          billsSummary: result.billsSummary,
          paymentsSummary: result.paymentsSummary,
          adjustmentsSummary: result.adjustmentsSummary,
          bills: result.bills,
          payments: result.payments,
          adjustments: result.adjustments,
        },
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // 6. Inventory Report
  public async getInventoryReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await reportsService.getInventoryReport(
        {
          page,
          limit,
          productId: req.query.productId as string,
          category: req.query.category as string,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        },
        tenantId,
        branchId
      );

      res.status(200).json({
        success: true,
        data: {
          stockSummary: result.stockSummary,
          movementsSummary: result.movementsSummary,
          purchasesSummary: result.purchasesSummary,
          salesSummary: result.salesSummary,
        },
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
