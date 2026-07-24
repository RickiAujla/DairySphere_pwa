import bcrypt from 'bcryptjs';

export class PasswordService {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hashes a plaintext password using bcrypt.
   */
  public async hashPassword(password: string): Promise<string> {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }
    return bcrypt.hash(password, PasswordService.SALT_ROUNDS);
  }

  /**
   * Verifies a plaintext password against a stored bcrypt hash.
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }
}

export const passwordService = new PasswordService();
