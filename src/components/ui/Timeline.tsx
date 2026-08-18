import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

export interface TimelineItem {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  actor?: string;
  completed?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  className = '',
  orientation = 'vertical'
}) => {
  if (orientation === 'horizontal') {
    return (
      <div className={`w-full overflow-x-auto py-3 ${className}`}>
        <div className="flex items-center min-w-[500px] justify-between relative">
          {/* Connector line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

          {items.map((item, idx) => {
            return (
              <div key={idx} className="flex flex-col items-center text-center relative z-10 px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                    item.completed
                      ? 'bg-emerald-600 text-white'
                      : item.active
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.active ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2 max-w-[110px] truncate">
                  {item.title}
                </span>
                {item.date && (
                  <span className="text-[10px] text-slate-400 mt-0.5">{item.date}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical timeline
  return (
    <div className={`relative pl-6 space-y-6 ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200 -z-0" />

      {items.map((item, idx) => {
        const isCompleted = item.completed ?? false;
        const isActive = item.active ?? false;

        return (
          <div key={idx} className="relative flex items-start gap-3.5 group">
            {/* Dot/Icon */}
            <div
              className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-xs ${
                isCompleted
                  ? 'text-emerald-600'
                  : isActive
                  ? 'text-blue-600 ring-2 ring-blue-200'
                  : 'text-slate-300'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isActive ? (
                <Circle className="w-4 h-4 fill-blue-600 text-blue-600" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
            </div>

            <div className="flex-1 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <span className="font-bold text-slate-900">{item.title}</span>
                {item.date && <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>}
              </div>
              {item.actor && (
                <span className="text-[11px] font-semibold text-blue-700 block mb-1">
                  {item.actor}
                </span>
              )}
              {item.description && (
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
