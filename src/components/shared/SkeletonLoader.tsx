import React from 'react';

interface SkeletonLoaderProps {
  type?: 'table' | 'card' | 'form' | 'text' | 'avatar';
  rows?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  rows = 3,
  className = '',
}) => {
  const baseShimmer = 'animate-pulse bg-slate-800/80 rounded';

  if (type === 'table') {
    return (
      <div className={`space-y-3 w-full ${className}`}>
        {/* Table Header Skeleton */}
        <div className="h-10 bg-slate-800/90 rounded-lg w-full flex items-center px-4 space-x-4">
          <div className="h-4 bg-slate-700/80 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-slate-700/80 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-slate-700/80 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-slate-700/80 rounded w-1/4 animate-pulse"></div>
        </div>
        {/* Table Rows Skeleton */}
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-12 bg-slate-900/60 border border-slate-800/80 rounded-lg w-full flex items-center px-4 space-x-4">
            <div className="h-4 bg-slate-800 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-slate-800 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-slate-800 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-slate-800 rounded w-1/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 w-full ${className}`}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-800 rounded w-1/3 animate-pulse"></div>
              <div className="h-6 w-12 bg-slate-800 rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 bg-slate-800 rounded w-1/2 animate-pulse"></div>
            <div className="h-3 bg-slate-800/60 rounded w-2/3 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`space-y-4 w-full ${className}`}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-3 bg-slate-800 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-slate-900 border border-slate-800 rounded-lg w-full animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`${baseShimmer} h-4`}
          style={{ width: `${100 - (idx % 3) * 15}%` }}
        ></div>
      ))}
    </div>
  );
};
