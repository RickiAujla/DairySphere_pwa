import { Farmer, Prisma } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { FarmerRepository, farmerRepository } from '../../master/repositories/farmer.repository';
import { ConflictError, NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class FarmerService extends BaseService {
  constructor(private readonly repo: FarmerRepository = farmerRepository) {
    super();
  }

  public async getFarmerById(id: string, tenantId?: string, tx?: DbClient): Promise<Farmer> {
    const farmer = await this.repo.findById(id, tenantId, tx);
    if (!farmer) {
      throw new NotFoundError(`Farmer with ID ${id} not found.`);
    }
    return farmer;
  }

  public async listFarmers(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Farmer>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async createFarmer(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      farmerCode: string;
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
      bankName?: string;
      bankAccountNo?: string;
      bankIfscCode?: string;
    },
    tx?: DbClient
  ): Promise<Farmer> {
    if (!data.farmerCode || !data.farmerCode.trim()) {
      throw new DomainValidationError('Farmer code is required.');
    }
    if (!data.firstName || !data.firstName.trim()) {
      throw new DomainValidationError('Farmer first name is required.');
    }

    const uppercaseCode = data.farmerCode.trim().toUpperCase();

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByCode(uppercaseCode, data.branchId, transactionClient);
      if (existing) {
        throw new ConflictError(`Farmer with code '${uppercaseCode}' already exists in this branch.`);
      }

      return this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          farmerCode: uppercaseCode,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone?.trim() || null,
          email: data.email?.trim() || null,
          ...(data.bankName || data.bankAccountNo || data.bankIfscCode
            ? {
                details: {
                  create: {
                    bankName: data.bankName?.trim() || null,
                    bankAccountNo: data.bankAccountNo?.trim() || null,
                    bankIfscCode: data.bankIfscCode?.trim() || null,
                  },
                },
              }
            : {}),
        },
        transactionClient
      );
    }, tx);
  }

  public async updateFarmer(
    id: string,
    data: Prisma.FarmerUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Farmer> {
    await this.getFarmerById(id, tenantId, tx);
    return this.repo.update(id, data, tenantId, tx);
  }
}

export const farmerService = new FarmerService();
