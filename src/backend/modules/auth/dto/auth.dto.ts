export interface LoginDto {
  email: string;
  password: string;
  tenantCode?: string;
  branchId?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken?: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  roles: string[];
  permissions: string[];
  branches: Array<{
    id: string;
    code: string;
    name: string;
    isPrimary: boolean;
  }>;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}
