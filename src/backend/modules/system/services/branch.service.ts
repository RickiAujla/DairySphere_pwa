import { Branch, Prisma } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { BranchRepository, branchRepository } from '../repositories/branch.repository';
import { ConflictError, NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class BranchService extends BaseService {
  constructor(private readonly repo: BranchRepository = branchRepository) {
    super();
  }

  public async getBranchById(id: string, tenantId?: string, tx?: DbClient): Promise<Branch> {
    const branch = await this.repo.findById(id, tenantId, tx);
    if (!branch) {
      throw new NotFoundError(`Branch with ID ${id} not found.`);
    }
    return branch;
  }

  public async listBranches(
    params?: PaginationParams,
    tenantId?: string,
    companyId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Branch>> {
    return this.repo.findMany(params, tenantId, companyId, tx);
  }

  public async createBranch(
    data: {
      tenantId: string;
      companyId: string;
      name: string;
      code: string;
      address?: string;
      phone?: string;
    },
    tx?: DbClient
  ): Promise<Branch> {
    if (!data.name || !data.name.trim()) {
      throw new DomainValidationError('Branch name is required.');
    }
    if (!data.code || !data.code.trim()) {
      throw new DomainValidationError('Branch code is required.');
    }

    const uppercaseCode = data.code.trim().toUpperCase();

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByCode(uppercaseCode, data.companyId, transactionClient);
      if (existing) {
        throw new ConflictError(`Branch with code '${uppercaseCode}' already exists for this company.`);
      }

      return this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          name: data.name.trim(),
          code: uppercaseCode,
          address: data.address?.trim() || null,
          phone: data.phone?.trim() || null,
        },
        transactionClient
      );
    }, tx);
  }

  public async updateBranch(
    id: string,
    data: Prisma.BranchUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Branch> {
    await this.getBranchById(id, tenantId, tx);
    return this.repo.update(id, data, tenantId, tx);
  }
}

export const branchService = new BranchService();
