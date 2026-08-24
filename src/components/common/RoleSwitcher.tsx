import React from 'react';
import { Briefcase, ChevronDown, Eye, Shield, ShoppingBag, UserCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  canAccessAdminPortal,
  canAccessBuyerPortal,
  getRoleDisplayName,
  getRolePermissionCount
} from '../../utils/rbac';
import { Dropdown, DropdownItem } from '../ui';

const demoRoles: {
  id: UserRole;
  label: string;
  person: string;
  icon: DropdownItem['icon'];
}[] = [
  { id: 'ADMIN', label: 'Super Admin', person: 'Un Somnang', icon: Shield },
  { id: 'SALES_MANAGER', label: 'Sales Manager', person: 'Marcus Vance', icon: Briefcase },
  { id: 'ACCOUNT_EXECUTIVE', label: 'Account Executive', person: 'David Chen', icon: UserCheck },
  { id: 'VERIFIED_BUYER', label: 'Verified Buyer', person: 'Sovannarith Keo', icon: ShoppingBag },
  { id: 'GUEST', label: 'Guest Buyer', person: 'Public Visitor', icon: Eye }
];

export const RoleSwitcher: React.FC = () => {
  const { currentUser, setCurrentRole } = useApp();
  const location = useLocation();
  const currentRoleName = getRoleDisplayName(currentUser.role);
  const permissionCount = getRolePermissionCount(currentUser.role);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isBuyerRoute = location.pathname.startsWith('/buyer');
  const canExitPerspective = isAdminRoute && currentUser.role !== 'ADMIN';

  const roleItems: DropdownItem[] = demoRoles.map((role) => ({
    id: role.id,
    label: `${role.label} (${role.person})`,
    icon: role.icon,
    onClick: () => setCurrentRole(role.id),
    variant: currentUser.role === role.id ? 'primary' : 'default'
  }));

  const activePortal = isAdminRoute
    ? {
        label: 'Admin Portal',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      }
    : isBuyerRoute
    ? {
        label: 'Buyer Portal',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      }
    : {
        label: 'Public Website',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };

  const perspectiveColor = canAccessAdminPortal(currentUser.role)
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    : canAccessBuyerPortal(currentUser.role)
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  const perspectiveLabel =
    permissionCount > 0 ? `${currentRoleName} - ${permissionCount} permissions` : `${currentRoleName} - portal-only`;

  return (
    <div className="relative z-40 flex flex-col gap-2 border-b border-slate-800 bg-slate-950 px-4 py-1.5 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-400">Active Portal:</span>
        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${activePortal.color}`}>
          {activePortal.label}
        </span>
        <span className="text-slate-500">|</span>
        <span className="font-semibold text-slate-400">Signed in as:</span>
        <span className="font-bold text-white">
          {currentUser.name} - {currentRoleName}
        </span>
        <span className="text-slate-500">|</span>
        <span className="font-semibold text-slate-400">Perspective:</span>
        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${perspectiveColor}`}>
          {perspectiveLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canExitPerspective && (
          <button
            type="button"
            onClick={() => setCurrentRole('ADMIN')}
            className="rounded-md border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-200 transition-colors hover:bg-rose-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Exit Perspective
          </button>
        )}
        <Dropdown
          trigger={
            <button
              type="button"
              aria-label="Switch portal perspective"
              className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span>Switch Role</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          }
          items={roleItems}
          align="right"
        />
      </div>
    </div>
  );
};

