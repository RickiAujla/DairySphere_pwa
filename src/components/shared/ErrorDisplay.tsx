import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Operation Error',
  message = 'An error occurred while processing your request. Please try again.',
  code,
  onRetry,
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-200 text-xs ${className}`}
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="shrink-0 ml-3 font-semibold text-rose-400 hover:text-rose-300 underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-xl border border-rose-800/80 bg-rose-950/30 text-rose-100 flex flex-col items-center text-center space-y-3 ${className}`}
    >
      <div className="p-3 bg-rose-900/40 border border-rose-700/60 rounded-full text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div>
        <h3 className="font-bold text-sm text-rose-200">{title}</h3>
        <p className="text-xs text-rose-300/80 mt-1 max-w-md leading-relaxed">{message}</p>
        {code && (
          <p className="text-[10px] font-mono text-rose-400/70 mt-1">Error Code: {code}</p>
        )}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
