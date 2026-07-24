import { RateChart, Prisma, RateChartType, MilkType, RateStatus } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { RateChartRepository, rateChartRepository } from '../repositories/rate-chart.repository';
import { ConflictError, NotFoundError, DomainValidationError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class RateChartService extends BaseService {
  constructor(private readonly repo: RateChartRepository = rateChartRepository) {
    super();
  }

  public async getRateChartById(id: string, tenantId?: string, tx?: DbClient): Promise<RateChart> {
    const chart = await this.repo.findById(id, tenantId, tx);
    if (!chart) {
      throw new NotFoundError(`Rate chart with ID ${id} not found.`);
    }
    return chart;
  }

  public async listRateCharts(
    params?: PaginationParams & {
      type?: RateChartType;
      milkType?: MilkType;
      status?: RateStatus;
      search?: string;
    },
    tenantId?: string,
    companyId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<RateChart>> {
    return this.repo.findMany(params, tenantId, companyId, branchId, tx);
  }

  public async findActiveRateChart(
    type: RateChartType,
    milkType: MilkType,
    tenantId: string,
    companyId: string,
    branchId?: string,
    date: Date = new Date(),
    tx?: DbClient
  ): Promise<RateChart | null> {
    return this.repo.findActiveRateChart(type, milkType, tenantId, companyId, branchId, date, tx);
  }

  public async createRateChart(
    data: {
      tenantId: string;
      companyId: string;
      branchId?: string;
      code: string;
      name: string;
      type: RateChartType;
      milkType: MilkType;
      baseRate: Prisma.Decimal | number;
      fatBase?: number;
      snfBase?: number;
      effectiveFrom: Date;
      effectiveTo?: Date;
    },
    tx?: DbClient
  ): Promise<RateChart> {
    if (!data.code || !data.code.trim()) {
      throw new DomainValidationError('Rate chart code is required.');
    }
    if (!data.name || !data.name.trim()) {
      throw new DomainValidationError('Rate chart name is required.');
    }
    if (Number(data.baseRate) <= 0) {
      throw new DomainValidationError('Base rate must be greater than zero.');
    }

    const uppercaseCode = data.code.trim().toUpperCase();

    return this.withTransaction(async (transactionClient) => {
      const existing = await this.repo.findByCode(uppercaseCode, data.companyId, transactionClient);
      if (existing) {
        throw new ConflictError(`Rate chart with code '${uppercaseCode}' already exists in this company.`);
      }

      return this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId || null,
          code: uppercaseCode,
          name: data.name.trim(),
          type: data.type,
          milkType: data.milkType,
          baseRate: data.baseRate,
          fatBase: data.fatBase ?? null,
          snfBase: data.snfBase ?? null,
          effectiveFrom: data.effectiveFrom,
          effectiveTo: data.effectiveTo || null,
          status: RateStatus.ACTIVE,
        },
        transactionClient
      );
    }, tx);
  }

  public async updateRateChart(
    id: string,
    data: {
      name?: string;
      baseRate?: Prisma.Decimal | number;
      fatBase?: number;
      snfBase?: number;
      effectiveFrom?: Date;
      effectiveTo?: Date;
      status?: RateStatus;
      reason?: string;
      changedBy?: string;
    },
    tenantId?: string,
    tx?: DbClient
  ): Promise<RateChart> {
    return this.withTransaction(async (transactionClient) => {
      const existing = await this.getRateChartById(id, tenantId, transactionClient);

      const hasRateChanges =
        (data.baseRate !== undefined && Number(data.baseRate) !== Number(existing.baseRate)) ||
        (data.fatBase !== undefined && data.fatBase !== (existing.fatBase ? Number(existing.fatBase) : null)) ||
        (data.snfBase !== undefined && data.snfBase !== (existing.snfBase ? Number(existing.snfBase) : null));

      if (hasRateChanges) {
        await this.repo.createHistory(
          {
            rateChartId: existing.id,
            baseRate: existing.baseRate,
            fatBase: existing.fatBase,
            snfBase: existing.snfBase,
            effectiveFrom: existing.effectiveFrom,
            effectiveTo: existing.effectiveTo,
            changedBy: data.changedBy || null,
            reason: data.reason || 'Rate chart parameter update',
          },
          transactionClient
        );
      }

      const updatePayload: Prisma.RateChartUpdateInput = {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.baseRate !== undefined ? { baseRate: data.baseRate } : {}),
        ...(data.fatBase !== undefined ? { fatBase: data.fatBase } : {}),
        ...(data.snfBase !== undefined ? { snfBase: data.snfBase } : {}),
        ...(data.effectiveFrom ? { effectiveFrom: data.effectiveFrom } : {}),
        ...(data.effectiveTo !== undefined ? { effectiveTo: data.effectiveTo } : {}),
        ...(data.status ? { status: data.status } : {}),
      };

      return this.repo.update(id, updatePayload, transactionClient);
    }, tx);
  }

  public async updateRateChartStatus(
    id: string,
    status: RateStatus,
    tenantId?: string,
    tx?: DbClient
  ): Promise<RateChart> {
    await this.getRateChartById(id, tenantId, tx);
    return this.repo.update(id, { status }, tx);
  }
}

export const rateChartService = new RateChartService();
