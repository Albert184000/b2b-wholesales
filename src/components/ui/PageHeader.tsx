import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  className = ''
}) => {
  return (
    <div className={`mb-6 pb-4 border-b border-slate-200/80 ${className}`}>
      {breadcrumbs && <div className="mb-2.5"><Breadcrumb items={breadcrumbs} /></div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
