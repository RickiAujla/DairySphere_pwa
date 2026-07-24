import { BaseService } from '../../../common/services/base.service';
import { DashboardRepository, dashboardRepository } from '../repositories/dashboard.repository';
import { DashboardSummaryDto } from '../dto/dashboard.dto';
import { DbClient } from '../../../common/repositories/types';

export class DashboardService extends BaseService {
  constructor(private readonly repo: DashboardRepository = dashboardRepository) {
    super();
  }

  public async getSummary(
    tenantId?: string,
    branchId?: string,
    dateStr?: string,
    tx?: DbClient
  ): Promise<DashboardSummaryDto> {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    return this.repo.getSummary(tenantId, branchId, targetDate, tx);
  }
}

export const dashboardService = new DashboardService();
