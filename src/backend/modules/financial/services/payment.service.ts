import { Payment, PaymentType, PaymentMode, PaymentStatus, Prisma, AccountType, EntryType, BillStatus } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { PaymentRepository, paymentRepository } from '../repositories/payment.repository';
import { ledgerService } from './ledger.service';
import { billRepository } from '../repositories/bill.repository';
import { auditLogRepository } from '../../system/repositories/audit-log.repository';
import { NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class PaymentService extends BaseService {
  constructor(private readonly repo: PaymentRepository = paymentRepository) {
    super();
  }

  public async getPaymentById(id: string, tenantId?: string, tx?: DbClient): Promise<Payment> {
    const payment = await this.repo.findById(id, tenantId, tx);
    if (!payment) {
      throw new NotFoundError(`Payment ${id} not found.`);
    }
    return payment;
  }

  public async listPayments(
    params?: PaginationParams & {
      farmerId?: string;
      customerId?: string;
      paymentType?: PaymentType;
      status?: PaymentStatus;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Payment>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async recordPayment(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      paymentType: PaymentType;
      paymentNumber?: string;
      farmerId?: string;
      customerId?: string;
      amount: Prisma.Decimal | number;
      paymentMode: PaymentMode;
      paymentDate?: Date;
      referenceNumber?: string;
      remarks?: string;
      userId?: string;
      allocations?: {
        billId: string;
        amountAllocated: Prisma.Decimal | number;
      }[];
    },
    tx?: DbClient
  ): Promise<Payment> {
    if (Number(data.amount) <= 0) {
      throw new DomainValidationError('Payment amount must be greater than zero.');
    }
    if (data.paymentType === PaymentType.FARMER_PAYMENT && !data.farmerId) {
      throw new DomainValidationError('Farmer ID is required for farmer payment.');
    }
    if (data.paymentType === PaymentType.CUSTOMER_RECEIPT && !data.customerId) {
      throw new DomainValidationError('Customer ID is required for customer receipt.');
    }

    const generatedNumber =
      data.paymentNumber?.trim().toUpperCase() ||
      `${data.paymentType === PaymentType.FARMER_PAYMENT ? 'PAY' : 'REC'}-${Date.now().toString().slice(-8)}`;

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByPaymentNumber(generatedNumber, data.branchId, transactionClient);
      if (existing) {
        throw new DomainValidationError(`Payment number '${generatedNumber}' already exists in this branch.`);
      }

      const payment = await this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          paymentType: data.paymentType,
          paymentNumber: generatedNumber,
          farmerId: data.farmerId || null,
          customerId: data.customerId || null,
          amount: data.amount,
          paymentMode: data.paymentMode,
          paymentDate: data.paymentDate || new Date(),
          status: PaymentStatus.COMPLETED,
          referenceNumber: data.referenceNumber?.trim() || null,
          remarks: data.remarks?.trim() || null,
        },
        data.allocations,
        transactionClient
      );

      // Process allocations to bills
      if (data.allocations && data.allocations.length > 0) {
        for (const alloc of data.allocations) {
          const bill = await billRepository.findById(alloc.billId, data.tenantId, transactionClient);
          if (bill) {
            const currentPaid = Number(bill.paidAmount || 0);
            const netAmt = Number(bill.netAmount || 0);
            const newlyAllocated = Number(alloc.amountAllocated);
            const updatedPaid = currentPaid + newlyAllocated;

            let newStatus = bill.status;
            if (updatedPaid >= netAmt) {
              newStatus = BillStatus.PAID;
            } else if (updatedPaid > 0) {
              newStatus = BillStatus.PARTIALLY_PAID;
            }

            await billRepository.update(
              bill.id,
              {
                paidAmount: updatedPaid,
                status: newStatus,
              },
              data.tenantId,
              transactionClient
            );
          }
        }
      }

      // Create Ledger Entry Impact
      const accountType = data.paymentType === PaymentType.FARMER_PAYMENT ? AccountType.FARMER : AccountType.CUSTOMER;
      const account = await ledgerService.getOrCreatePartyAccount(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          accountType,
          farmerId: data.farmerId || undefined,
          customerId: data.customerId || undefined,
        },
        transactionClient
      );

      const entryType = data.paymentType === PaymentType.FARMER_PAYMENT ? EntryType.DEBIT : EntryType.CREDIT;
      const description = `${data.paymentType === PaymentType.FARMER_PAYMENT ? 'Farmer Payment' : 'Customer Receipt'} ${payment.paymentNumber} (${data.paymentMode})`;

      await ledgerService.postEntry(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          accountId: account.id,
          entryType,
          amount: data.amount,
          transactionDate: payment.paymentDate,
          referenceType: 'PAYMENT',
          referenceId: payment.id,
          description,
        },
        transactionClient
      );

      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          userId: data.userId,
          action: 'PAYMENT',
          entity: 'Payment',
          entityId: payment.id,
          details: {
            paymentNumber: payment.paymentNumber,
            paymentType: data.paymentType,
            amount: Number(data.amount),
            paymentMode: data.paymentMode,
          },
        },
        transactionClient
      );

      return payment;
    }, tx);
  }
}

export const paymentService = new PaymentService();
