import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-xs text-slate-500 font-medium ${className}`}>
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-900 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-slate-900 transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-semibold truncate max-w-[250px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
