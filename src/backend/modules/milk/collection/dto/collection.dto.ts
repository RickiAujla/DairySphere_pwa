import { MilkShift, MilkType } from '@prisma/client';
import { PaginationParams } from '../../../../common/repositories/types';

export interface CreateMilkCollectionDto {
  farmerId: string;
  collectionDate: string | Date;
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

export interface MilkCollectionFilterParams extends PaginationParams {
  farmerId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  shift?: MilkShift;
  branchId?: string;
}
