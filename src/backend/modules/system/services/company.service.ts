import { Company, Prisma } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { CompanyRepository, companyRepository } from '../repositories/company.repository';
import { ConflictError, NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class CompanyService extends BaseService {
  constructor(private readonly repo: CompanyRepository = companyRepository) {
    super();
  }

  public async getCompanyById(id: string, tenantId?: string, tx?: DbClient): Promise<Company> {
    const company = await this.repo.findById(id, tenantId, tx);
    if (!company) {
      throw new NotFoundError(`Company with ID ${id} not found.`);
    }
    return company;
  }

  public async listCompanies(
    params?: PaginationParams,
    tenantId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Company>> {
    return this.repo.findMany(params, tenantId, tx);
  }

  public async createCompany(
    data: { name: string; code: string; tenantId: string; taxIdentifier?: string },
    tx?: DbClient
  ): Promise<Company> {
    if (!data.name || !data.name.trim()) {
      throw new DomainValidationError('Company name is required.');
    }
    if (!data.code || !data.code.trim()) {
      throw new DomainValidationError('Company code is required.');
    }

    const uppercaseCode = data.code.trim().toUpperCase();

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByCode(uppercaseCode, data.tenantId, transactionClient);
      if (existing) {
        throw new ConflictError(`Company with code '${uppercaseCode}' already exists for this tenant.`);
      }

      return this.repo.create(
        {
          tenantId: data.tenantId,
          name: data.name.trim(),
          code: uppercaseCode,
          taxIdentifier: data.taxIdentifier?.trim() || null,
        },
        transactionClient
      );
    }, tx);
  }

  public async updateCompany(
    id: string,
    data: Prisma.CompanyUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Company> {
    await this.getCompanyById(id, tenantId, tx);
    return this.repo.update(id, data, tenantId, tx);
  }
}

export const companyService = new CompanyService();
