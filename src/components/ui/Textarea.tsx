import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`block w-full text-sm bg-white border rounded-lg p-3 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error
            ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 text-rose-900'
            : 'border-slate-300 text-slate-900'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
