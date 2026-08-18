import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key?: string;
  header: React.ReactNode;
  accessor?: (item: T, index: number) => React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (item: T) => void;
  selectedIds?: (string | number)[];
  onSelectRow?: (id: string | number) => void;
  onSelectAll?: () => void;
  selectable?: boolean;
  className?: string;
  compact?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (item: any, idx) => item?.id || item?.key || item?.sku || idx,
  isLoading = false,
  emptyMessage = 'No records found matching the criteria.',
  sortBy,
  sortDirection,
  onSort,
  onRowClick,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  selectable = false,
  className = '',
  compact = false
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {selectable && (
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
            )}
            {columns.map((col, cIdx) => {
              const colKey = col.key || `col-${cIdx}`;
              const isSorted = sortBy === colKey;
              return (
                <th
                  key={colKey}
                  style={{ width: col.width }}
                  className={`${compact ? 'px-3 py-2.5' : 'px-4 py-3'} ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none hover:text-slate-800' : ''} ${
                    col.className || ''
                  }`}
                  onClick={() => col.sortable && onSort && onSort(colKey)}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 ${
                      col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="flex flex-col text-slate-400">
                        {isSorted && sortDirection === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : isSorted && sortDirection === 'desc' ? (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : (
                          <span className="w-3.5 h-3.5 opacity-30 flex flex-col justify-center items-center">
                            <ChevronUp className="w-2.5 h-2.5 -mb-1" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-12 text-center text-slate-400"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-slate-500">Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-12 text-center text-slate-500 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const key = keyExtractor(item, index);
              const isSelected = selectedIds.includes(key);

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors hover:bg-slate-50/70 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-blue-50/50' : ''}`}
                >
                  {selectable && (
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow && onSelectRow(key)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, cIdx) => {
                    const colKey = col.key || `cell-${cIdx}`;
                    const content = col.accessor
                      ? col.accessor(item, index)
                      : col.render
                      ? col.render(item, index)
                      : col.key
                      ? (item as unknown as Record<string, React.ReactNode>)[col.key]
                      : null;

                    return (
                      <td
                        key={colKey}
                        className={`${compact ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'} ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {content}
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
  );
}
