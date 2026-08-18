import React from 'react';
import { Calendar } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label htmlFor={checkboxId} className="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        id={checkboxId}
        className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
        {...props}
      />
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-slate-800">{label}</span>}
          {description && <p className="text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
};

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  description,
  className = '',
  id,
  ...props
}) => {
  const radioId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label htmlFor={radioId} className="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="radio"
        id={radioId}
        className={`mt-0.5 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
        {...props}
      />
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-slate-800">{label}</span>}
          {description && <p className="text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
};

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const dateId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={dateId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        <input
          type="date"
          id={dateId}
          className={`block w-full text-sm bg-white border rounded-lg pl-9 pr-3.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error
              ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 text-rose-900'
              : 'border-slate-300 text-slate-900'
          } ${className}`}
          {...props}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Calendar className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
