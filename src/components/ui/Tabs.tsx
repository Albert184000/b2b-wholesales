import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = ''
}) => {
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: underline
  return (
    <div className={`border-b border-slate-200 flex space-x-6 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
