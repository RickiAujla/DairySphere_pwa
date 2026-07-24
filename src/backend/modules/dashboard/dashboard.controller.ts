import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { dashboardService } from './services/dashboard.service';
import { getRequestContext } from '../../common/context/request-context';

export class DashboardController {
  public async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context.tenantId;
      const branchId = (req.query.branchId as string) || req.user?.activeBranchId || context.branchId;
      const dateStr = req.query.date as string;

      const summary = await dashboardService.getSummary(tenantId, branchId, dateStr);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
