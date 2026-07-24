import { Customer, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class CustomerRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<Customer | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.customer.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        branch: true,
      },
    });
  }

  public async findByCode(customerCode: string, branchId: string, tx?: DbClient): Promise<Customer | null> {
    const client = this.getClient(tx);

    return client.customer.findUnique({
      where: {
        branchId_customerCode: {
          branchId,
          customerCode,
        },
      },
    });
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Customer>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.CustomerWhereInput = {
      tenantId: effectiveTenantId,
      ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
    };

    const [data, total] = await Promise.all([
      client.customer.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
        include: { branch: true },
      }),
      client.customer.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(data: Prisma.CustomerUncheckedCreateInput, tx?: DbClient): Promise<Customer> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.customer.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.CustomerUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Customer> {
    const client = this.getClient(tx);

    return client.customer.update({
      where: { id },
      data,
    });
  }
}

export const customerRepository = new CustomerRepository();
