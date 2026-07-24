import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Building,
  LogOut,
  User,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api/apiClient';

interface TopHeaderProps {
  onMobileMenuToggle?: () => void;
  onOpenGlobalSearch?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMobileMenuToggle,
  onOpenGlobalSearch,
}) => {
  const { user, logout, activeBranchId, setActiveBranchId } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'ok' | 'error' | 'checking'>('checking');

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const res = await apiClient.get('/api/health?db=true', undefined, { skipAuth: true });
      if (res?.status === 'ok') {
        setHealthStatus('ok');
      } else {
        setHealthStatus('error');
      }
    } catch {
      setHealthStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check health every 60s
    return () => clearInterval(interval);
  }, []);

  const activeBranch = user?.branches?.find((b) => b.id === activeBranchId) || user?.branches?.[0];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Left: Mobile Menu Trigger & Branch Selector */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch / Tenant Switcher */}
        {user?.branches && user.branches.length > 0 && (
          <div className="relative group">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-200 hover:border-slate-700 transition-colors cursor-pointer">
              <Building className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="hidden sm:block text-left">
                <span className="text-[10px] text-slate-400 block leading-none">Branch</span>
                <span className="font-bold text-xs text-white truncate max-w-[140px] block">
                  {activeBranch?.name || 'Main Branch'}
                </span>
              </div>
              {user.branches.length > 1 && <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />}
            </div>

            {user.branches.length > 1 && (
              <div className="absolute left-0 mt-1 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Select Active Branch
                </div>
                {user.branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBranchId(b.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-900 ${
                      b.id === activeBranchId ? 'text-sky-400 font-bold bg-sky-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{b.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global Search Bar Shortcut */}
        <button
          onClick={onOpenGlobalSearch}
          className="hidden lg:flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-400 transition-colors w-60"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search farmers, sales, products...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Header Utilities */}
      <div className="flex items-center space-x-3">
        {/* Backend Connection Status */}
        <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <div
            className={`w-2 h-2 rounded-full ${
              healthStatus === 'ok'
                ? 'bg-emerald-400 animate-pulse'
                : healthStatus === 'checking'
                ? 'bg-amber-400 animate-spin'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-[11px] text-slate-300">
            {healthStatus === 'ok' ? (
              <span className="text-emerald-400 font-medium">Online</span>
            ) : healthStatus === 'checking' ? (
              <span className="text-amber-400">Connecting...</span>
            ) : (
              <span className="text-rose-400 font-medium">Offline</span>
            )}
          </span>
          <button
            onClick={checkHealth}
            title="Refresh System Health"
            className="text-slate-400 hover:text-white p-0.5"
          >
            <RefreshCw className={`w-3 h-3 ${healthStatus === 'checking' ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* User Profile Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-1.5 pl-2.5 rounded-xl transition-colors text-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
              {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="font-bold text-xs text-white block leading-none">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[100px]">
                {user?.tenantName || 'Tenant'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-scale-up"
              onClick={() => setIsProfileOpen(false)}
            >
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 mb-2">
                <p className="font-bold text-sm text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-slate-400 text-[11px] truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Tenant: {user?.tenantCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Role: {user?.roles?.[0] || 'Member'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
