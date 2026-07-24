import { MilkShift, MilkType } from '@prisma/client';
import { PaginationParams } from '../../../../common/repositories/types';

export interface CreateMilkSaleDto {
  customerId: string;
  saleDate: string | Date;
  shift: MilkShift;
  milkType: MilkType;
  quantity: number;
  rateChartId?: string;
  fat?: number;
  snf?: number;
  clr?: number;
  water?: number;
  ratePerLiter?: number;
  totalAmount?: number;
  remarks?: string;
  branchId?: string;
  companyId?: string;
}

export interface MilkSaleFilterParams extends PaginationParams {
  customerId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  shift?: MilkShift;
  branchId?: string;
}
