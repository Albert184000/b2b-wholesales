import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-52 rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-slate-200 z-50 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-150`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={`divider-${index}`} className="my-1 border-t border-slate-100" />;
            }

            const Icon = item.icon;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                  item.variant === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    : item.variant === 'primary'
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
