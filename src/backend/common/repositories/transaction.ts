import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';

export async function runInTransaction<T>(
  action: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return action(tx);
  }, options);
}
