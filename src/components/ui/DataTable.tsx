import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Pagination } from './Pagination';

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

type SortDirection = 'asc' | 'desc';

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  onRowClick?: (item: T) => void;
  selectedIds?: (string | number)[];
  onSelectRow?: (id: string | number) => void;
  onSelectAll?: () => void;
  selectable?: boolean;
  className?: string;
  compact?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  paginationThreshold?: number;
}

const isSortableColumn = <T,>(column: Column<T>, columnKey: string) =>
  column.sortable ?? !['action', 'actions', 'select'].includes(columnKey.toLowerCase());

const extractText = (value: React.ReactNode): string => {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(extractText).join(' ');
  if (React.isValidElement<{ children?: React.ReactNode }>(value)) {
    return extractText(value.props.children);
  }

  return '';
};

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
  compact = false,
  enablePagination,
  pageSize = compact ? 8 : 10,
  paginationThreshold = 8
}: DataTableProps<T>) {
  const [internalSortBy, setInternalSortBy] = useState<string | undefined>();
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const activeSortBy = sortBy || internalSortBy;
  const activeSortDirection = sortBy ? sortDirection || 'asc' : internalSortDirection;

  const getCellValue = (item: T, index: number, column: Column<T>, columnKey: string) => {
    if (column.accessor) return extractText(column.accessor(item, index));
    if (column.render) return extractText(column.render(item, index));
    const rawValue = (item as unknown as Record<string, React.ReactNode>)[columnKey];
    return extractText(rawValue);
  };

  const displayData = useMemo(() => {
    if (onSort || !activeSortBy) return data;

    const columnIndex = columns.findIndex((column, index) => (column.key || `col-${index}`) === activeSortBy);
    const sortColumn = columns[columnIndex];
    if (!sortColumn) return data;

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    return data
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const aValue = getCellValue(a.item, a.index, sortColumn, activeSortBy);
        const bValue = getCellValue(b.item, b.index, sortColumn, activeSortBy);
        const result = collator.compare(aValue, bValue);
        return activeSortDirection === 'asc' ? result : -result;
      })
      .map(({ item }) => item);
  }, [activeSortBy, activeSortDirection, columns, data, onSort]);

  const shouldPaginate = enablePagination ?? displayData.length > paginationThreshold;
  const totalPages = Math.max(1, Math.ceil(displayData.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pagedData = shouldPaginate
    ? displayData.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize)
    : displayData;
  const allSelected = pagedData.length > 0 && selectedIds.length === pagedData.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSortBy, activeSortDirection, data.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
      return;
    }

    if (internalSortBy === columnKey) {
      setInternalSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setInternalSortBy(columnKey);
    setInternalSortDirection('asc');
  };

  const handleSortKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>, columnKey: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSort(columnKey);
    }
  };

  return (
    <div className="space-y-3">
      <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {selectable && (
                <th className="w-10 px-4 py-3 text-center" scope="col">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    aria-label="Select all rows on this page"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((col, cIdx) => {
                const colKey = col.key || `col-${cIdx}`;
                const isSorted = activeSortBy === colKey;
                const isSortable = isSortableColumn(col, colKey);
                const alignClass =
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                return (
                  <th
                    key={colKey}
                    style={{ width: col.width }}
                    scope="col"
                    aria-sort={
                      isSortable
                        ? isSorted
                          ? activeSortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    role={isSortable ? 'button' : undefined}
                    tabIndex={isSortable ? 0 : undefined}
                    className={`${compact ? 'px-3 py-2.5' : 'px-4 py-3'} ${alignClass} ${
                      isSortable
                        ? 'cursor-pointer select-none hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
                        : ''
                    } ${col.className || ''}`}
                    onClick={() => isSortable && handleSort(colKey)}
                    onKeyDown={(event) => isSortable && handleSortKeyDown(event, colKey)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="flex flex-col text-slate-400" aria-hidden="true">
                          {isSorted && activeSortDirection === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 font-bold text-blue-600" />
                          ) : isSorted && activeSortDirection === 'desc' ? (
                            <ChevronDown className="h-3.5 w-3.5 font-bold text-blue-600" />
                          ) : (
                            <span className="flex h-3.5 w-3.5 flex-col items-center justify-center opacity-30">
                              <ChevronUp className="-mb-1 h-2.5 w-2.5" />
                              <ChevronDown className="h-2.5 w-2.5" />
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
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-xs font-medium text-slate-500">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedData.map((item, index) => {
                const sourceIndex = shouldPaginate ? (currentPageSafe - 1) * pageSize + index : index;
                const key = keyExtractor(item, sourceIndex);
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
                      <td className="px-4 py-3 text-center" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(key)}
                          aria-label="Select row"
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => {
                      const colKey = col.key || `cell-${cIdx}`;
                      const content = col.accessor
                        ? col.accessor(item, sourceIndex)
                        : col.render
                        ? col.render(item, sourceIndex)
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

      {!isLoading && shouldPaginate && displayData.length > pageSize && (
        <Pagination
          currentPage={currentPageSafe}
          totalPages={totalPages}
          totalItems={displayData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
