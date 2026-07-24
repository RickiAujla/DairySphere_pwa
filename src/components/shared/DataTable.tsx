import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export interface Column<T> {
  key: string;
  title: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Row selection
  selectedKeys?: string[];
  onSelectRow?: (key: string, row: T) => void;
  onSelectAll?: (selectedKeys: string[]) => void;
  // Row Click
  onRowClick?: (row: T) => void;
  // Pagination
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    onLimitChange?: (newLimit: number) => void;
  };
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no records matching your request.',
  emptyActionLabel,
  onEmptyAction,
  sortBy,
  sortOrder,
  onSort,
  selectedKeys = [],
  onSelectRow,
  onSelectAll,
  onRowClick,
  pagination,
  className = '',
}: DataTableProps<T>) {
  const allKeys = data.map((item, idx) => keyExtractor(item, idx));
  const isAllSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k));

  const handleSelectAllChange = () => {
    if (!onSelectAll) return;
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(allKeys);
    }
  };

  return (
    <div className={`bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col ${className}`}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold sticky top-0 z-10 backdrop-blur">
            <tr>
              {onSelectRow && (
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAllChange}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortBy === col.key;
                const alignClass =
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`p-3 ${alignClass} ${col.sortable ? 'cursor-pointer hover:text-white select-none' : ''}`}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div className={`inline-flex items-center space-x-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.title}</span>
                      {col.sortable && (
                        <span className="text-slate-500">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-sky-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-sky-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 hover:text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="p-6">
                  <SkeletonLoader type="table" rows={5} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="p-8 text-center">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const key = keyExtractor(row, idx);
                const isSelected = selectedKeys.includes(key);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-slate-900/60' : 'hover:bg-slate-900/30'
                    } ${isSelected ? 'bg-sky-500/10 dark:bg-sky-950/40' : ''}`}
                  >
                    {onSelectRow && (
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow(key, row)}
                          className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right font-mono'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';

                      const value = (row as any)[col.key];

                      return (
                        <td key={col.key} className={`p-3 ${alignClass}`}>
                          {col.render ? col.render(row, idx) : value !== undefined && value !== null ? String(value) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          onLimitChange={pagination.onLimitChange}
        />
      )}
    </div>
  );
}
