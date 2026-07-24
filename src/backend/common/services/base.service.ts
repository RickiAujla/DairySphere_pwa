import { DbClient } from '../repositories/types';
import { runInTransaction } from '../repositories/transaction';

export abstract class BaseService {
  /**
   * Helper to execute a callback within a database transaction.
   */
  protected async withTransaction<T>(
    action: (tx: DbClient) => Promise<T>,
    tx?: DbClient
  ): Promise<T> {
    if (tx) {
      return action(tx);
    }
    return runInTransaction(action);
  }
}
