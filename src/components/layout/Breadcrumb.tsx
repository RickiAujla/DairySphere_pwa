import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, onNavigate }) => {
  const pathSegments = currentPath.split('/').filter(Boolean);

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-400 py-1" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate('/dashboard')}
        className="flex items-center space-x-1 hover:text-white transition-colors text-slate-400"
        title="Go to Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-medium">Home</span>
      </button>

      {pathSegments.map((segment, idx) => {
        const routePath = '/' + pathSegments.slice(0, idx + 1).join('/');
        const isLast = idx === pathSegments.length - 1;

        return (
          <React.Fragment key={routePath}>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-bold text-slate-100 dark:text-white truncate">
                {formatSegment(segment)}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(routePath)}
                className="hover:text-white transition-colors font-medium truncate max-w-[120px]"
              >
                {formatSegment(segment)}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
