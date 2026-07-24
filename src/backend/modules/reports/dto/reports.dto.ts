import { MilkType, MilkShift, AccountType } from '@prisma/client';
import { PaginationParams } from '../../../common/repositories/types';

// ==========================================
// MILK COLLECTION REPORT
// ==========================================
export interface MilkCollectionReportFilter extends PaginationParams {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  farmerId?: string;
  milkType?: MilkType;
  shift?: MilkShift;
}

export interface MilkCollectionReportSummary {
  totalQuantity: number;
  totalAmount: number;
  averageFat: number;
  averageSnf: number;
  totalCollections: number;
}

export interface MilkCollectionReportDto {
  summary: MilkCollectionReportSummary;
  records: any[];
}

// ==========================================
// MILK SALES REPORT
// ==========================================
export interface MilkSalesReportFilter extends PaginationParams {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  customerId?: string;
  milkType?: MilkType;
  shift?: MilkShift;
}

export interface MilkSalesReportSummary {
  totalQuantity: number;
  totalAmount: number;
  averageFat: number;
  averageSnf: number;
  totalSales: number;
}

export interface MilkSalesReportDto {
  summary: MilkSalesReportSummary;
  records: any[];
}

// ==========================================
// FARMER REPORT
// ==========================================
export interface FarmerReportFilter extends PaginationParams {
  farmerId?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export interface FarmerReportItem {
  farmer: {
    id: string;
    farmerCode: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    status: string;
  };
  collectionSummary: {
    totalQuantity: number;
    totalAmount: number;
    collectionCount: number;
  };
  paymentSummary: {
    totalPaid: number;
    paymentCount: number;
    byMode: Record<string, number>;
  };
  balanceSummary: {
    totalDebits: number;
    totalCredits: number;
    currentBalance: number;
  };
}

export interface FarmerReportDto {
  summary: {
    totalFarmers: number;
    totalMilkCollected: number;
    totalMilkAmount: number;
    totalPaidToFarmers: number;
    totalOutstandingPayable: number;
  };
  records: FarmerReportItem[];
}

// ==========================================
// CUSTOMER REPORT
// ==========================================
export interface CustomerReportFilter extends PaginationParams {
  customerId?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export interface CustomerReportItem {
  customer: {
    id: string;
    customerCode: string;
    name: string;
    customerType: string;
    phone?: string | null;
    status: string;
  };
  salesSummary: {
    totalQuantity: number;
    totalAmount: number;
    salesCount: number;
  };
  paymentSummary: {
    totalReceived: number;
    paymentCount: number;
    byMode: Record<string, number>;
  };
  outstandingBalance: {
    totalBilled: number;
    totalPaid: number;
    currentBalance: number;
  };
}

export interface CustomerReportDto {
  summary: {
    totalCustomers: number;
    totalMilkSold: number;
    totalSalesAmount: number;
    totalReceivedFromCustomers: number;
    totalOutstandingReceivable: number;
  };
  records: CustomerReportItem[];
}

// ==========================================
// FINANCIAL REPORT
// ==========================================
export interface FinancialReportFilter extends PaginationParams {
  accountType?: AccountType;
  partyId?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export interface FinancialReportDto {
  ledgerSummary: {
    totalDebits: number;
    totalCredits: number;
    netBalance: number;
    accountCount: number;
  };
  billsSummary: {
    totalGrossAmount: number;
    totalDeductions: number;
    totalIncentives: number;
    totalNetAmount: number;
    totalPaidAmount: number;
    billCount: number;
  };
  paymentsSummary: {
    totalAmount: number;
    paymentCount: number;
    byMode: Record<string, number>;
  };
  adjustmentsSummary: {
    totalIncentives: number;
    totalDeductions: number;
    totalCreditNotes: number;
    totalDebitNotes: number;
    adjustmentCount: number;
  };
  bills: any[];
  payments: any[];
  adjustments: any[];
}

// ==========================================
// INVENTORY REPORT
// ==========================================
export interface InventoryReportFilter extends PaginationParams {
  productId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export interface InventoryReportDto {
  stockSummary: {
    totalProducts: number;
    totalStockValue: number;
    items: Array<{
      productId: string;
      productCode: string;
      productName: string;
      category: string;
      unitOfMeasure: string;
      basePrice: number;
      currentStock: number;
      stockValue: number;
      status: string;
    }>;
  };
  movementsSummary: {
    totalPurchases: number;
    totalSales: number;
    totalAdjustmentsIn: number;
    totalAdjustmentsOut: number;
    totalDamages: number;
    movementCount: number;
  };
  purchasesSummary: {
    totalPurchasedQty: number;
    totalPurchaseAmount: number;
    purchaseCount: number;
  };
  salesSummary: {
    totalSoldQty: number;
    totalSalesAmount: number;
    salesCount: number;
  };
}
