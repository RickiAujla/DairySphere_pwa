import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../common/types/auth.types';
import { ledgerService } from '../services/ledger.service';
import { getRequestContext } from '../../../common/context/request-context';

export class LedgerController {
  public async getAccountById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      const tenantId = req.user?.tenantId || context?.tenantId;
      const { id } = req.params;

      const account = await ledgerService.getAccountById(id, tenantId);

      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getEntriesForAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await ledgerService.getEntriesForAccount(accountId, { page, limit });

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

export const ledgerController = new LedgerController();
