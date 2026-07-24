import { FinancialRevision, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient } from '../../../common/repositories/types';
import { getRequestContext } from '../../../common/context/request-context';

export class FinancialRevisionRepository extends BaseRepository {
  public async create(
    data: {
      entityName: string;
      entityId: string;
      revisionNumber: number;
      previousData: Prisma.InputJsonValue;
      newData: Prisma.InputJsonValue;
      reason: string;
      revisedBy?: string;
    },
    tx?: DbClient
  ): Promise<FinancialRevision> {
    const client = this.getClient(tx);
    const context = getRequestContext();
    const effectiveUser = data.revisedBy || context?.userId || 'SYSTEM';

    return client.financialRevision.create({
      data: {
        entityName: data.entityName,
        entityId: data.entityId,
        revisionNumber: data.revisionNumber,
        previousData: data.previousData,
        newData: data.newData,
        reason: data.reason,
        revisedBy: effectiveUser,
      },
    });
  }

  public async findByEntity(
    entityName: string,
    entityId: string,
    tx?: DbClient
  ): Promise<FinancialRevision[]> {
    const client = this.getClient(tx);
    return client.financialRevision.findMany({
      where: {
        entityName,
        entityId,
      },
      orderBy: {
        revisionNumber: 'desc',
      },
    });
  }
}

export const financialRevisionRepository = new FinancialRevisionRepository();
