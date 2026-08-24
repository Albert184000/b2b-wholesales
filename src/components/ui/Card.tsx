import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'amber' | 'danger';
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  subtext,
  badge,
  badgeVariant = 'primary',
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300 ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="mb-3 flex min-h-10 items-start justify-between gap-3">
        <span className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider leading-snug text-slate-500">
          {title}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {badge && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                badgeVariant === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : badgeVariant === 'amber'
                  ? 'border border-amber-200 bg-amber-50 text-amber-700'
                  : badgeVariant === 'danger'
                  ? 'border border-rose-200 bg-rose-50 text-rose-700'
                  : 'border border-blue-200 bg-blue-50 text-blue-700'
              }`}
            >
              {badge}
            </span>
          )}
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      </div>

      {(change || subtext) && (
        <div className="mt-2.5 flex min-h-[34px] items-start gap-2 text-xs leading-snug">
          {change && (
            <span
              className={`inline-flex shrink-0 items-center gap-0.5 font-semibold ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {changeType === 'positive' && <TrendingUp className="w-3.5 h-3.5" />}
              {changeType === 'negative' && <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtext && (
            <span className="text-slate-500 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  legend,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {(action || legend) && (
          <div className="flex items-center gap-3">
            {legend}
            {action}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};
