import { randomUUID } from 'crypto';
import { prisma } from '../../prisma/client';
import { passwordService } from './password.service';
import { jwtService } from './jwt.service';
import { refreshTokenStore } from './refresh-token.store';
import { LoginDto, RefreshTokenDto, LogoutDto, AuthResponseDto } from './dto/auth.dto';
import { AuthenticationError, DomainValidationError } from '../../common/errors';

export class AuthService {
  /**
   * Authenticates user credentials and issues JWT access and refresh tokens.
   */
  public async login(dto: LoginDto): Promise<AuthResponseDto> {
    if (!dto.email || !dto.password) {
      throw new DomainValidationError('Email and password are required');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // 1. Resolve tenant if tenantCode supplied
    let tenantIdFilter: string | undefined = undefined;
    if (dto.tenantCode) {
      const tenant = await prisma.tenant.findUnique({
        where: { code: dto.tenantCode.trim().toUpperCase() },
      });
      if (!tenant) {
        throw new AuthenticationError('Invalid tenant code or credentials');
      }
      tenantIdFilter = tenant.id;
    }

    // 2. Fetch user matching email and tenantId
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        ...(tenantIdFilter ? { tenantId: tenantIdFilter } : {}),
      },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        userBranchAccesses: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('User account is inactive or locked');
    }

    // 3. Verify password
    const isPasswordValid = await passwordService.verifyPassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // 4. Extract roles and permissions
    const rolesSet = new Set<string>();
    const permissionsSet = new Set<string>();

    for (const ur of user.userRoles) {
      if (ur.role) {
        rolesSet.add(ur.role.code);
        for (const rp of ur.role.rolePermissions) {
          if (rp.permission) {
            permissionsSet.add(rp.permission.code);
          }
        }
      }
    }

    const roles = Array.from(rolesSet);
    const permissions = Array.from(permissionsSet);

    // 5. Resolve active branch access
    const branches = user.userBranchAccesses.map((uba) => ({
      id: uba.branch.id,
      code: uba.branch.code,
      name: uba.branch.name,
      isPrimary: uba.isPrimary,
    }));

    let activeBranchId: string | undefined;
    if (dto.branchId) {
      const selectedBranch = branches.find((b) => b.id === dto.branchId);
      if (selectedBranch) {
        activeBranchId = selectedBranch.id;
      }
    }

    if (!activeBranchId && branches.length > 0) {
      const primaryBranch = branches.find((b) => b.isPrimary) || branches[0];
      activeBranchId = primaryBranch.id;
    }

    // 6. Generate Tokens
    const tokenId = randomUUID();

    const accessToken = jwtService.generateAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      activeBranchId,
      roles,
      permissions,
    });

    const refreshToken = jwtService.generateRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      tokenId,
    });

    // 7. Store hashed refresh token in revocation store
    const hashedRefreshToken = jwtService.hashToken(refreshToken);
    refreshTokenStore.saveRefreshToken(tokenId, user.id, user.tenantId, hashedRefreshToken);

    // 8. Update last login timestamp
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // Non-blocking update failure
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        tenantCode: user.tenant.code,
        tenantName: user.tenant.name,
        roles,
        permissions,
        branches,
      },
    };
  }

  /**
   * Refreshes access and refresh tokens using a valid refresh token.
   */
  public async refresh(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    if (!dto.refreshToken) {
      throw new DomainValidationError('Refresh token is required');
    }

    const decoded = jwtService.verifyRefreshToken(dto.refreshToken);
    const hashedToken = jwtService.hashToken(dto.refreshToken);

    const isValid = refreshTokenStore.isTokenValid(decoded.tokenId, hashedToken);
    if (!isValid) {
      throw new AuthenticationError('Invalid or revoked refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        userBranchAccesses: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      refreshTokenStore.revokeToken(decoded.tokenId);
      throw new AuthenticationError('User is no longer active');
    }

    // Collect fresh roles & permissions
    const rolesSet = new Set<string>();
    const permissionsSet = new Set<string>();

    for (const ur of user.userRoles) {
      if (ur.role) {
        rolesSet.add(ur.role.code);
        for (const rp of ur.role.rolePermissions) {
          if (rp.permission) {
            permissionsSet.add(rp.permission.code);
          }
        }
      }
    }

    const primaryBranch = user.userBranchAccesses.find((b) => b.isPrimary) || user.userBranchAccesses[0];

    // Revoke old refresh token (token rotation)
    refreshTokenStore.revokeToken(decoded.tokenId);

    // Issue new pair
    const newTokenId = randomUUID();
    const newAccessToken = jwtService.generateAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      activeBranchId: primaryBranch?.branchId,
      roles: Array.from(rolesSet),
      permissions: Array.from(permissionsSet),
    });

    const newRefreshToken = jwtService.generateRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      tokenId: newTokenId,
    });

    const newHashedToken = jwtService.hashToken(newRefreshToken);
    refreshTokenStore.saveRefreshToken(newTokenId, user.id, user.tenantId, newHashedToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revokes user refresh token during logout.
   */
  public async logout(dto: LogoutDto): Promise<{ message: string }> {
    if (dto.refreshToken) {
      try {
        const decoded = jwtService.verifyRefreshToken(dto.refreshToken);
        refreshTokenStore.revokeToken(decoded.tokenId);
      } catch {
        // Silently complete logout even if token was already expired
      }
    }
    return { message: 'Logged out successfully' };
  }
}

export const authService = new AuthService();
