import { FinancialAdjustment, AdjustmentType, Prisma, AccountType, EntryType } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { AdjustmentRepository, adjustmentRepository } from '../repositories/adjustment.repository';
import { ledgerService } from './ledger.service';
import { auditLogRepository } from '../../system/repositories/audit-log.repository';
import { NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class AdjustmentService extends BaseService {
  constructor(private readonly repo: AdjustmentRepository = adjustmentRepository) {
    super();
  }

  public async getAdjustmentById(id: string, tenantId?: string, tx?: DbClient): Promise<FinancialAdjustment> {
    const adjustment = await this.repo.findById(id, tenantId, tx);
    if (!adjustment) {
      throw new NotFoundError(`Financial adjustment ${id} not found.`);
    }
    return adjustment;
  }

  public async listAdjustments(
    params?: PaginationParams & {
      farmerId?: string;
      customerId?: string;
      billId?: string;
      adjustmentType?: AdjustmentType;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<FinancialAdjustment>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async recordAdjustment(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      adjustmentType: AdjustmentType;
      adjustmentNumber?: string;
      farmerId?: string;
      customerId?: string;
      billId?: string;
      amount: Prisma.Decimal | number;
      reason: string;
      approvedBy?: string;
      userId?: string;
    },
    tx?: DbClient
  ): Promise<FinancialAdjustment> {
    if (Number(data.amount) <= 0) {
      throw new DomainValidationError('Adjustment amount must be greater than zero.');
    }
    if (!data.reason || !data.reason.trim()) {
      throw new DomainValidationError('Reason is required for financial adjustment.');
    }
    if (!data.farmerId && !data.customerId) {
      throw new DomainValidationError('Either Farmer ID or Customer ID is required for adjustment.');
    }

    const generatedNumber =
      data.adjustmentNumber?.trim().toUpperCase() ||
      `ADJ-${Date.now().toString().slice(-8)}`;

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByAdjustmentNumber(generatedNumber, data.branchId, transactionClient);
      if (existing) {
        throw new DomainValidationError(`Adjustment number '${generatedNumber}' already exists in this branch.`);
      }

      const adjustment = await this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          adjustmentType: data.adjustmentType,
          adjustmentNumber: generatedNumber,
          farmerId: data.farmerId || null,
          customerId: data.customerId || null,
          billId: data.billId || null,
          amount: data.amount,
          reason: data.reason.trim(),
          approvedBy: data.approvedBy || null,
        },
        transactionClient
      );

      // Create Ledger Entry Impact
      const accountType = data.farmerId ? AccountType.FARMER : AccountType.CUSTOMER;
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

      const isCreditType =
        data.adjustmentType === AdjustmentType.CREDIT_NOTE ||
        data.adjustmentType === AdjustmentType.INCENTIVE;
      const entryType = isCreditType ? EntryType.CREDIT : EntryType.DEBIT;

      const description = `Adjustment (${data.adjustmentType}): ${data.reason.trim()}`;

      await ledgerService.postEntry(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          accountId: account.id,
          entryType,
          amount: data.amount,
          transactionDate: new Date(),
          referenceType: 'ADJUSTMENT',
          referenceId: adjustment.id,
          description,
        },
        transactionClient
      );

      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          userId: data.userId,
          action: 'ADJUSTMENT',
          entity: 'FinancialAdjustment',
          entityId: adjustment.id,
          details: {
            adjustmentNumber: adjustment.adjustmentNumber,
            adjustmentType: data.adjustmentType,
            amount: Number(data.amount),
            reason: data.reason,
          },
        },
        transactionClient
      );

      return adjustment;
    }, tx);
  }
}

export const adjustmentService = new AdjustmentService();
