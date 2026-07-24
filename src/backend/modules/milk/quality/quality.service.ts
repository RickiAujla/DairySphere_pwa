import { MilkQualityRecord, Prisma } from '@prisma/client';
import { DomainValidationError } from '../../../common/errors';
import { DbClient } from '../../../common/repositories/types';
import { prisma } from '../../../prisma/client';

export interface QualityDataInput {
  fat?: number;
  snf?: number;
  clr?: number;
  water?: number;
}

export class QualityService {
  public validateQualityParameters(quality?: QualityDataInput): void {
    if (!quality) return;

    const { fat, snf, clr, water } = quality;

    if (fat !== undefined) {
      if (fat < 0 || fat > 25) {
        throw new DomainValidationError('FAT percentage must be between 0.0 and 25.0.');
      }
    }

    if (snf !== undefined) {
      if (snf < 0 || snf > 20) {
        throw new DomainValidationError('SNF percentage must be between 0.0 and 20.0.');
      }
    }

    if (clr !== undefined) {
      if (clr < 0 || clr > 50) {
        throw new DomainValidationError('CLR value must be between 0.0 and 50.0.');
      }
    }

    if (water !== undefined) {
      if (water < 0 || water > 100) {
        throw new DomainValidationError('Water percentage must be between 0.0 and 100.0.');
      }
    }
  }

  public async createQualityRecord(
    quality: QualityDataInput,
    tx?: DbClient
  ): Promise<MilkQualityRecord | null> {
    if (quality.fat === undefined || quality.snf === undefined) {
      return null;
    }

    this.validateQualityParameters(quality);

    const client = tx || prisma;
    return client.milkQualityRecord.create({
      data: {
        fat: quality.fat,
        snf: quality.snf,
        clr: quality.clr ?? null,
        water: quality.water ?? 0,
      },
    });
  }
}

export const qualityService = new QualityService();
