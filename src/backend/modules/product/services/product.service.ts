import { Product, Prisma, ProductStatus } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { ProductRepository, productRepository } from '../../master/repositories/product.repository';
import { auditLogRepository } from '../../system/repositories/audit-log.repository';
import { ConflictError, NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class ProductService extends BaseService {
  constructor(private readonly repo: ProductRepository = productRepository) {
    super();
  }

  public async getProductById(id: string, tenantId?: string, tx?: DbClient): Promise<Product> {
    const product = await this.repo.findById(id, tenantId, tx);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found.`);
    }
    return product;
  }

  public async listProducts(
    params?: PaginationParams,
    tenantId?: string,
    companyId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Product>> {
    return this.repo.findMany(params, tenantId, companyId, tx);
  }

  public async createProduct(
    data: {
      tenantId: string;
      companyId: string;
      productCode: string;
      name: string;
      category: string;
      unitOfMeasure: string;
      basePrice: Prisma.Decimal | number;
      taxRate?: Prisma.Decimal | number;
      userId?: string;
    },
    tx?: DbClient
  ): Promise<Product> {
    if (!data.productCode || !data.productCode.trim()) {
      throw new DomainValidationError('Product code is required.');
    }
    if (!data.name || !data.name.trim()) {
      throw new DomainValidationError('Product name is required.');
    }

    const uppercaseCode = data.productCode.trim().toUpperCase();

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByCode(uppercaseCode, data.companyId, transactionClient);
      if (existing) {
        throw new ConflictError(`Product with code '${uppercaseCode}' already exists for this company.`);
      }

      const product = await this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          productCode: uppercaseCode,
          name: data.name.trim(),
          category: data.category.trim(),
          unitOfMeasure: data.unitOfMeasure.trim(),
          basePrice: data.basePrice,
          taxRate: data.taxRate ?? 0,
        },
        transactionClient
      );

      await auditLogRepository.log(
        {
          tenantId: data.tenantId,
          userId: data.userId,
          action: 'CREATE',
          entity: 'Product',
          entityId: product.id,
          details: {
            productCode: product.productCode,
            name: product.name,
            category: product.category,
            basePrice: Number(product.basePrice),
          },
        },
        transactionClient
      );

      return product;
    }, tx);
  }

  public async updateProduct(
    id: string,
    data: Prisma.ProductUpdateInput,
    tenantId?: string,
    userId?: string,
    tx?: DbClient
  ): Promise<Product> {
    const existing = await this.getProductById(id, tenantId, tx);

    return this.withTransaction(async (transactionClient) => {
      const updated = await this.repo.update(id, data, tenantId, transactionClient);

      await auditLogRepository.log(
        {
          tenantId: existing.tenantId,
          userId,
          action: 'UPDATE',
          entity: 'Product',
          entityId: id,
          details: JSON.parse(
            JSON.stringify({
              productCode: existing.productCode,
              name: existing.name,
              changes: data,
            })
          ),
        },
        transactionClient
      );

      return updated;
    }, tx);
  }

  public async deleteProduct(
    id: string,
    tenantId?: string,
    userId?: string,
    tx?: DbClient
  ): Promise<Product> {
    const existing = await this.getProductById(id, tenantId, tx);

    return this.withTransaction(async (transactionClient) => {
      const updated = await this.repo.update(
        id,
        { status: ProductStatus.INACTIVE },
        tenantId,
        transactionClient
      );

      await auditLogRepository.log(
        {
          tenantId: existing.tenantId,
          userId,
          action: 'DELETE',
          entity: 'Product',
          entityId: id,
          details: {
            productCode: existing.productCode,
            name: existing.name,
            status: ProductStatus.INACTIVE,
          },
        },
        transactionClient
      );

      return updated;
    }, tx);
  }
}

export const productService = new ProductService();
