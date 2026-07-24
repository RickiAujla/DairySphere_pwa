export interface UserBranch {
  id: string;
  code: string;
  name: string;
  isPrimary: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  roles: string[];
  permissions: string[];
  branches: UserBranch[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantCode?: string;
  branchId?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
  };
}
