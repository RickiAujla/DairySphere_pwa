import React from 'react';
import { Lock, LogIn } from 'lucide-react';

interface UnauthorizedPageProps {
  onNavigate: (path: string) => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-3xl">
        <Lock className="w-12 h-12" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700 px-3 py-1 rounded-full">
          Error 401
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">Authentication Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Your session may have expired or you are not currently authenticated. Please log in to access this module.
        </p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={() => onNavigate('/login')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
      </div>
    </div>
  );
};
