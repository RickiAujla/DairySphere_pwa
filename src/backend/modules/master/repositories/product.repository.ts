import { Product, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class ProductRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<Product | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.product.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
    });
  }

  public async findByCode(productCode: string, companyId: string, tx?: DbClient): Promise<Product | null> {
    const client = this.getClient(tx);

    return client.product.findUnique({
      where: {
        companyId_productCode: {
          companyId,
          productCode,
        },
      },
    });
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    companyId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Product>> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.ProductWhereInput = {
      tenantId: effectiveTenantId,
      ...(companyId ? { companyId } : {}),
    };

    const [data, total] = await Promise.all([
      client.product.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
      }),
      client.product.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(data: Prisma.ProductUncheckedCreateInput, tx?: DbClient): Promise<Product> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.product.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.ProductUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Product> {
    const client = this.getClient(tx);

    return client.product.update({
      where: { id },
      data,
    });
  }
}

export const productRepository = new ProductRepository();
