import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-slate-950 border border-slate-800 rounded-xl shadow-sm text-slate-100 overflow-hidden dark:bg-slate-950 dark:border-slate-800 ${className}`}
    >
      {(title || subtitle || action) && (
        <div
          className={`p-4 border-b border-slate-800 flex items-center justify-between gap-4 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="font-bold text-sm tracking-tight text-white dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={noPadding ? bodyClassName : `p-5 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
