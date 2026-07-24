import { BaseService } from '../../../common/services/base.service';
import { ReportsRepository, reportsRepository } from '../repositories/reports.repository';
import {
  MilkCollectionReportFilter,
  MilkSalesReportFilter,
  FarmerReportFilter,
  CustomerReportFilter,
  FinancialReportFilter,
  InventoryReportFilter,
} from '../dto/reports.dto';
import { DbClient } from '../../../common/repositories/types';

export class ReportsService extends BaseService {
  constructor(private readonly repo: ReportsRepository = reportsRepository) {
    super();
  }

  public async getMilkCollectionReport(
    params: MilkCollectionReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ) {
    return this.repo.getMilkCollectionReport(params, tenantId, branchId, tx);
  }

  public async getMilkSalesReport(
    params: MilkSalesReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ) {
    return this.repo.getMilkSalesReport(params, tenantId, branchId, tx);
  }

  public async getFarmerReport(
    params: FarmerReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ) {
    return this.repo.getFarmerReport(params, tenantId, branchId, tx);
  }

  public async getCustomerReport(
    params: CustomerReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ) {
    return this.repo.getCustomerReport(params, tenantId, branchId, tx);
  }

  public async getFinancialReport(
    params: FinancialReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ) {
    return this.repo.getFinancialReport(params, tenantId, branchId, tx);
  }

  public async getInventoryReport(
    params: InventoryReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ) {
    return this.repo.getInventoryReport(params, tenantId, branchId, tx);
  }
}

export const reportsService = new ReportsService();
