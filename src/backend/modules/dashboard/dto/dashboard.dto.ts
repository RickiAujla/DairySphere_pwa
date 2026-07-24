export interface DashboardSummaryDto {
  todayCollection: {
    quantity: number;
    amount: number;
    count: number;
  };
  todaySale: {
    quantity: number;
    amount: number;
    count: number;
  };
  farmerCount: number;
  customerCount: number;
  inventoryValue: number;
  outstandingFarmerBalance: number;
  outstandingCustomerBalance: number;
}

export interface DashboardFilterParams {
  branchId?: string;
  date?: string;
}
