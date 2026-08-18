import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = ''
}) => {
  const configs = {
    info: {
      bg: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
    },
    error: {
      bg: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
    }
  };

  const config = configs[type];

  return (
    <div
      className={`rounded-xl border p-4 flex items-start gap-3 shadow-xs ${config.bg} ${className}`}
    >
      {config.icon}
      <div className="flex-1 text-xs sm:text-sm">
        {title && <div className="font-bold mb-0.5">{title}</div>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
