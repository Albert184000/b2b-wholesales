import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileQuestion,
  FileSpreadsheet,
  ShoppingBag,
  FileText,
  Receipt,
  Truck,
  Building2,
  FileCheck,
  Bell,
  Menu,
  X,
  Layers,
  User,
  LogOut,
  CreditCard,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar, Button, Dropdown, NotificationDropdown } from '../components/ui';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { formatCurrency } from '../utils/pricing';

const navigationItems = [
  { label: 'Dashboard', href: '/buyer/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/buyer/products', icon: Package },
  { label: 'RFQs', href: '/buyer/rfqs', icon: FileQuestion },
  { label: 'Quotes', href: '/buyer/quotes', icon: FileSpreadsheet },
  { label: 'Purchase Orders', href: '/buyer/purchase-orders', icon: ShoppingBag },
  { label: 'Contracts', href: '/buyer/contracts', icon: FileText },
  { label: 'Invoices', href: '/buyer/invoices', icon: Receipt },
  { label: 'Shipments', href: '/buyer/shipments', icon: Truck },
  { label: 'Company Profile', href: '/buyer/profile', icon: Building2 },
  { label: 'Documents', href: '/buyer/documents', icon: FileCheck },
  { label: 'Notifications', href: '/buyer/notifications', icon: Bell }
];

const pageTitles: Record<string, string> = {
  '/buyer/dashboard': 'Dashboard',
  '/buyer/products': 'Products',
  '/buyer/rfqs': 'RFQs',
  '/buyer/quotes': 'Quotes',
  '/buyer/purchase-orders': 'Purchase Orders',
  '/buyer/contracts': 'Contracts',
  '/buyer/invoices': 'Invoices',
  '/buyer/shipments': 'Shipments',
  '/buyer/profile': 'Company Profile',
  '/buyer/documents': 'Documents',
  '/buyer/notifications': 'Notifications'
};

export const BuyerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentBuyer, currentUser, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentTitle = useMemo(() => {
    const matchingPath = Object.keys(pageTitles)
      .sort((a, b) => b.length - a.length)
      .find((path) => location.pathname.startsWith(path));

    return matchingPath ? pageTitles[matchingPath] : 'Buyer Portal';
  }, [location.pathname]);

  const creditUtilizationPercent = Math.round((currentBuyer.usedCredit / currentBuyer.creditLimit) * 100);
  const sidebarWidth = sidebarCollapsed ? 'lg:w-20' : 'lg:w-72';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <RoleSwitcher />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close buyer navigation overlay"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-all duration-200 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarWidth}`}
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-extrabold text-white text-base tracking-tight">
                    Wholesale<span className="text-blue-400">Hub</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-bold -mt-0.5">
                    Buyer Portal
                  </span>
                </div>
              )}
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={`mx-3 my-3 rounded-xl border border-slate-700/60 bg-slate-800/80 shrink-0 ${sidebarCollapsed ? 'p-2' : 'px-4 py-3.5'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30">
                ABC
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{currentBuyer.companyName}</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {currentBuyer.buyerGroup} / {currentBuyer.status}
                  </div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Available Credit</span>
                  <span className="font-bold text-white">{formatCurrency(currentBuyer.availableCredit)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      creditUtilizationPercent > 85 ? 'bg-rose-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, creditUtilizationPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg text-xs font-semibold transition-colors ${
                      sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="p-3 mx-3 mb-3 bg-slate-800/60 rounded-xl border border-slate-700/50 shrink-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                Assigned Account Executive
              </div>
              <div className="flex items-center gap-2">
                <Avatar name={currentBuyer.assignedRep.name} size="sm" status="online" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {currentBuyer.assignedRep.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentBuyer.assignedRep.title}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <Link to="/login" title="Sign Out" className="text-slate-400 hover:text-rose-400 p-1.5">
                <LogOut className="w-4 h-4" />
              </Link>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="min-h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Open buyer navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Link to="/buyer/dashboard" className="font-semibold hover:text-blue-600">
                    Buyer Portal
                  </Link>
                  <span>/</span>
                  <span className="truncate">{currentTitle}</span>
                </div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                  {currentTitle}
                </h1>
              </div>
            </div>

            <div className="hidden md:flex min-w-[240px] max-w-sm flex-1 items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500">
              <Search className="mr-2 h-4 w-4 text-slate-400" />
              <span className="truncate text-xs">Search products, POs, invoices...</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link to="/buyer/products" className="hidden sm:block">
                <Button variant="outline" size="xs" icon={Package}>
                  Products
                </Button>
              </Link>

              <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </div>

              <NotificationDropdown />

              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100">
                    <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{currentBuyer.buyerGroup} Buyer</div>
                    </div>
                  </div>
                }
                items={[
                  { id: 'profile', label: 'Company Profile', icon: Building2, onClick: () => navigate('/buyer/profile') },
                  { id: 'credit', label: 'Credit Summary', icon: CreditCard, onClick: () => navigate('/buyer/profile?tab=credit') },
                  { id: 'mark', label: 'Account Verified', icon: User, onClick: () => showToast('Buyer account is verified', 'info'), disabled: true },
                  { id: 'divider', label: '', onClick: () => undefined, divider: true },
                  { id: 'signout', label: 'Sign Out', icon: LogOut, onClick: () => navigate('/login'), variant: 'danger' }
                ]}
              />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
