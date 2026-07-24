import { PaginationParams } from '../../../common/repositories/types';

export interface CreateFarmerDto {
  farmerCode: string;
  firstName: string;
  lastName: string;
  companyId?: string;
  branchId?: string;
  phone?: string;
  email?: string;
  address?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfscCode?: string;
}

export interface UpdateFarmerDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfscCode?: string;
}

export interface FarmerFilterParams extends PaginationParams {
  status?: string;
  search?: string;
  branchId?: string;
}
