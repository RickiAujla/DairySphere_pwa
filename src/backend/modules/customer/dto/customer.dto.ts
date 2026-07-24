import { CustomerType } from '@prisma/client';
import { PaginationParams } from '../../../common/repositories/types';

export interface CreateCustomerDto {
  customerCode: string;
  name: string;
  companyId?: string;
  branchId?: string;
  customerType?: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  customerType?: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
}

export interface CustomerFilterParams extends PaginationParams {
  status?: string;
  search?: string;
  branchId?: string;
}
