import React from 'react';
import {
  Activity,
  Milk,
  ShoppingBag,
  Users,
  UserCheck,
  Package,
  Boxes,
  DollarSign,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { hasPermission, user } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Activity className="w-4 h-4 shrink-0" />,
      permission: 'dashboard:view',
    },
    {
      id: 'farmers',
      label: 'Farmers',
      path: '/farmers',
      icon: <Users className="w-4 h-4 shrink-0" />,
      permission: 'farmers:view',
    },
    {
      id: 'milk-collection',
      label: 'Milk Collection',
      path: '/milk-collection',
      icon: <Milk className="w-4 h-4 shrink-0" />,
      permission: 'milk:collection:view',
    },
    {
      id: 'milk-sales',
      label: 'Milk Sales',
      path: '/milk-sales',
      icon: <ShoppingBag className="w-4 h-4 shrink-0" />,
      permission: 'milk:sales:view',
    },
    {
      id: 'customers',
      label: 'Customers',
      path: '/customers',
      icon: <UserCheck className="w-4 h-4 shrink-0" />,
      permission: 'customers:view',
    },
    {
      id: 'products',
      label: 'Products',
      path: '/products',
      icon: <Package className="w-4 h-4 shrink-0" />,
      permission: 'products:view',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      path: '/inventory',
      icon: <Boxes className="w-4 h-4 shrink-0" />,
      permission: 'inventory:view',
    },
    {
      id: 'financial',
      label: 'Financial',
      path: '/financial',
      icon: <DollarSign className="w-4 h-4 shrink-0" />,
      permission: 'financial:view',
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
      permission: 'reports:view',
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-4 h-4 shrink-0" />,
      permission: 'settings:view',
    },
  ];

  // Filter items based on user permissions
  const authorizedItems = navItems.filter((item) => {
    if (!item.permission) return true;
    // Superadmin / wildcard permissions bypass or explicit check
    if (!user) return false;
    const userPerms = user.permissions || [];
    if (userPerms.includes('*') || userPerms.includes('admin:*')) return true;
    return hasPermission(item.permission);
  });

  const sidebarContent = (
    <aside
      className={`h-full bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Logo Brand */}
      <div>
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20 text-sky-400 shrink-0">
              <Milk className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-bold text-sm text-white tracking-tight leading-none">
                  DairySphere
                </h1>
                <p className="text-[10px] text-sky-400 font-medium mt-0.5">PWA SaaS ERP</p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5">
              ERP Modules
            </div>
          )}

          {authorizedItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.path);
                  if (onMobileClose) onMobileClose();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className={isActive ? 'text-sky-400' : 'text-slate-400'}>{item.icon}</div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}

          {authorizedItems.length === 0 && !isCollapsed && (
            <div className="p-4 text-center text-rose-400 text-xs bg-rose-950/20 border border-rose-900/40 rounded-lg">
              <ShieldAlert className="w-5 h-5 mx-auto mb-1" />
              <span>No authorized module permissions granted.</span>
            </div>
          )}
        </nav>
      </div>

      {/* User Info Bottom Footer */}
      {user && !isCollapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <div className="truncate">
              <p className="font-bold text-white text-xs truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-2">
              {user.roles?.[0] || 'User'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">{sidebarContent}</div>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={onMobileClose}
        >
          <div className="w-72 h-full" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
