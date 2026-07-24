import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../../config/env';
import { JwtAccessTokenPayload, JwtRefreshTokenPayload } from '../../common/types/auth.types';
import { AuthenticationError } from '../../common/errors';

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string = '15m';
  private readonly refreshTokenExpiresIn: string = '7d';

  constructor() {
    this.accessTokenSecret = env.JWT_SECRET;
    this.refreshTokenSecret = env.JWT_REFRESH_SECRET;
  }

  /**
   * Generates a short-lived access token containing user, tenant, branch, roles, and permissions context.
   */
  public generateAccessToken(payload: Omit<JwtAccessTokenPayload, 'type'>): string {
    const fullPayload: JwtAccessTokenPayload = {
      ...payload,
      type: 'access',
    };

    return jwt.sign(fullPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Generates a long-lived refresh token.
   */
  public generateRefreshToken(payload: Omit<JwtRefreshTokenPayload, 'type'>): string {
    const fullPayload: JwtRefreshTokenPayload = {
      ...payload,
      type: 'refresh',
    };

    return jwt.sign(fullPayload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verifies and decodes an access token.
   */
  public verifyAccessToken(token: string): JwtAccessTokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as JwtAccessTokenPayload;
      if (decoded.type !== 'access') {
        throw new AuthenticationError('Invalid token type');
      }
      return decoded;
    } catch (err) {
      if (err instanceof AuthenticationError) {
        throw err;
      }
      if (err instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Access token expired');
      }
      throw new AuthenticationError('Invalid authentication token');
    }
  }

  /**
   * Verifies and decodes a refresh token.
   */
  public verifyRefreshToken(token: string): JwtRefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as JwtRefreshTokenPayload;
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid refresh token type');
      }
      return decoded;
    } catch (err) {
      if (err instanceof AuthenticationError) {
        throw err;
      }
      if (err instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Computes SHA-256 hash of a raw token for secure revocation/store lookup.
   */
  public hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

export const jwtService = new JwtService();
