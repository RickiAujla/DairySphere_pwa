import { RateChart, RateHistory, Prisma, RateChartType, MilkType, RateStatus } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class RateChartRepository extends BaseRepository {
  public async findById(id: string, tenantId?: string, tx?: DbClient): Promise<RateChart | null> {
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);

    return client.rateChart.findFirst({
      where: {
        id,
        tenantId: effectiveTenantId,
      },
      include: {
        rateHistories: {
          orderBy: { createdAt: 'desc' },
        },
        company: true,
        branch: true,
      },
    });
  }

  public async findByCode(code: string, companyId: string, tx?: DbClient): Promise<RateChart | null> {
    const client = this.getClient(tx);

    return client.rateChart.findFirst({
      where: {
        code,
        companyId,
      },
    });
  }

  public async findActiveRateChart(
    type: RateChartType,
    milkType: MilkType,
    tenantId: string,
    companyId: string,
    branchId?: string,
    effectiveDate: Date = new Date(),
    tx?: DbClient
  ): Promise<RateChart | null> {
    const client = this.getClient(tx);

    return client.rateChart.findFirst({
      where: {
        tenantId,
        companyId,
        ...(branchId ? { branchId } : {}),
        type,
        milkType: {
          in: [milkType, MilkType.BOTH],
        },
        status: RateStatus.ACTIVE,
        effectiveFrom: { lte: effectiveDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: effectiveDate } },
        ],
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  }

  public async findMany(
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
    const client = this.getClient(tx);
    const effectiveTenantId = this.getRequiredTenantId(tenantId);
    const { skip, take, page, limit } = this.getPaginationOptions(params);

    const where: Prisma.RateChartWhereInput = {
      tenantId: effectiveTenantId,
      ...(companyId ? { companyId } : {}),
      ...(branchId ? { branchId } : {}),
      ...(params?.type ? { type: params.type } : {}),
      ...(params?.milkType ? { milkType: params.milkType } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.search
        ? {
            OR: [
              { code: { contains: params.search, mode: 'insensitive' } },
              { name: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      client.rateChart.findMany({
        where,
        skip,
        take,
        orderBy: params?.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
        include: {
          branch: true,
        },
      }),
      client.rateChart.count({ where }),
    ]);

    return this.formatPaginatedResult(data, total, page, limit);
  }

  public async create(
    data: Prisma.RateChartUncheckedCreateInput,
    tx?: DbClient
  ): Promise<RateChart> {
    const client = this.getClient(tx);
    const tenantId = this.getRequiredTenantId(data.tenantId);

    return client.rateChart.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  public async update(
    id: string,
    data: Prisma.RateChartUpdateInput,
    tx?: DbClient
  ): Promise<RateChart> {
    const client = this.getClient(tx);

    return client.rateChart.update({
      where: { id },
      data,
    });
  }

  public async createHistory(
    data: Prisma.RateHistoryUncheckedCreateInput,
    tx?: DbClient
  ): Promise<RateHistory> {
    const client = this.getClient(tx);

    return client.rateHistory.create({
      data,
    });
  }
}

export const rateChartRepository = new RateChartRepository();
