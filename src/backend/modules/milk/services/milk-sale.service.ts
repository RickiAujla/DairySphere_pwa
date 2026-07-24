import { MilkSale, Prisma, MilkShift, MilkType, RateChartType, CustomerStatus } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { MilkSaleRepository, milkSaleRepository } from '../repositories/milk-sale.repository';
import { customerRepository, CustomerRepository } from '../../master/repositories/customer.repository';
import { rateChartRepository, RateChartRepository } from '../repositories/rate-chart.repository';
import { qualityService } from '../quality/quality.service';
import { NotFoundError, DomainValidationError, ForbiddenError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class MilkSaleService extends BaseService {
  constructor(
    private readonly repo: MilkSaleRepository = milkSaleRepository,
    private readonly customerRepo: CustomerRepository = customerRepository,
    private readonly rateChartRepo: RateChartRepository = rateChartRepository
  ) {
    super();
  }

  public async getSaleById(id: string, tenantId?: string, tx?: DbClient): Promise<MilkSale> {
    const record = await this.repo.findById(id, tenantId, tx);
    if (!record) {
      throw new NotFoundError(`Milk sale record ${id} not found.`);
    }
    return record;
  }

  public async listSales(
    params?: PaginationParams & {
      customerId?: string;
      startDate?: Date;
      endDate?: Date;
      shift?: MilkShift;
    },
    tenantId?: string,
    branchId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<MilkSale>> {
    return this.repo.findMany(params, tenantId, branchId, tx);
  }

  public async recordSale(
    data: {
      tenantId: string;
      companyId: string;
      branchId: string;
      customerId: string;
      rateChartId?: string;
      saleDate: Date;
      shift: MilkShift;
      milkType: MilkType;
      quantity: Prisma.Decimal | number;
      totalAmount?: Prisma.Decimal | number;
      fat?: number;
      snf?: number;
      clr?: number;
      water?: number;
      ratePerLiter?: number;
      remarks?: string;
    },
    tx?: DbClient
  ): Promise<MilkSale> {
    const quantityVal = Number(data.quantity);
    if (quantityVal <= 0) {
      throw new DomainValidationError('Quantity must be greater than zero.');
    }

    if (!Object.values(MilkType).includes(data.milkType)) {
      throw new DomainValidationError(`Invalid milk type: ${data.milkType}. Must be COW, BUFFALO, or BOTH.`);
    }

    return this.withTransaction(async (transactionClient) => {
      // 1. Validate Customer
      const customer = await this.customerRepo.findById(data.customerId, data.tenantId, transactionClient);
      if (!customer) {
        throw new NotFoundError(`Customer with ID ${data.customerId} not found.`);
      }

      if (customer.status !== CustomerStatus.ACTIVE) {
        throw new DomainValidationError(`Inactive customer sale attempt. Customer '${customer.customerCode}' status is ${customer.status}.`);
      }

      if (customer.branchId && customer.branchId !== data.branchId) {
        throw new ForbiddenError(`Customer belongs to branch ${customer.branchId}, but sale was attempted at branch ${data.branchId}.`);
      }

      // 2. Validate Quality parameters
      if (data.fat !== undefined || data.snf !== undefined || data.clr !== undefined || data.water !== undefined) {
        qualityService.validateQualityParameters({
          fat: data.fat,
          snf: data.snf,
          clr: data.clr,
          water: data.water,
        });
      }

      // 3. Determine Rate Chart & Applied Rate
      let activeRateChartId = data.rateChartId || null;
      let calculatedRate = data.ratePerLiter !== undefined ? Number(data.ratePerLiter) : null;

      if (!calculatedRate || !activeRateChartId) {
        const rateChart = activeRateChartId
          ? await this.rateChartRepo.findById(activeRateChartId, data.tenantId, transactionClient)
          : await this.rateChartRepo.findActiveRateChart(
              RateChartType.SALE,
              data.milkType,
              data.tenantId,
              data.companyId,
              data.branchId,
              data.saleDate,
              transactionClient
            );

        if (rateChart) {
          activeRateChartId = rateChart.id;
          if (calculatedRate === null) {
            const baseRateNum = Number(rateChart.baseRate);
            let rateAdjustment = 0;

            if (data.fat !== undefined && rateChart.fatBase) {
              rateAdjustment += (data.fat - Number(rateChart.fatBase)) * 1.0;
            }
            if (data.snf !== undefined && rateChart.snfBase) {
              rateAdjustment += (data.snf - Number(rateChart.snfBase)) * 1.0;
            }

            calculatedRate = Math.max(0, baseRateNum + rateAdjustment);
          }
        }
      }

      if (calculatedRate === null || calculatedRate <= 0) {
        throw new DomainValidationError('Unable to determine valid rate per liter for milk sale. Check rate charts.');
      }

      const computedTotalAmount = data.totalAmount !== undefined
        ? Number(data.totalAmount)
        : Math.round(quantityVal * calculatedRate * 100) / 100;

      // 4. Create Quality & Snapshot Records
      const qualityRecord =
        data.fat !== undefined && data.snf !== undefined
          ? {
              fat: data.fat,
              snf: data.snf,
              clr: data.clr ?? null,
              water: data.water ?? 0,
            }
          : undefined;

      const rateSnapshot = {
        rateChartId: activeRateChartId,
        ratePerLiter: calculatedRate,
        fatRate: data.fat ?? null,
        snfRate: data.snf ?? null,
        bonusRate: 0,
        deduction: 0,
        finalRate: calculatedRate,
      };

      // 5. Save Sale Record
      return this.repo.create(
        {
          tenantId: data.tenantId,
          companyId: data.companyId,
          branchId: data.branchId,
          customerId: data.customerId,
          rateChartId: activeRateChartId,
          saleDate: data.saleDate,
          shift: data.shift,
          milkType: data.milkType,
          quantity: quantityVal,
          totalAmount: computedTotalAmount,
          remarks: data.remarks?.trim() || null,
        },
        qualityRecord,
        rateSnapshot,
        transactionClient
      );
    }, tx);
  }
}

export const milkSaleService = new MilkSaleService();
