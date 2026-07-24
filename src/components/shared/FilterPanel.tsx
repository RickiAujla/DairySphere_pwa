import React, { useState } from 'react';
import { Filter, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface FilterPanelProps {
  children: React.ReactNode;
  activeChips?: FilterChip[];
  onRemoveChip?: (chipId: string) => void;
  onResetAll?: () => void;
  title?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  children,
  activeChips = [],
  onRemoveChip,
  onResetAll,
  title = 'Filters & Parameters',
  className = '',
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4 text-sky-400" />
          <span>{title}</span>
          {activeChips.length > 0 && (
            <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              {activeChips.length} active
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          )}
        </button>

        {activeChips.length > 0 && onResetAll && (
          <button
            onClick={onResetAll}
            className="flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Filter Body Controls */}
      {isExpanded && <div className="p-4 border-b border-slate-800 bg-slate-950/80">{children}</div>}

      {/* Active Chips Bar */}
      {activeChips.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-900/30 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">Applied Filters:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium"
            >
              <span className="text-slate-400">{chip.label}:</span>
              <strong className="text-sky-300">{chip.value}</strong>
              {onRemoveChip && (
                <button
                  onClick={() => onRemoveChip(chip.id)}
                  className="ml-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
