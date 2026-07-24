import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, LoginCredentials, AuthResponse } from '../types/auth';
import { apiClient } from '../api/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeBranchId: string | null;
  setActiveBranchId: (branchId: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('dairysphere_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeBranchId, setActiveBranchIdState] = useState<string | null>(() => {
    return localStorage.getItem('dairysphere_active_branch') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize stored user and active branch
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dairysphere_access_token');
      if (token && user) {
        if (!activeBranchId && user.branches && user.branches.length > 0) {
          const primaryBranch = user.branches.find((b) => b.isPrimary) || user.branches[0];
          setActiveBranchIdState(primaryBranch.id);
          localStorage.setItem('dairysphere_active_branch', primaryBranch.id);
        }
      } else if (!token) {
        setUser(null);
        setActiveBranchIdState(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for global unauthorized events from API Client
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setActiveBranchIdState(null);
      apiClient.clearTokens();
    };

    window.addEventListener('dairysphere:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('dairysphere:unauthorized', handleUnauthorized);
  }, []);

  const setActiveBranchId = (branchId: string) => {
    setActiveBranchIdState(branchId);
    localStorage.setItem('dairysphere_active_branch', branchId);
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials, {
        skipAuth: true,
      });

      const { accessToken, refreshToken, user: authUser } = response;

      localStorage.setItem('dairysphere_access_token', accessToken);
      localStorage.setItem('dairysphere_refresh_token', refreshToken);
      localStorage.setItem('dairysphere_user', JSON.stringify(authUser));

      setUser(authUser);

      if (authUser.branches && authUser.branches.length > 0) {
        const primaryBranch = authUser.branches.find((b) => b.isPrimary) || authUser.branches[0];
        setActiveBranchId(primaryBranch.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const refreshToken = localStorage.getItem('dairysphere_refresh_token');
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      apiClient.clearTokens();
      localStorage.removeItem('dairysphere_active_branch');
      setUser(null);
      setActiveBranchIdState(null);
      setIsLoading(false);
    }
  };

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      const userPermissions = user.permissions || [];
      if (userPermissions.includes('*') || userPermissions.includes('admin:*')) {
        return true;
      }
      return userPermissions.some((p) => p === permission || (p.endsWith(':*') && permission.startsWith(p.replace(':*', ''))));
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (...permissions: string[]): boolean => {
      if (!user) return false;
      if (permissions.length === 0) return true;
      return permissions.some((perm) => hasPermission(perm));
    },
    [user, hasPermission]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeBranchId,
        setActiveBranchId,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
