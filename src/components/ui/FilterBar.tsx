import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface FilterItem {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export interface FilterBarProps {
  filters: FilterItem[];
  onReset?: () => void;
  hasActiveFilters?: boolean;
  extraActions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onReset,
  hasActiveFilters = false,
  extraActions,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 border border-slate-200 rounded-xl ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {filters.map((filter) => (
          <div key={filter.id} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-400 cursor-pointer"
            >
              <option value="ALL">All {filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onReset}
            icon={RotateCcw}
            className="text-slate-600 hover:text-slate-900"
          >
            Reset
          </Button>
        )}
      </div>

      {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
    </div>
  );
};
