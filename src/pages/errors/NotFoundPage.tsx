import React from 'react';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-3xl">
        <FileQuestion className="w-12 h-12" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700 px-3 py-1 rounded-full">
          Error 404
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          The ERP view or module path you requested does not exist or has been moved.
        </p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
