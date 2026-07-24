import { LedgerAccount, LedgerEntry, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class LedgerRepository extends BaseRepository {
  public async findAccountById(id: string, tenantId?: string, tx?: DbClient): Promise<LedgerAccount | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.ledgerAccount.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        farmer: true,
        customer: true,
      },
    });
  }

  public async findAccountByCode(accountCode: string, branchId: string, tx?: DbClient): Promise<LedgerAccount | null> {
    const client = this.getClient(tx);

    return client.ledgerAccount.findUnique({
      where: {
        branchId_accountCode: {
          branchId,
          accountCode,
        },
      },
    });
  }

  public async findAccountByParty(
    partyType: 'FARMER' | 'CUSTOMER',
    partyId: string,
    tx?: DbClient
  ): Promise<LedgerAccount | null> {
    const client = this.getClient(tx);

    return client.ledgerAccount.findFirst({
      where: {
        ...(partyType === 'FARMER' ? { farmerId: partyId } : { customerId: partyId }),
      },
    });
  }

  public async createAccount(data: Prisma.LedgerAccountUncheckedCreateInput, tx?: DbClient): Promise<LedgerAccount> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.ledgerAccount.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  public async updateAccountBalance(
    accountId: string,
    newBalance: Prisma.Decimal | number,
    tx?: DbClient
  ): Promise<LedgerAccount> {
    const client = this.getClient(tx);

    return client.ledgerAccount.update({
      where: { id: accountId },
      data: { currentBalance: newBalance },
    });
  }

  public async createEntry(data: Prisma.LedgerEntryUncheckedCreateInput, tx?: DbClient): Promise<LedgerEntry> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.ledgerEntry.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  public async findEntriesByAccount(
    accountId: string,
    params?: PaginationParams,
    tx?: DbClient
  ): Promise<PaginatedResult<LedgerEntry>> {
    const client = this.getClient(tx);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.LedgerEntryWhereInput = { accountId };

    const [data, total] = await Promise.all([
      client.ledgerEntry.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { transactionDate: 'desc' },
      }),
      client.ledgerEntry.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }
}

export const ledgerRepository = new LedgerRepository();
