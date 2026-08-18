import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  options,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        <select
          id={selectId}
          className={`block w-full text-sm bg-white border rounded-lg pl-3.5 pr-10 py-2 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error
              ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 text-rose-900'
              : 'border-slate-300 text-slate-900'
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
