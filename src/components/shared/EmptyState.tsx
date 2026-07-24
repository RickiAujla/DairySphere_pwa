import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There is currently no data available for this view.',
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 dark:border-slate-800 dark:bg-slate-900/30 ${className}`}
    >
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 mb-4 shadow-sm">
        {icon || <FolderOpen className="w-8 h-8 text-slate-500" />}
      </div>

      <h3 className="text-base font-bold text-slate-100 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
