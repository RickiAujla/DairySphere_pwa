import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';

interface ForbiddenPageProps {
  onNavigate: (path: string) => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl">
        <ShieldAlert className="w-12 h-12" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono font-bold bg-slate-800 text-rose-400 border border-slate-700 px-3 py-1 rounded-full">
          Error 403
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">Access Forbidden</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          You do not have the required permissions to view this ERP module or perform this action. Contact your tenant administrator if you believe this is an error.
        </p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
