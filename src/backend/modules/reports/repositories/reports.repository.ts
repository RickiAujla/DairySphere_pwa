import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginatedResult } from '../../../common/repositories/types';
import {
  MilkCollectionReportFilter,
  MilkCollectionReportDto,
  MilkSalesReportFilter,
  MilkSalesReportDto,
  FarmerReportFilter,
  FarmerReportDto,
  FarmerReportItem,
  CustomerReportFilter,
  CustomerReportDto,
  CustomerReportItem,
  FinancialReportFilter,
  FinancialReportDto,
  InventoryReportFilter,
  InventoryReportDto,
} from '../dto/reports.dto';
import { milkCollectionRepository } from '../../milk/repositories/milk-collection.repository';
import { milkSaleRepository } from '../../milk/repositories/milk-sale.repository';
import { farmerRepository } from '../../master/repositories/farmer.repository';
import { customerRepository } from '../../master/repositories/customer.repository';
import { inventoryRepository } from '../../inventory/repositories/inventory.repository';
import { stockMovementRepository } from '../../inventory/repositories/stock-movement.repository';
import { AccountType, AdjustmentType, EntryType, PaymentType, Prisma } from '@prisma/client';

export class ReportsRepository extends BaseRepository {
  // ==========================================
  // 1. MILK COLLECTION REPORT
  // ==========================================
  public async getMilkCollectionReport(
    params: MilkCollectionReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<MilkCollectionReportDto['records'][0]> & { summary: MilkCollectionReportDto['summary'] }> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;

    const where: Prisma.MilkCollectionWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.farmerId ? { farmerId: params.farmerId } : {}),
      ...(params.milkType ? { milkType: params.milkType } : {}),
      ...(params.shift ? { shift: params.shift } : {}),
      ...(startDate || endDate
        ? {
            collectionDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [collections, total, agg] = await Promise.all([
      client.milkCollection.findMany({
        where,
        skip,
        take,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { collectionDate: 'desc' },
        include: {
          farmer: true,
          qualityRecord: true,
          appliedRateSnapshot: true,
          branch: true,
        },
      }),
      client.milkCollection.count({ where }),
      client.milkCollection.aggregate({
        where,
        _sum: {
          quantity: true,
          totalAmount: true,
        },
      }),
    ]);

    // Compute average FAT and SNF across records with quality records
    const qualityRecords = collections.filter((c) => c.qualityRecord);
    let totalFat = 0;
    let totalSnf = 0;

    qualityRecords.forEach((c) => {
      if (c.qualityRecord) {
        totalFat += Number(c.qualityRecord.fat) || 0;
        totalSnf += Number(c.qualityRecord.snf) || 0;
      }
    });

    const averageFat = qualityRecords.length > 0 ? Number((totalFat / qualityRecords.length).toFixed(2)) : 0;
    const averageSnf = qualityRecords.length > 0 ? Number((totalSnf / qualityRecords.length).toFixed(2)) : 0;

    const summary = {
      totalQuantity: Number(agg._sum.quantity) || 0,
      totalAmount: Number(agg._sum.totalAmount) || 0,
      averageFat,
      averageSnf,
      totalCollections: total,
    };

    const result = this.formatPaginatedResult(collections, total, page, limit);

    return {
      ...result,
      summary,
    };
  }

  // ==========================================
  // 2. MILK SALES REPORT
  // ==========================================
  public async getMilkSalesReport(
    params: MilkSalesReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<MilkSalesReportDto['records'][0]> & { summary: MilkSalesReportDto['summary'] }> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;

    const where: Prisma.MilkSaleWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.customerId ? { customerId: params.customerId } : {}),
      ...(params.milkType ? { milkType: params.milkType } : {}),
      ...(params.shift ? { shift: params.shift } : {}),
      ...(startDate || endDate
        ? {
            saleDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [sales, total, agg] = await Promise.all([
      client.milkSale.findMany({
        where,
        skip,
        take,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { saleDate: 'desc' },
        include: {
          customer: true,
          qualityRecord: true,
          appliedRateSnapshot: true,
          branch: true,
        },
      }),
      client.milkSale.count({ where }),
      client.milkSale.aggregate({
        where,
        _sum: {
          quantity: true,
          totalAmount: true,
        },
      }),
    ]);

    const qualityRecords = sales.filter((s) => s.qualityRecord);
    let totalFat = 0;
    let totalSnf = 0;

    qualityRecords.forEach((s) => {
      if (s.qualityRecord) {
        totalFat += Number(s.qualityRecord.fat) || 0;
        totalSnf += Number(s.qualityRecord.snf) || 0;
      }
    });

    const averageFat = qualityRecords.length > 0 ? Number((totalFat / qualityRecords.length).toFixed(2)) : 0;
    const averageSnf = qualityRecords.length > 0 ? Number((totalSnf / qualityRecords.length).toFixed(2)) : 0;

    const summary = {
      totalQuantity: Number(agg._sum.quantity) || 0,
      totalAmount: Number(agg._sum.totalAmount) || 0,
      averageFat,
      averageSnf,
      totalSales: total,
    };

    const result = this.formatPaginatedResult(sales, total, page, limit);

    return {
      ...result,
      summary,
    };
  }

  // ==========================================
  // 3. FARMER REPORT
  // ==========================================
  public async getFarmerReport(
    params: FarmerReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<FarmerReportItem> & { summary: FarmerReportDto['summary'] }> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;

    const farmerWhere: Prisma.FarmerWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.farmerId ? { id: params.farmerId } : {}),
    };

    const [farmers, total] = await Promise.all([
      client.farmer.findMany({
        where: farmerWhere,
        skip,
        take,
        orderBy: { farmerCode: 'asc' },
      }),
      client.farmer.count({ where: farmerWhere }),
    ]);

    const items: FarmerReportItem[] = [];

    let grandMilkQty = 0;
    let grandMilkAmount = 0;
    let grandPaidAmount = 0;
    let grandOutstandingPayable = 0;

    for (const farmer of farmers) {
      // Milk Collections for farmer
      const collectionWhere: Prisma.MilkCollectionWhereInput = {
        farmerId: farmer.id,
        tenantId: effectiveTenantId,
        ...(startDate || endDate
          ? {
              collectionDate: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      };

      const [colAgg, colCount] = await Promise.all([
        client.milkCollection.aggregate({
          where: collectionWhere,
          _sum: {
            quantity: true,
            totalAmount: true,
          },
        }),
        client.milkCollection.count({ where: collectionWhere }),
      ]);

      // Payments made to farmer
      const paymentWhere: Prisma.PaymentWhereInput = {
        farmerId: farmer.id,
        tenantId: effectiveTenantId,
        paymentType: PaymentType.FARMER_PAYMENT,
        ...(startDate || endDate
          ? {
              paymentDate: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      };

      const payments = await client.payment.findMany({
        where: paymentWhere,
      });

      let totalPaid = 0;
      const byMode: Record<string, number> = {};

      for (const p of payments) {
        const pAmount = Number(p.amount) || 0;
        totalPaid += pAmount;
        byMode[p.paymentMode] = (byMode[p.paymentMode] || 0) + pAmount;
      }

      // Ledger Account
      const ledgerAccount = await client.ledgerAccount.findFirst({
        where: {
          farmerId: farmer.id,
          accountType: AccountType.FARMER,
        },
      });

      const currentBalance = Number(ledgerAccount?.currentBalance) || 0;

      // Ledger Entries sum
      let totalDebits = 0;
      let totalCredits = 0;

      if (ledgerAccount) {
        const entriesAgg = await client.ledgerEntry.groupBy({
          by: ['entryType'],
          where: {
            accountId: ledgerAccount.id,
            ...(startDate || endDate
              ? {
                  transactionDate: {
                    ...(startDate ? { gte: startDate } : {}),
                    ...(endDate ? { lte: endDate } : {}),
                  },
                }
              : {}),
          },
          _sum: {
            amount: true,
          },
        });

        entriesAgg.forEach((g) => {
          if (g.entryType === EntryType.DEBIT) {
            totalDebits = Number(g._sum.amount) || 0;
          } else if (g.entryType === EntryType.CREDIT) {
            totalCredits = Number(g._sum.amount) || 0;
          }
        });
      }

      const farmerQty = Number(colAgg._sum.quantity) || 0;
      const farmerAmount = Number(colAgg._sum.totalAmount) || 0;

      grandMilkQty += farmerQty;
      grandMilkAmount += farmerAmount;
      grandPaidAmount += totalPaid;
      grandOutstandingPayable += currentBalance;

      items.push({
        farmer: {
          id: farmer.id,
          farmerCode: farmer.farmerCode,
          firstName: farmer.firstName,
          lastName: farmer.lastName,
          phone: farmer.phone,
          status: farmer.status,
        },
        collectionSummary: {
          totalQuantity: farmerQty,
          totalAmount: farmerAmount,
          collectionCount: colCount,
        },
        paymentSummary: {
          totalPaid,
          paymentCount: payments.length,
          byMode,
        },
        balanceSummary: {
          totalDebits,
          totalCredits,
          currentBalance,
        },
      });
    }

    const summary = {
      totalFarmers: total,
      totalMilkCollected: Number(grandMilkQty.toFixed(2)),
      totalMilkAmount: Number(grandMilkAmount.toFixed(2)),
      totalPaidToFarmers: Number(grandPaidAmount.toFixed(2)),
      totalOutstandingPayable: Number(grandOutstandingPayable.toFixed(2)),
    };

    const result = this.formatPaginatedResult(items, total, page, limit);

    return {
      ...result,
      summary,
    };
  }

  // ==========================================
  // 4. CUSTOMER REPORT
  // ==========================================
  public async getCustomerReport(
    params: CustomerReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<CustomerReportItem> & { summary: CustomerReportDto['summary'] }> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;

    const customerWhere: Prisma.CustomerWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.customerId ? { id: params.customerId } : {}),
    };

    const [customers, total] = await Promise.all([
      client.customer.findMany({
        where: customerWhere,
        skip,
        take,
        orderBy: { customerCode: 'asc' },
      }),
      client.customer.count({ where: customerWhere }),
    ]);

    const items: CustomerReportItem[] = [];

    let grandMilkQty = 0;
    let grandSalesAmount = 0;
    let grandReceivedAmount = 0;
    let grandOutstandingReceivable = 0;

    for (const customer of customers) {
      // Milk Sales
      const saleWhere: Prisma.MilkSaleWhereInput = {
        customerId: customer.id,
        tenantId: effectiveTenantId,
        ...(startDate || endDate
          ? {
              saleDate: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
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

      // Payments received from customer
      const paymentWhere: Prisma.PaymentWhereInput = {
        customerId: customer.id,
        tenantId: effectiveTenantId,
        paymentType: PaymentType.CUSTOMER_RECEIPT,
        ...(startDate || endDate
          ? {
              paymentDate: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      };

      const payments = await client.payment.findMany({
        where: paymentWhere,
      });

      let totalReceived = 0;
      const byMode: Record<string, number> = {};

      for (const p of payments) {
        const pAmount = Number(p.amount) || 0;
        totalReceived += pAmount;
        byMode[p.paymentMode] = (byMode[p.paymentMode] || 0) + pAmount;
      }

      // Ledger Account
      const ledgerAccount = await client.ledgerAccount.findFirst({
        where: {
          customerId: customer.id,
          accountType: AccountType.CUSTOMER,
        },
      });

      const currentBalance = Number(ledgerAccount?.currentBalance) || 0;
      const custQty = Number(saleAgg._sum.quantity) || 0;
      const custAmount = Number(saleAgg._sum.totalAmount) || 0;

      grandMilkQty += custQty;
      grandSalesAmount += custAmount;
      grandReceivedAmount += totalReceived;
      grandOutstandingReceivable += currentBalance;

      items.push({
        customer: {
          id: customer.id,
          customerCode: customer.customerCode,
          name: customer.name,
          customerType: customer.customerType,
          phone: customer.phone,
          status: customer.status,
        },
        salesSummary: {
          totalQuantity: custQty,
          totalAmount: custAmount,
          salesCount: saleCount,
        },
        paymentSummary: {
          totalReceived,
          paymentCount: payments.length,
          byMode,
        },
        outstandingBalance: {
          totalBilled: custAmount,
          totalPaid: totalReceived,
          currentBalance,
        },
      });
    }

    const summary = {
      totalCustomers: total,
      totalMilkSold: Number(grandMilkQty.toFixed(2)),
      totalSalesAmount: Number(grandSalesAmount.toFixed(2)),
      totalReceivedFromCustomers: Number(grandReceivedAmount.toFixed(2)),
      totalOutstandingReceivable: Number(grandOutstandingReceivable.toFixed(2)),
    };

    const result = this.formatPaginatedResult(items, total, page, limit);

    return {
      ...result,
      summary,
    };
  }

  // ==========================================
  // 5. FINANCIAL REPORT
  // ==========================================
  public async getFinancialReport(
    params: FinancialReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<FinancialReportDto & { pagination: any }> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;

    // 1. Ledger Summary
    const ledgerWhere: Prisma.LedgerAccountWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.accountType ? { accountType: params.accountType } : {}),
      ...(params.partyId
        ? {
            OR: [{ farmerId: params.partyId }, { customerId: params.partyId }],
          }
        : {}),
    };

    const ledgerAccounts = await client.ledgerAccount.findMany({
      where: ledgerWhere,
    });

    const accountIds = ledgerAccounts.map((a) => a.id);

    let totalDebits = 0;
    let totalCredits = 0;
    let netBalance = 0;

    ledgerAccounts.forEach((a) => {
      netBalance += Number(a.currentBalance) || 0;
    });

    if (accountIds.length > 0) {
      const entryAgg = await client.ledgerEntry.groupBy({
        by: ['entryType'],
        where: {
          accountId: { in: accountIds },
          ...(startDate || endDate
            ? {
                transactionDate: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
        _sum: {
          amount: true,
        },
      });

      entryAgg.forEach((g) => {
        if (g.entryType === EntryType.DEBIT) {
          totalDebits = Number(g._sum.amount) || 0;
        } else if (g.entryType === EntryType.CREDIT) {
          totalCredits = Number(g._sum.amount) || 0;
        }
      });
    }

    // 2. Bills Summary
    const billWhere: Prisma.BillWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.partyId
        ? {
            OR: [{ farmerId: params.partyId }, { customerId: params.partyId }],
          }
        : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [bills, billCount, billAgg] = await Promise.all([
      client.bill.findMany({
        where: billWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { farmer: true, customer: true, billItems: true },
      }),
      client.bill.count({ where: billWhere }),
      client.bill.aggregate({
        where: billWhere,
        _sum: {
          grossAmount: true,
          totalDeductions: true,
          totalIncentives: true,
          netAmount: true,
          paidAmount: true,
        },
      }),
    ]);

    // 3. Payments Summary
    const paymentWhere: Prisma.PaymentWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.partyId
        ? {
            OR: [{ farmerId: params.partyId }, { customerId: params.partyId }],
          }
        : {}),
      ...(startDate || endDate
        ? {
            paymentDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [payments, paymentCount, paymentsList] = await Promise.all([
      client.payment.findMany({
        where: paymentWhere,
        skip,
        take,
        orderBy: { paymentDate: 'desc' },
        include: { farmer: true, customer: true },
      }),
      client.payment.count({ where: paymentWhere }),
      client.payment.findMany({ where: paymentWhere }),
    ]);

    let totalPaymentAmount = 0;
    const paymentByMode: Record<string, number> = {};

    paymentsList.forEach((p) => {
      const amt = Number(p.amount) || 0;
      totalPaymentAmount += amt;
      paymentByMode[p.paymentMode] = (paymentByMode[p.paymentMode] || 0) + amt;
    });

    // 4. Adjustments Summary
    const adjustmentWhere: Prisma.FinancialAdjustmentWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params.partyId
        ? {
            OR: [{ farmerId: params.partyId }, { customerId: params.partyId }],
          }
        : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [adjustments, adjustmentCount, adjustmentsList] = await Promise.all([
      client.financialAdjustment.findMany({
        where: adjustmentWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { farmer: true, customer: true, bill: true },
      }),
      client.financialAdjustment.count({ where: adjustmentWhere }),
      client.financialAdjustment.findMany({ where: adjustmentWhere }),
    ]);

    let adjIncentives = 0;
    let adjDeductions = 0;
    let adjCreditNotes = 0;
    let adjDebitNotes = 0;

    adjustmentsList.forEach((a) => {
      const amt = Number(a.amount) || 0;
      if (a.adjustmentType === AdjustmentType.INCENTIVE) adjIncentives += amt;
      else if (a.adjustmentType === AdjustmentType.DEDUCTION) adjDeductions += amt;
      else if (a.adjustmentType === AdjustmentType.CREDIT_NOTE) adjCreditNotes += amt;
      else if (a.adjustmentType === AdjustmentType.DEBIT_NOTE) adjDebitNotes += amt;
    });

    return {
      ledgerSummary: {
        totalDebits: Number(totalDebits.toFixed(2)),
        totalCredits: Number(totalCredits.toFixed(2)),
        netBalance: Number(netBalance.toFixed(2)),
        accountCount: ledgerAccounts.length,
      },
      billsSummary: {
        totalGrossAmount: Number(billAgg._sum.grossAmount) || 0,
        totalDeductions: Number(billAgg._sum.totalDeductions) || 0,
        totalIncentives: Number(billAgg._sum.totalIncentives) || 0,
        totalNetAmount: Number(billAgg._sum.netAmount) || 0,
        totalPaidAmount: Number(billAgg._sum.paidAmount) || 0,
        billCount,
      },
      paymentsSummary: {
        totalAmount: Number(totalPaymentAmount.toFixed(2)),
        paymentCount,
        byMode: paymentByMode,
      },
      adjustmentsSummary: {
        totalIncentives: Number(adjIncentives.toFixed(2)),
        totalDeductions: Number(adjDeductions.toFixed(2)),
        totalCreditNotes: Number(adjCreditNotes.toFixed(2)),
        totalDebitNotes: Number(adjDebitNotes.toFixed(2)),
        adjustmentCount,
      },
      bills,
      payments,
      adjustments,
      pagination: {
        total: billCount,
        page,
        limit,
        totalPages: Math.ceil(billCount / limit) || 1,
      },
    };
  }

  // ==========================================
  // 6. INVENTORY REPORT
  // ==========================================
  public async getInventoryReport(
    params: InventoryReportFilter,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<InventoryReportDto & { pagination: any }> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);

    // 1. Current Stock Summary
    const inventoryResult = await inventoryRepository.getInventorySummary(
      {
        page: params.page || 1,
        limit: params.limit || 50,
        productId: params.productId,
        category: params.category,
      },
      effectiveTenantId,
      effectiveBranchId,
      tx
    );

    const totalStockValue = inventoryResult.data.reduce((sum, item) => sum + (Number(item.stockValue) || 0), 0);

    // 2. Stock Movements Summary
    const movementsResult = await stockMovementRepository.findMany(
      {
        productId: params.productId,
        startDate: params.startDate,
        endDate: params.endDate,
        page: 1,
        limit: 10000,
      },
      effectiveTenantId,
      effectiveBranchId,
      tx
    );

    let totalPurchases = 0;
    let totalSales = 0;
    let totalAdjustmentsIn = 0;
    let totalAdjustmentsOut = 0;
    let totalDamages = 0;

    movementsResult.data.forEach((m) => {
      const qty = Number(m.quantity) || 0;
      switch (m.movementType) {
        case 'PURCHASE':
          totalPurchases += qty;
          break;
        case 'SALE':
          totalSales += qty;
          break;
        case 'ADJUSTMENT_IN':
        case 'RETURN_IN':
        case 'OPENING_STOCK':
          totalAdjustmentsIn += qty;
          break;
        case 'ADJUSTMENT_OUT':
        case 'RETURN_OUT':
          totalAdjustmentsOut += qty;
          break;
        case 'DAMAGE':
          totalDamages += qty;
          break;
      }
    });

    return {
      stockSummary: {
        totalProducts: inventoryResult.total,
        totalStockValue: Number(totalStockValue.toFixed(2)),
        items: inventoryResult.data,
      },
      movementsSummary: {
        totalPurchases: Number(totalPurchases.toFixed(2)),
        totalSales: Number(totalSales.toFixed(2)),
        totalAdjustmentsIn: Number(totalAdjustmentsIn.toFixed(2)),
        totalAdjustmentsOut: Number(totalAdjustmentsOut.toFixed(2)),
        totalDamages: Number(totalDamages.toFixed(2)),
        movementCount: movementsResult.total,
      },
      purchasesSummary: {
        totalPurchasedQty: Number(totalPurchases.toFixed(2)),
        totalPurchaseAmount: 0,
        purchaseCount: movementsResult.data.filter((m) => m.movementType === 'PURCHASE').length,
      },
      salesSummary: {
        totalSoldQty: Number(totalSales.toFixed(2)),
        totalSalesAmount: 0,
        salesCount: movementsResult.data.filter((m) => m.movementType === 'SALE').length,
      },
      pagination: {
        total: inventoryResult.total,
        page: inventoryResult.page,
        limit: inventoryResult.limit,
        totalPages: inventoryResult.totalPages,
      },
    };
  }
}

export const reportsRepository = new ReportsRepository();
