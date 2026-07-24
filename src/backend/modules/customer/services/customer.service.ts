import { Customer, Prisma, CustomerType } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { CustomerRepository, customerRepository } from '../../master/repositories/customer.repository';
import { ConflictError, NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class CustomerService extends BaseService {
  constructor(private readonly repo: CustomerRepository = customerRepository) {
    super();
  }

  public async getCustomerById(id: string, tenantId?: string, tx?: DbClient): Promise<Customer> {
    const customer = await this.repo.findById(id, tenantId, tx);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found.`);
    }
    return customer;
  }

  public async listCustomers(
    params?: PaginationParams,
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<Customer>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async createCustomer(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      customerCode: string;
      name: string;
      customerType?: CustomerType;
      phone?: string;
      email?: string;
      address?: string;
    },
    tx?: DbClient
  ): Promise<Customer> {
    if (!data.customerCode || !data.customerCode.trim()) {
      throw new DomainValidationError('Customer code is required.');
    }
    if (!data.name || !data.name.trim()) {
      throw new DomainValidationError('Customer name is required.');
    }

    const uppercaseCode = data.customerCode.trim().toUpperCase();

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByCode(uppercaseCode, data.branchId, transactionClient);
      if (existing) {
        throw new ConflictError(`Customer with code '${uppercaseCode}' already exists in this branch.`);
      }

      return this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          customerCode: uppercaseCode,
          name: data.name.trim(),
          customerType: data.customerType || CustomerType.RETAIL,
          phone: data.phone?.trim() || null,
          email: data.email?.trim() || null,
          address: data.address?.trim() || null,
        },
        transactionClient
      );
    }, tx);
  }

  public async updateCustomer(
    id: string,
    data: Prisma.CustomerUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<Customer> {
    await this.getCustomerById(id, tenantId, tx);
    return this.repo.update(id, data, tenantId, tx);
  }
}

export const customerService = new CustomerService();
