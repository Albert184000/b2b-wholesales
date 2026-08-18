import React from 'react';
import { UserCheck, Shield, ShoppingBag, Briefcase, Eye, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Dropdown, DropdownItem } from '../ui';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, setCurrentRole } = useApp();

  const roleItems: DropdownItem[] = [
    {
      id: 'buyer',
      label: 'Verified Buyer (ABC Technology Ltd.)',
      icon: ShoppingBag,
      onClick: () => setCurrentRole('VERIFIED_BUYER'),
      variant: currentUser.role === 'VERIFIED_BUYER' ? 'primary' : 'default'
    },
    {
      id: 'admin',
      label: 'Chief Admin (Procurement Ops)',
      icon: Shield,
      onClick: () => setCurrentRole('ADMIN'),
      variant: currentUser.role === 'ADMIN' ? 'primary' : 'default'
    },
    {
      id: 'sales_mgr',
      label: 'Sales Manager (Marcus Vance)',
      icon: Briefcase,
      onClick: () => setCurrentRole('SALES_MANAGER'),
      variant: currentUser.role === 'SALES_MANAGER' ? 'primary' : 'default'
    },
    {
      id: 'rep',
      label: 'Account Executive (David Chen)',
      icon: UserCheck,
      onClick: () => setCurrentRole('ACCOUNT_EXECUTIVE'),
      variant: currentUser.role === 'ACCOUNT_EXECUTIVE' ? 'primary' : 'default'
    },
    {
      id: 'divider-1',
      label: '',
      onClick: () => {},
      divider: true
    },
    {
      id: 'guest',
      label: 'Public Storefront Guest',
      icon: Eye,
      onClick: () => setCurrentRole('GUEST'),
      variant: currentUser.role === 'GUEST' ? 'primary' : 'default'
    }
  ];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin Portal View', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'SALES_MANAGER':
        return { label: 'Sales Manager View', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'ACCOUNT_EXECUTIVE':
        return { label: 'Sales Rep View', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'VERIFIED_BUYER':
        return { label: 'Buyer Portal (ABC Tech)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Public Website View', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <div className="bg-slate-950 text-slate-300 px-4 py-1.5 text-xs border-b border-slate-800 flex items-center justify-between z-40 relative">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-400">Interactive Perspective:</span>
        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${badge.color}`}>
          {badge.label}
        </span>
        <span className="hidden md:inline text-slate-500">|</span>
        <span className="hidden md:inline text-slate-400">
          Acting as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          trigger={
            <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-700 transition-colors">
              <span>Switch Demo Perspective</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          }
          items={roleItems}
          align="right"
        />
      </div>
    </div>
  );
};
