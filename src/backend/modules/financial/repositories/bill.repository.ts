import { Bill, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class BillRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<Bill | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.bill.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        farmer: true,
        customer: true,
        billItems: true,
        paymentAllocations: {
          include: { payment: true },
        },
      },
    });
  }

  public async findByBillNumber(billNumber: string, branchId: string, tx?: DbClient): Promise<Bill | null> {
    const client = this.getClient(tx);

    return client.bill.findUnique({
      where: {
        branchId_billNumber: {
          branchId,
          billNumber,
        },
      },
      include: {
        billItems: true,
      },
    });
  }

  public async findMany(
    params?: PaginationParams & {
      farmerId?: string;
      customerId?: string;
      billType?: Prisma.EnumBillTypeFilter | any;
      status?: Prisma.EnumBillStatusFilter | any;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Bill>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.BillWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params?.farmerId ? { farmerId: params.farmerId } : {}),
      ...(params?.customerId ? { customerId: params.customerId } : {}),
      ...(params?.billType ? { billType: params.billType } : {}),
      ...(params?.status ? { status: params.status } : {}),
    };

    const [data, total] = await Promise.all([
      client.bill.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
        include: {
          farmer: true,
          customer: true,
        },
      }),
      client.bill.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(
    data: Prisma.BillUncheckedCreateInput,
    items?: Prisma.BillItemCreateWithoutBillInput[],
    tx?: DbClient
  ): Promise<Bill> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.bill.create({
      data: {
        ...data,
        tenantId,
        ...(items && items.length > 0
          ? {
              billItems: {
                create: items,
              },
            }
          : {}),
      },
      include: {
        billItems: true,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.BillUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Bill> {
    const client = this.getClient(tx);

    return client.bill.update({
      where: { id },
      data,
      include: {
        billItems: true,
      },
    });
  }
}

export const billRepository = new BillRepository();
