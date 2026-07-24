import { PaginationParams } from '../../../common/repositories/types';

export interface CreateProductDto {
  productCode: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  basePrice: number;
  taxRate?: number;
  companyId?: string;
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  unitOfMeasure?: string;
  basePrice?: number;
  taxRate?: number;
  isActive?: boolean;
}

export interface ProductFilterParams extends PaginationParams {
  category?: string;
  search?: string;
  companyId?: string;
}
