import { AuditLog, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { DbClient } from '../../../common/repositories/types';
import { getRequestContext } from '../../../common/context/request-context';

export class AuditLogRepository extends BaseRepository {
  public async log(
    data: {
      tenantId?: string;
      userId?: string;
      action: string;
      entity: string;
      entityId?: string;
      details?: Prisma.InputJsonValue;
      ipAddress?: string;
      userAgent?: string;
    },
    tx?: DbClient
  ): Promise<AuditLog> {
    const client = this.getClient(tx);
    const context = getRequestContext();
    const effectiveTenantId = this.getRequiredTenantId(data.tenantId);
    const effectiveUserId = data.userId || context?.userId || null;

    return client.auditLog.create({
      data: {
        tenantId: effectiveTenantId,
        userId: effectiveUserId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        details: data.details || Prisma.JsonNull,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
