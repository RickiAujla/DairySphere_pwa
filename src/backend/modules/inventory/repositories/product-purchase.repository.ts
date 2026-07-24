import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';
import { ProductPurchaseRecord } from '../dto/inventory.dto';
import { randomUUID } from 'crypto';

const inMemoryProductPurchases: ProductPurchaseRecord[] = [];

export class ProductPurchaseRepository extends BaseRepository {
  public async create(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      purchaseNumber: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      totalAmount: number;
      vendorName?: string;
      purchaseDate?: Date;
      remarks?: string;
      userId?: string;
    },
    tx?: DbClient
  ): Promise<ProductPurchaseRecord> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    const record: ProductPurchaseRecord = {
      id: randomUUID(),
      tenantId,
      companyId: data.companyId,
      branchId: data.branchId,
      purchaseNumber: data.purchaseNumber,
      productId: data.productId,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unitPrice),
      totalAmount: Number(data.totalAmount),
      vendorName: data.vendorName,
      purchaseDate: data.purchaseDate || new Date(),
      remarks: data.remarks,
      userId: data.userId,
      createdAt: new Date(),
    };

    if (client && typeof (client as any).productPurchase?.create === 'function') {
      try {
        const created = await (client as any).productPurchase.create({ data: record });
        inMemoryProductPurchases.push(created);
        return created;
      } catch {
        inMemoryProductPurchases.push(record);
        return record;
      }
    } else {
      inMemoryProductPurchases.push(record);
      return record;
    }
  }

  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<ProductPurchaseRecord | null> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    return inMemoryProductPurchases.find((p) => p.id === id && p.tenantId === effectiveTenantId) || null;
  }

  public async findByPurchaseNumber(
    purchaseNumber: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<ProductPurchaseRecord | null> {
    return (
      inMemoryProductPurchases.find(
        (p) =>
          p.purchaseNumber.toLowerCase() === purchaseNumber.toLowerCase() &&
          (!branchId || p.branchId === branchId)
      ) || null
    );
  }

  public async findMany(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<ProductPurchaseRecord>> {
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const effectiveBranchId = this.getOptionalBranchId(branchId);
    const { page, limit, skip } = this.getPaginationOptions(params);

    const filtered = inMemoryProductPurchases.filter((p) => {
      if (p.tenantId !== effectiveTenantId) return false;
      if (effectiveBranchId && p.branchId !== effectiveBranchId) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paginated = filtered.slice(skip, skip + limit);
    return this.formatPaginatedResult(paginated, filtered.length, page, limit);
  }
}

export const productPurchaseRepository = new ProductPurchaseRepository();
