import { RateChartType, MilkType, RateStatus } from '@prisma/client';
import { PaginationParams } from '../../../../common/repositories/types';

export interface CreateRateChartDto {
  code: string;
  name: string;
  type: RateChartType;
  milkType: MilkType;
  baseRate: number;
  fatBase?: number;
  snfBase?: number;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date;
  branchId?: string;
  companyId?: string;
}

export interface UpdateRateChartDto {
  name?: string;
  baseRate?: number;
  fatBase?: number;
  snfBase?: number;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;
  status?: RateStatus;
  reason?: string;
}

export interface RateChartFilterParams extends PaginationParams {
  type?: RateChartType;
  milkType?: MilkType;
  status?: RateStatus;
  search?: string;
  branchId?: string;
}
