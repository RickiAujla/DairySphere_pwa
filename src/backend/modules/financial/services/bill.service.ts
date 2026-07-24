import { Bill, BillType, BillStatus, Prisma, AccountType, EntryType } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { BillRepository, billRepository } from '../repositories/bill.repository';
import { ledgerService } from './ledger.service';
import { auditLogRepository } from '../../system/repositories/audit-log.repository';
import { financialRevisionRepository } from '../repositories/financial-revision.repository';
import { NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class BillService extends BaseService {
  constructor(private readonly repo: BillRepository = billRepository) {
    super();
  }

  public async getBillById(id: string, tenantId?: string, tx?: DbClient): Promise<Bill> {
    const bill = await this.repo.findById(id, tenantId, tx);
    if (!bill) {
      throw new NotFoundError(`Bill ${id} not found.`);
    }
    return bill;
  }

  public async listBills(
    params?: PaginationParams & {
      farmerId?: string;
      customerId?: string;
      billType?: BillType;
      status?: BillStatus;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Bill>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async generateBill(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      billType: BillType;
      billNumber?: string;
      farmerId?: string;
      customerId?: string;
      periodStart: Date;
      periodEnd: Date;
      totalDeductions?: number;
      totalIncentives?: number;
      remarks?: string;
    },
    tx?: DbClient
  ): Promise<Bill> {
    if (data.billType === BillType.FARMER_BILL && !data.farmerId) {
      throw new DomainValidationError('Farmer ID is required for farmer bill generation.');
    }
    if (data.billType === BillType.CUSTOMER_INVOICE && !data.customerId) {
      throw new DomainValidationError('Customer ID is required for customer invoice generation.');
    }

    return this.withTransaction(async (transactionClient) => {
      let grossAmount = 0;
      const items: {
        itemType: string;
        referenceId?: string;
        description: string;
        quantity?: number;
        rate?: number;
        amount: number;
      }[] = [];

      if (data.billType === BillType.FARMER_BILL && data.farmerId) {
        const collections = await transactionClient.milkCollection.findMany({
          where: {
            tenantId: data.tenantId,
            branchId: data.branchId,
            farmerId: data.farmerId,
            collectionDate: {
              gte: data.periodStart,
              lte: data.periodEnd,
            },
          },
          orderBy: { collectionDate: 'asc' },
        });

        for (const col of collections) {
          const colAmount = Number(col.totalAmount);
          const qty = Number(col.quantity);
          grossAmount += colAmount;
          items.push({
            itemType: 'MILK_COLLECTION',
            referenceId: col.id,
            description: `Milk Intake ${col.collectionDate.toISOString().split('T')[0]} - ${col.shift} (${qty}L)`,
            quantity: qty,
            rate: qty > 0 ? colAmount / qty : 0,
            amount: colAmount,
          });
        }
      } else if (data.billType === BillType.CUSTOMER_INVOICE && data.customerId) {
        const sales = await transactionClient.milkSale.findMany({
          where: {
            tenantId: data.tenantId,
            branchId: data.branchId,
            customerId: data.customerId,
            saleDate: {
              gte: data.periodStart,
              lte: data.periodEnd,
            },
          },
          orderBy: { saleDate: 'asc' },
        });

        for (const sale of sales) {
          const saleAmount = Number(sale.totalAmount);
          const qty = Number(sale.quantity);
          grossAmount += saleAmount;
          items.push({
            itemType: 'MILK_SALE',
            referenceId: sale.id,
            description: `Milk Sale ${sale.saleDate.toISOString().split('T')[0]} - ${sale.shift} (${qty}L)`,
            quantity: qty,
            rate: qty > 0 ? saleAmount / qty : 0,
            amount: saleAmount,
          });
        }
      }

      const totalDeductions = Number(data.totalDeductions || 0);
      const totalIncentives = Number(data.totalIncentives || 0);
      const netAmount = grossAmount + totalIncentives - totalDeductions;

      const generatedBillNumber =
        data.billNumber?.trim().toUpperCase() ||
        `${data.billType === BillType.FARMER_BILL ? 'BILL' : 'INV'}-${Date.now().toString().slice(-8)}`;

      const existing = await this.repo.findByBillNumber(generatedBillNumber, data.branchId, transactionClient);
      if (existing) {
        throw new DomainValidationError(`Bill number '${generatedBillNumber}' already exists in this branch.`);
      }

      const bill = await this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          billType: data.billType,
          billNumber: generatedBillNumber,
          farmerId: data.farmerId || null,
          customerId: data.customerId || null,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          grossAmount,
          totalDeductions,
          totalIncentives,
          netAmount,
          paidAmount: 0,
          status: BillStatus.DRAFT,
          isFinalized: false,
          revisionNumber: 1,
        },
        items,
        transactionClient
      );

      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          action: 'CREATE',
          entity: 'Bill',
          entityId: bill.id,
          details: {
            billNumber: generatedBillNumber,
            billType: data.billType,
            netAmount,
            grossAmount,
            periodStart: data.periodStart,
            periodEnd: data.periodEnd,
          },
        },
        transactionClient
      );

      return bill;
    }, tx);
  }

  public async finalizeBill(
    id: string,
    tenantId: string,
    userId?: string,
    tx?: DbClient
  ): Promise<Bill> {
    return this.withTransaction(async (transactionClient) => {
      const bill = await this.getBillById(id, tenantId, transactionClient);

      if (bill.isFinalized || bill.status === BillStatus.FINALIZED) {
        throw new DomainValidationError(`Bill ${bill.billNumber} is already finalized.`);
      }

      const updatedBill = await this.repo.update(
        id,
        {
          isFinalized: true,
          status: BillStatus.FINALIZED,
          finalizedAt: new Date(),
        },
        tenantId,
        transactionClient
      );

      // Create Ledger Entry Impact
      const accountType = bill.billType === BillType.FARMER_BILL ? AccountType.FARMER : AccountType.CUSTOMER;
      const account = await ledgerService.getOrCreatePartyAccount(
        {
          tenantId: bill.tenantId,
          companyId: bill.companyId,
          branchId: bill.branchId,
          accountType,
          farmerId: bill.farmerId || undefined,
          customerId: bill.customerId || undefined,
        },
        transactionClient
      );

      const entryType = bill.billType === BillType.FARMER_BILL ? EntryType.CREDIT : EntryType.DEBIT;
      const description = `Finalized ${bill.billType === BillType.FARMER_BILL ? 'Farmer Bill' : 'Customer Invoice'} ${bill.billNumber}`;

      await ledgerService.postEntry(
        {
          tenantId: bill.tenantId,
          companyId: bill.companyId,
          branchId: bill.branchId,
          accountId: account.id,
          entryType,
          amount: bill.netAmount,
          transactionDate: new Date(),
          referenceType: 'BILL',
          referenceId: bill.id,
          description,
        },
        transactionClient
      );

      await auditLogRepository.log(
        {
          tenantId: bill.tenantId,
          userId,
          action: 'FINALIZE',
          entity: 'Bill',
          entityId: bill.id,
          details: {
            billNumber: bill.billNumber,
            netAmount: Number(bill.netAmount),
          },
        },
        transactionClient
      );

      return updatedBill;
    }, tx);
  }

  public async reviseBill(
    id: string,
    data: {
      tenantId: string;
      reason: string;
      revisedBy?: string;
      totalDeductions?: number;
      totalIncentives?: number;
    },
    tx?: DbClient
  ): Promise<Bill> {
    if (!data.reason || !data.reason.trim()) {
      throw new DomainValidationError('Reason is required for bill revision.');
    }

    return this.withTransaction(async (transactionClient) => {
      const existingBill = await this.getBillById(id, data.tenantId, transactionClient);

      const currentRevision = existingBill.revisionNumber || 1;
      const newRevisionNumber = currentRevision + 1;

      const newDeductions = data.totalDeductions !== undefined ? data.totalDeductions : Number(existingBill.totalDeductions);
      const newIncentives = data.totalIncentives !== undefined ? data.totalIncentives : Number(existingBill.totalIncentives);
      const gross = Number(existingBill.grossAmount);
      const newNet = gross + newIncentives - newDeductions;

      const updatedBill = await this.repo.update(
        id,
        {
          totalDeductions: newDeductions,
          totalIncentives: newIncentives,
          netAmount: newNet,
          revisionNumber: newRevisionNumber,
          status: existingBill.isFinalized ? BillStatus.REVISED : existingBill.status,
        },
        data.tenantId,
        transactionClient
      );

      await financialRevisionRepository.create(
        {
          entityName: 'Bill',
          entityId: id,
          revisionNumber: newRevisionNumber,
          previousData: JSON.parse(JSON.stringify(existingBill)),
          newData: JSON.parse(JSON.stringify(updatedBill)),
          reason: data.reason.trim(),
          revisedBy: data.revisedBy,
        },
        transactionClient
      );

      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          userId: data.revisedBy,
          action: 'REVISION',
          entity: 'Bill',
          entityId: id,
          details: {
            billNumber: existingBill.billNumber,
            revisionNumber: newRevisionNumber,
            reason: data.reason,
            oldNetAmount: Number(existingBill.netAmount),
            newNetAmount: newNet,
          },
        },
        transactionClient
      );

      return updatedBill;
    }, tx);
  }
}

export const billService = new BillService();
