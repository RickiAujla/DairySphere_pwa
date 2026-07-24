import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';
import { ProductSaleRecord } from '../dto/inventory.dto';
import { randomUUID } from 'crypto';

const inMemoryProductSales: ProductSaleRecord[] = [];

export class ProductSaleRepository extends BaseRepository {
  public async create(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      saleNumber: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      totalAmount: number;
      customerName?: string;
      customerId?: string;
      saleDate?: Date;
      remarks?: string;
      userId?: string;
    },
    tx?: DbClient
  ): Promise<ProductSaleRecord> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    const record: ProductSaleRecord = {
      id: randomUUID(),
      tenantId,
      companyId: data.companyId,
      branchId: data.branchId,
      saleNumber: data.saleNumber,
      productId: data.productId,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unitPrice),
      totalAmount: Number(data.totalAmount),
      customerName: data.customerName,
      customerId: data.customerId,
      saleDate: data.saleDate || new Date(),
      remarks: data.remarks,
      userId: data.userId,
      createdAt: new Date(),
    };

    if (client && typeof (client as any).productSale?.create === 'function') {
      try {
        const created = await (client as any).productSale.create({ data: record });
        inMemoryProductSales.push(created);
        return created;
      } catch {
        inMemoryProductSales.push(record);
        return record;
      }
    } else {
      inMemoryProductSales.push(record);
      return record;
    }
  }

  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<ProductSaleRecord | null> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    return inMemoryProductSales.find((s) => s.id === id && s.tenantId === effectiveTenantId) || null;
  }

  public async findBySaleNumber(
    saleNumber: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<ProductSaleRecord | null> {
    return (
      inMemoryProductSales.find(
        (s) =>
          s.saleNumber.toLowerCase() === saleNumber.toLowerCase() &&
          (!branchId || s.branchId === branchId)
      ) || null
    );
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<ProductSaleRecord>> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { page, limit, skip } = this.getPaginationOptions(params);

    const filtered = inMemoryProductSales.filter((s) => {
      if (s.tenantId !== effectiveTenantId) return false;
      if (effectiveBranchId && s.branchId !== effectiveBranchId) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paginated = filtered.slice(skip, skip + limit);
    return this.formatPaginatedResult(paginated, filtered.length, page, limit);
  }
}

export const productSaleRepository = new ProductSaleRepository();
