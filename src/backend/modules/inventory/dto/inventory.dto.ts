import { PaginationParams } from '../../../common/repositories/types';

export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN_IN = 'RETURN_IN',
  RETURN_OUT = 'RETURN_OUT',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  DAMAGE = 'DAMAGE',
  OPENING_STOCK = 'OPENING_STOCK',
}

export interface StockMovementRecord {
  id: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  productId: string;
  movementType: StockMovementType;
  quantity: number;
  unit: string;
  userId?: string;
  timestamp: Date;
  referenceDocument: string;
  remarks?: string;
  createdAt: Date;
}

export interface CreateProductPurchaseDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  purchaseNumber?: string;
  vendorName?: string;
  purchaseDate?: string | Date;
  remarks?: string;
  branchId?: string;
  companyId?: string;
}

export interface ProductPurchaseRecord {
  id: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  purchaseNumber: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  vendorName?: string;
  purchaseDate: Date;
  remarks?: string;
  userId?: string;
  createdAt: Date;
}

export interface CreateProductSaleDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  saleNumber?: string;
  customerName?: string;
  customerId?: string;
  saleDate?: string | Date;
  remarks?: string;
  branchId?: string;
  companyId?: string;
}

export interface ProductSaleRecord {
  id: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  saleNumber: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  customerId?: string;
  saleDate: Date;
  remarks?: string;
  userId?: string;
  createdAt: Date;
}

export interface CreateStockAdjustmentDto {
  productId: string;
  adjustmentType: 'INCREASE' | 'DECREASE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'DAMAGE';
  quantity: number;
  reason: string;
  adjustmentNumber?: string;
  branchId?: string;
  companyId?: string;
}

export interface StockAdjustmentRecord {
  id: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  adjustmentNumber: string;
  productId: string;
  adjustmentType: StockMovementType;
  quantity: number;
  reason: string;
  userId?: string;
  createdAt: Date;
}

export interface InventorySummaryItem {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  unitOfMeasure: string;
  basePrice: number;
  currentStock: number;
  stockValue: number;
  status: string;
}

export interface InventoryFilterParams extends PaginationParams {
  productId?: string;
  branchId?: string;
  category?: string;
  search?: string;
}

export interface MovementFilterParams extends PaginationParams {
  productId?: string;
  movementType?: StockMovementType;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}
