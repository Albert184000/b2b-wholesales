import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  prefixText?: string;
  suffixText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon: Icon,
  iconPosition = 'left',
  prefixText,
  suffixText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center rounded-lg shadow-xs">
        {prefixText && (
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium">
            {prefixText}
          </span>
        )}
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full text-sm bg-white border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error
              ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 text-rose-900'
              : 'border-slate-300 text-slate-900'
          } ${Icon && iconPosition === 'left' ? 'pl-9' : 'pl-3.5'} ${
            Icon && iconPosition === 'right' ? 'pr-9' : 'pr-3.5'
          } ${prefixText ? 'rounded-l-none' : ''} ${
            suffixText ? 'rounded-r-none' : ''
          } py-2 ${className}`}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        {suffixText && (
          <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium">
            {suffixText}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
