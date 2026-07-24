export interface RefreshTokenRecord {
  tokenId: string;
  userId: string;
  tenantId: string;
  hashedToken: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export class RefreshTokenStore {
  private records: Map<string, RefreshTokenRecord> = new Map();

  /**
   * Stores a hashed refresh token value with revocation status.
   */
  public saveRefreshToken(
    tokenId: string,
    userId: string,
    tenantId: string,
    hashedToken: string,
    expiresInMs: number = 7 * 24 * 60 * 60 * 1000
  ): void {
    this.records.set(tokenId, {
      tokenId,
      userId,
      tenantId,
      hashedToken,
      expiresAt: new Date(Date.now() + expiresInMs),
      isRevoked: false,
      createdAt: new Date(),
    });
  }

  /**
   * Validates if a hashed refresh token exists, is not revoked, and is not expired.
   */
  public isTokenValid(tokenId: string, hashedToken: string): boolean {
    const record = this.records.get(tokenId);
    if (!record) {
      return false;
    }
    if (record.isRevoked) {
      return false;
    }
    if (record.expiresAt < new Date()) {
      this.records.delete(tokenId);
      return false;
    }
    return record.hashedToken === hashedToken;
  }

  /**
   * Marks a specific refresh token as revoked.
   */
  public revokeToken(tokenId: string): void {
    const record = this.records.get(tokenId);
    if (record) {
      record.isRevoked = true;
    }
  }

  /**
   * Revokes all refresh tokens belonging to a user.
   */
  public revokeAllUserTokens(userId: string): void {
    for (const record of this.records.values()) {
      if (record.userId === userId) {
        record.isRevoked = true;
      }
    }
  }
}

export const refreshTokenStore = new RefreshTokenStore();
