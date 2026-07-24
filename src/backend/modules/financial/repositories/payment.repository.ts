import { Payment, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class PaymentRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<Payment | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.payment.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        farmer: true,
        customer: true,
        paymentAllocations: {
          include: { bill: true },
        },
      },
    });
  }

  public async findByPaymentNumber(paymentNumber: string, branchId: string, tx?: DbClient): Promise<Payment | null> {
    const client = this.getClient(tx);

    return client.payment.findUnique({
      where: {
        branchId_paymentNumber: {
          branchId,
          paymentNumber,
        },
      },
    });
  }

  public async findMany(
    params?: PaginationParams & {
      farmerId?: string;
      customerId?: string;
      paymentType?: Prisma.EnumPaymentTypeFilter | any;
      status?: Prisma.EnumPaymentStatusFilter | any;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Payment>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.PaymentWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      ...(params?.farmerId ? { farmerId: params.farmerId } : {}),
      ...(params?.customerId ? { customerId: params.customerId } : {}),
      ...(params?.paymentType ? { paymentType: params.paymentType } : {}),
      ...(params?.status ? { status: params.status } : {}),
    };

    const [data, total] = await Promise.all([
      client.payment.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { paymentDate: 'desc' },
        include: {
          farmer: true,
          customer: true,
          paymentAllocations: true,
        },
      }),
      client.payment.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(
    data: Prisma.PaymentUncheckedCreateInput,
    allocations?: Prisma.PaymentAllocationCreateWithoutPaymentInput[],
    tx?: DbClient
  ): Promise<Payment> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.payment.create({
      data: {
        ...data,
        tenantId,
        ...(allocations && allocations.length > 0
          ? {
              paymentAllocations: {
                create: allocations,
              },
            }
          : {}),
      },
      include: {
        paymentAllocations: true,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.PaymentUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Payment> {
    const client = this.getClient(tx);

    return client.payment.update({
      where: { id },
      data,
      include: {
        paymentAllocations: true,
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();
