import { User, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class UserRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<User | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.user.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        userRoles: {
          include: { role: true },
        },
        userBranchAccesses: {
          include: { branch: true },
        },
      },
    });
  }

  public async findByEmail(email: string, tenantId?: string, tx?: DbClient): Promise<User | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        tenantId: effectiveTenantId,
      },
      include: {
        userRoles: {
          include: { role: true },
        },
        userBranchAccesses: {
          include: { branch: true },
        },
      },
    });
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<User>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.UserWhereInput = { tenantId: effectiveTenantId };

    const [data, total] = await Promise.all([
      client.user.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      }),
      client.user.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(data: Prisma.UserUncheckedCreateInput, tx?: DbClient): Promise<User> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.user.create({
      data: {
        ...data,
        tenantId,
        email: data.email.toLowerCase().trim(),
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.UserUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<User> {
    const client = this.getClient(tx);
    return client.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
