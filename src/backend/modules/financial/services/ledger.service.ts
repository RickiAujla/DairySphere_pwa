import { LedgerAccount, LedgerEntry, Prisma, AccountType, EntryType } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { LedgerRepository, ledgerRepository } from '../repositories/ledger.repository';
import { NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class LedgerService extends BaseService {
  constructor(private readonly repo: LedgerRepository = ledgerRepository) {
    super();
  }

  public async getAccountById(id: string, tenantId?: string, tx?: DbClient): Promise<LedgerAccount> {
    const account = await this.repo.findAccountById(id, tenantId, tx);
    if (!account) {
      throw new NotFoundError(`Ledger account ${id} not found.`);
    }
    return account;
  }

  public async createAccount(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      accountType: AccountType;
      accountCode: string;
      name: string;
      farmerId?: string;
      customerId?: string;
    },
    tx?: DbClient
  ): Promise<LedgerAccount> {
    if (!data.accountCode || !data.accountCode.trim()) {
      throw new DomainValidationError('Account code is required.');
    }
    if (!data.name || !data.name.trim()) {
      throw new DomainValidationError('Account name is required.');
    }

    return this.repo.createAccount(
      {
        tenantId: data.tenantId,
        companyId: data.companyId,
        branchId: data.branchId,
        accountType: data.accountType,
        accountCode: data.accountCode.trim().toUpperCase(),
        name: data.name.trim(),
        farmerId: data.farmerId || null,
        customerId: data.customerId || null,
        currentBalance: 0,
      },
      tx
    );
  }

  public async postEntry(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      accountId: string;
      entryType: EntryType;
      amount: Prisma.Decimal | number;
      transactionDate: Date;
      referenceType: string;
      referenceId?: string;
      description?: string;
    },
    tx?: DbClient
  ): Promise<LedgerEntry> {
    const amountVal = Number(data.amount);
    if (amountVal <= 0) {
      throw new DomainValidationError('Transaction entry amount must be greater than zero.');
    }

    return this.withTransaction(async (transactionClient) => {
      const account = await this.getAccountById(data.accountId, data.tenantId, transactionClient);
      const currentBal = Number(account.currentBalance);

      // Debit increases balance or decreases liability based on standard book accounting; here balance after calculation
      const balanceDelta = data.entryType === EntryType.DEBIT ? amountVal : -amountVal;
      const newBalance = currentBal + balanceDelta;

      await this.repo.updateAccountBalance(account.id, newBalance, transactionClient);

      return this.repo.createEntry(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          accountId: data.accountId,
          entryType: data.entryType,
          amount: data.amount,
          balanceAfter: newBalance,
          transactionDate: data.transactionDate,
          referenceType: data.referenceType,
          referenceId: data.referenceId || null,
          description: data.description || null,
        },
        transactionClient
      );
    }, tx);
  }

  public async getOrCreatePartyAccount(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      accountType: AccountType;
      farmerId?: string;
      customerId?: string;
      name?: string;
    },
    tx?: DbClient
  ): Promise<LedgerAccount> {
    return this.withTransaction(async (transactionClient) => {
      let existingAccount: LedgerAccount | null = null;
      if (data.farmerId) {
        existingAccount = await this.repo.findAccountByParty('FARMER', data.farmerId, transactionClient);
      } else if (data.customerId) {
        existingAccount = await this.repo.findAccountByParty('CUSTOMER', data.customerId, transactionClient);
      }

      if (existingAccount) {
        return existingAccount;
      }

      const partyId = data.farmerId || data.customerId || 'GEN';
      const codePrefix = data.accountType === AccountType.FARMER ? 'ACC-FMR' : data.accountType === AccountType.CUSTOMER ? 'ACC-CUST' : 'ACC-GEN';
      const accountCode = `${codePrefix}-${partyId.slice(0, 8).toUpperCase()}`;
      const accountName = data.name || `${data.accountType} Account (${partyId.slice(0, 8)})`;

      return this.repo.createAccount(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          accountType: data.accountType,
          accountCode,
          name: accountName,
          farmerId: data.farmerId || null,
          customerId: data.customerId || null,
          currentBalance: 0,
        },
        transactionClient
      );
    }, tx);
  }

  public async getEntriesForAccount(
    accountId: string,
    params?: PaginationParams,
    tx?: DbClient
  ): Promise<PaginatedResult<LedgerEntry>> {
    return this.repo.findEntriesByAccount(accountId, params, tx);
  }
}

export const ledgerService = new LedgerService();
