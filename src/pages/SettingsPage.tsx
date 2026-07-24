import React from 'react';
import { Settings, Shield, Building, Moon, Sun, User } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/shared/StatusBadge';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl">
      <Card title="User Session Profile" subtitle="Your active tenant session and security permissions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">User Name:</span>
            <p className="font-bold text-white text-sm">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Email Address:</span>
            <p className="font-bold text-white text-sm">{user?.email}</p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Tenant Organization:</span>
            <p className="font-bold text-sky-400 text-sm">{user?.tenantName} ({user?.tenantCode})</p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Roles & Permissions:</span>
            <div className="flex items-center space-x-2 mt-1">
              <StatusBadge status={user?.roles?.[0] || 'Member'} size="sm" />
              <span className="text-[10px] font-mono text-slate-400">({user?.permissions?.length || 0} permissions)</span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Appearance & Preferences" subtitle="Customizing display options">
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div>
            <h4 className="font-bold text-sm text-white">Color Theme</h4>
            <p className="text-xs text-slate-400">Toggle between high-contrast dark enterprise mode and light mode</p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-sky-400" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
