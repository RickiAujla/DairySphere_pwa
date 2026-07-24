import React from 'react';

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'unpaid'
  | 'partial'
  | 'draft'
  | 'completed'
  | 'cancelled'
  | 'info';

interface StatusBadgeProps {
  status: string | StatusVariant;
  customLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  className = '',
  size = 'md',
}) => {
  const normalized = String(status).toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (['active', 'approved', 'paid', 'completed', 'success'].includes(normalized)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
  } else if (['pending', 'partial', 'warning', 'review'].includes(normalized)) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
  } else if (['inactive', 'rejected', 'unpaid', 'cancelled', 'danger', 'failed'].includes(normalized)) {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60';
  } else if (['draft', 'info', 'primary', 'new'].includes(normalized)) {
    colorClasses = 'bg-sky-500/10 text-sky-400 border-sky-500/20 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border tracking-wide whitespace-nowrap ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {customLabel || String(status).toUpperCase().replace(/_/g, ' ')}
    </span>
  );
};
