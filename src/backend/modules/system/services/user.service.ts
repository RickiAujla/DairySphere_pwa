import { User, Prisma } from '@prisma/client';
import { BaseService } from '../../../common/services/base.service';
import { UserRepository, userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../../../common/errors';
import { DbClient, PaginationParams, PaginatedResult } from '../../../common/repositories/types';

export class UserService extends BaseService {
  constructor(private readonly repo: UserRepository = userRepository) {
    super();
  }

  public async getUserById(id: string, tenantId?: string, tx?: DbClient): Promise<User> {
    const user = await this.repo.findById(id, tenantId, tx);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }
    return user;
  }

  public async getUserByEmail(email: string, tenantId?: string, tx?: DbClient): Promise<User> {
    const user = await this.repo.findByEmail(email, tenantId, tx);
    if (!user) {
      throw new NotFoundError(`User with email '${email}' not found.`);
    }
    return user;
  }

  public async listUsers(
    params?: PaginationParams,
    tenantId?: string,
    tx?: DbClient
  ): Promise<PaginatedResult<User>> {
    return this.repo.findMany(params, tenantId, tx);
  }

  public async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
    tenantId?: string,
    tx?: DbClient
  ): Promise<User> {
    await this.getUserById(id, tenantId, tx);
    return this.repo.update(id, data, tenantId, tx);
  }
}

export const userService = new UserService();
