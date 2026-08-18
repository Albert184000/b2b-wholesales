import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
  type?: 'card' | 'table' | 'line';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 4,
  className = '',
  type = 'line'
}) => {
  if (type === 'card') {
    return (
      <div className={`p-5 bg-white border border-slate-200 rounded-xl animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-slate-100 rounded w-2/3"></div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-10 bg-slate-200 rounded-lg"></div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded"
          style={{ width: `${100 - (i % 3) * 15}%` }}
        ></div>
      ))}
    </div>
  );
};
