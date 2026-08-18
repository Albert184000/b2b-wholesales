import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  BarChart3,
  Boxes,
  ChevronDown,
  CreditCard,
  DollarSign,
  FileMinus,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Tag,
  TrendingUp,
  Truck,
  UserCheck,
  UserCog,
  Users,
  Warehouse,
  X
} from 'lucide-react';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { Avatar, Button, Dropdown, NotificationDropdown, StatusBadge } from '../components/ui';
import { useApp } from '../context/AppContext';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/buyers': 'Buyers',
  '/admin/approvals': 'Approvals',
  '/admin/buyer-groups': 'Buyer Groups',
  '/admin/products': 'Products',
  '/admin/rfqs': 'RFQs',
  '/admin/quotes': 'Quotes',
  '/admin/purchase-orders': 'Orders',
  '/admin/contracts': 'Contracts',
  '/admin/warehouses': 'Warehouses',
  '/admin/inventory': 'Inventory',
  '/admin/invoices': 'Invoices',
  '/admin/credit': 'Credit',
  '/admin/shipments': 'Shipments',
  '/admin/reports': 'Reports',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles & Permissions',
  '/admin/activity-logs': 'Activity Logs',
  '/admin/settings': 'Settings'
};

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser, buyerApplications, rfqs, quotes, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentTitle = useMemo(() => {
    const matchingPath = Object.keys(pageTitles)
      .sort((a, b) => b.length - a.length)
      .find((path) => location.pathname.startsWith(path));

    return matchingPath ? pageTitles[matchingPath] : 'Admin Portal';
  }, [location.pathname]);

  const pendingApprovalsCount = buyerApplications.filter(
    (application) => !['Approved', 'Rejected'].includes(application.status)
  ).length;
  const pendingRfqsCount = rfqs.filter((rfq) => ['Submitted', 'Under Review'].includes(rfq.status)).length;
  const quoteApprovalCount = quotes.filter((quote) => quote.status === 'Pending Manager Approval').length;
  const sidebarWidth = sidebarCollapsed ? 'lg:w-20' : 'lg:w-72';
  const adminProfile =
    currentUser.role === 'VERIFIED_BUYER' || currentUser.role === 'GUEST'
      ? {
          id: 'usr-adm-01',
          name: 'Un Somnang',
          email: 'un.somnang@wholesalehub.com',
          role: 'Super Admin',
          department: 'Super Admin',
          avatar: undefined
        }
      : currentUser;

  const sidebarSections = [
    {
      title: 'DASHBOARD',
      items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }]
    },
    {
      title: 'BUYERS',
      items: [
        { label: 'Buyers', href: '/admin/buyers', icon: Users },
        {
          label: 'Approvals',
          href: '/admin/approvals',
          icon: UserCheck,
          count: pendingApprovalsCount,
          alert: pendingApprovalsCount > 0
        },
        { label: 'Buyer Groups', href: '/admin/buyer-groups', icon: Tag }
      ]
    },
    {
      title: 'CATALOG',
      items: [
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Categories', href: '/admin/products?tab=categories', icon: Layers },
        { label: 'Pricing', href: '/admin/products?tab=pricing', icon: CreditCard }
      ]
    },
    {
      title: 'SALES',
      items: [
        {
          label: 'RFQs',
          href: '/admin/rfqs',
          icon: FileQuestion,
          count: pendingRfqsCount,
          alert: pendingRfqsCount > 0
        },
        {
          label: 'Quotes',
          href: '/admin/quotes',
          icon: FileSpreadsheet,
          count: quoteApprovalCount,
          alert: quoteApprovalCount > 0
        },
        { label: 'Orders', href: '/admin/purchase-orders', icon: ShoppingBag },
        { label: 'Contracts', href: '/admin/contracts', icon: FileText }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Warehouses', href: '/admin/warehouses', icon: Warehouse },
        { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
        { label: 'Stock Movements', href: '/admin/inventory?tab=movements', icon: History },
        { label: 'Allocations', href: '/admin/inventory?tab=allocations', icon: FileSpreadsheet },
        { label: 'Backorders', href: '/admin/inventory?tab=backorders', icon: AlertOctagon }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
        { label: 'Payments', href: '/admin/invoices?tab=payments', icon: DollarSign },
        { label: 'Credit', href: '/admin/credit', icon: CreditCard },
        { label: 'Credit Notes', href: '/admin/invoices?tab=credit-notes', icon: FileMinus }
      ]
    },
    {
      title: 'LOGISTICS',
      items: [
        { label: 'Shipments', href: '/admin/shipments', icon: Truck },
        { label: 'Carriers', href: '/admin/shipments?tab=carriers', icon: MapPin },
        { label: 'Tracking', href: '/admin/shipments?tab=tracking', icon: Search }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
        { label: 'Sales Performance', href: '/admin/reports?tab=sales', icon: TrendingUp }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Users', href: '/admin/users', icon: UserCog },
        { label: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
        { label: 'Activity Logs', href: '/admin/activity-logs', icon: History },
        { label: 'Settings', href: '/admin/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <RoleSwitcher />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin navigation overlay"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#08111f] text-slate-300 flex flex-col transition-all duration-200 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarWidth}`}
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-[#050b14] shrink-0">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-extrabold text-white text-base tracking-tight">
                    Wholesale<span className="text-blue-400">Hub</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider block text-blue-400 font-bold -mt-0.5">
                    Admin ERP
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

          {!sidebarCollapsed && (
            <div className="mx-3 my-3 rounded-xl border border-slate-700/70 bg-slate-800/70 px-4 py-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white">Operations Control</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-slate-400">Phnom Penh Primary Node</div>
                </div>
                <StatusBadge status="Active" size="sm" />
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {sidebarSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const itemPath = item.href.split('?')[0];
                  const isManuallyActive =
                    location.pathname === itemPath ||
                    (itemPath !== '/admin/dashboard' && location.pathname.startsWith(`${itemPath}/`));

                  return (
                    <NavLink
                      key={`${section.title}-${item.label}`}
                      to={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={() =>
                        `flex items-center rounded-lg text-xs font-semibold transition-colors ${
                          sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                        } ${
                          isManuallyActive
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && typeof item.count === 'number' && item.count > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.alert ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-800 flex items-center justify-between shrink-0 bg-[#050b14]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={adminProfile.name} src={adminProfile.avatar} size="sm" status="online" />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{adminProfile.name}</div>
                  <div className="text-[10px] text-blue-400 font-semibold truncate">
                    {String(adminProfile.role).replace('_', ' ')}
                  </div>
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
                aria-label="Open admin navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Link to="/admin/dashboard" className="font-semibold hover:text-blue-600">
                    Admin Portal
                  </Link>
                  <span>/</span>
                  <span className="truncate">{currentTitle}</span>
                </div>
                <h1 className="truncate text-base font-extrabold text-slate-900 sm:text-lg">
                  {currentTitle}
                </h1>
              </div>
            </div>

            <div className="hidden md:flex min-w-[240px] max-w-md flex-1 items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500">
              <Search className="mr-2 h-4 w-4 text-slate-400" />
              <span className="truncate text-xs">Search buyers, RFQs, POs, invoices...</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link to="/admin/approvals" className="hidden sm:block">
                <Button variant="outline" size="xs" icon={UserCheck}>
                  Approvals
                </Button>
              </Link>
              <NotificationDropdown />
              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100">
                    <Avatar name={adminProfile.name} src={adminProfile.avatar} size="sm" status="online" />
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight">{adminProfile.name}</div>
                      <div className="text-[10px] text-slate-500">{adminProfile.department || 'Super Admin'}</div>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                  </div>
                }
                items={[
                  { id: 'profile', label: 'My Profile', icon: UserCog, onClick: () => showToast('Profile settings are available under System Settings.', 'info') },
                  { id: 'settings', label: 'Settings', icon: Settings, onClick: () => navigate('/admin/settings') },
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
