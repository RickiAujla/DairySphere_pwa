import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient } from '../../../common/repositories/types';
import { DashboardSummaryDto } from '../dto/dashboard.dto';
import { FarmerStatus, CustomerStatus, AccountType } from '@prisma/client';
import { inventoryRepository } from '../../inventory/repositories/inventory.repository';

export class DashboardRepository extends BaseRepository {
  public async getSummary(
    tenantId?: string,
    branchId?: string,
    targetDate: Date = new Date(),
    tx?: DbClient
  ): Promise<DashboardSummaryDto> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);

    // Calculate start and end of target day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Today's Collections
    const collectionWhere = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      collectionDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    const [collectionAgg, collectionCount] = await Promise.all([
      client.milkCollection.aggregate({
        where: collectionWhere,
        _sum: {
          quantity: true,
          totalAmount: true,
        },
      }),
      client.milkCollection.count({ where: collectionWhere }),
    ]);

    // 2. Today's Sales
    const saleWhere = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      saleDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    const [saleAgg, saleCount] = await Promise.all([
      client.milkSale.aggregate({
        where: saleWhere,
        _sum: {
          quantity: true,
          totalAmount: true,
        },
      }),
      client.milkSale.count({ where: saleWhere }),
    ]);

    // 3. Farmer Count
    const farmerCount = await client.farmer.count({
      where: {
        tenantId: effectiveTenantId,
        ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
        status: FarmerStatus.ACTIVE,
      },
    });

    // 4. Customer Count
    const customerCount = await client.customer.count({
      where: {
        tenantId: effectiveTenantId,
        ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
        status: CustomerStatus.ACTIVE,
      },
    });

    // 5. Inventory Value
    const inventoryResult = await inventoryRepository.getInventorySummary(
      { page: 1, limit: 10000 },
      effectiveTenantId,
      effectiveBranchId,
      tx
    );

    const inventoryValue = inventoryResult.data.reduce((sum, item) => sum + (Number(item.stockValue) || 0), 0);

    // 6. Outstanding Farmer Balance (Payables)
    const farmerLedgerAgg = await client.ledgerAccount.aggregate({
      where: {
        tenantId: effectiveTenantId,
        ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
        accountType: AccountType.FARMER,
      },
      _sum: {
        currentBalance: true,
      },
    });

    // 7. Outstanding Customer Balance (Receivables)
    const customerLedgerAgg = await client.ledgerAccount.aggregate({
      where: {
        tenantId: effectiveTenantId,
        ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
        accountType: AccountType.CUSTOMER,
      },
      _sum: {
        currentBalance: true,
      },
    });

    return {
      todayCollection: {
        quantity: Number(collectionAgg._sum.quantity) || 0,
        amount: Number(collectionAgg._sum.totalAmount) || 0,
        count: collectionCount,
      },
      todaySale: {
        quantity: Number(saleAgg._sum.quantity) || 0,
        amount: Number(saleAgg._sum.totalAmount) || 0,
        count: saleCount,
      },
      farmerCount,
      customerCount,
      inventoryValue: Number(inventoryValue.toFixed(2)),
      outstandingFarmerBalance: Number(farmerLedgerAgg._sum.currentBalance) || 0,
      outstandingCustomerBalance: Number(customerLedgerAgg._sum.currentBalance) || 0,
    };
  }
}

export const dashboardRepository = new DashboardRepository();
