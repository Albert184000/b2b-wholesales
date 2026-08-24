import React, { useEffect, useState } from 'react';
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
  KeyRound,
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
import { AccessDeniedState } from '../components/common/AccessDeniedState';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { Avatar, Dropdown, NotificationDropdown, StatusBadge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { getPendingBuyerApprovalCount } from '../utils/adminMetrics';
import {
  canAccessAdminPath,
  canAccessAdminPortal,
  getRoleDisplayName,
  hasAnyPermission
} from '../utils/rbac';

const sidebarScrollClasses =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 pb-8 space-y-4 [scrollbar-width:thin] [scrollbar-color:rgb(51_65_85)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/80';

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  alert?: boolean;
  permissions?: string[];
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const {
    currentUser,
    buyerApplications,
    buyers,
    products,
    rfqs,
    quotes,
    purchaseOrders,
    contracts,
    invoices,
    shipments,
    showToast
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const pendingApprovalsCount = getPendingBuyerApprovalCount(buyerApplications);
  const pendingRfqsCount = rfqs.filter((rfq) => ['Submitted', 'Under Review'].includes(rfq.status)).length;
  const quoteApprovalCount = quotes.filter((quote) => quote.status === 'Pending Manager Approval').length;
  const sidebarWidth = sidebarCollapsed ? 'xl:w-20' : 'xl:w-72';
  const currentRole = currentUser.role;
  const adminProfile = currentUser;
  const adminRoleName = getRoleDisplayName(currentRole);
  const canUseAdminPortal = canAccessAdminPortal(currentRole);
  const canUseAdminRoute = canAccessAdminPath(currentRole, location.pathname, location.search);

  const handleGlobalSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = globalSearch.trim().toLowerCase();
    if (!query) return;

    const buyer = buyers.find((item) =>
      [item.companyName, item.contactPerson, item.taxId, item.registrationNumber, item.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (buyer) {
      navigate(`/admin/buyers/${buyer.id}`);
      return;
    }

    const application = buyerApplications.find((item) =>
      [item.id, item.applicationNumber, item.companyName, item.contactName, item.buyerId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (application) {
      navigate(`/admin/approvals/${application.id}`);
      return;
    }

    const product = products.find((item) =>
      [item.name, item.sku, item.brand, item.category].some((value) => value.toLowerCase().includes(query))
    );
    if (product) {
      navigate(`/admin/products/${product.id}`);
      return;
    }

    const rfq = rfqs.find((item) =>
      [item.id, item.rfqNumber, item.projectTitle, item.buyerName, item.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (rfq) {
      navigate(`/admin/rfqs/${rfq.id}`);
      return;
    }

    const quote = quotes.find((item) =>
      [item.id, item.quoteNumber, item.rfqId, item.buyerName, item.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (quote) {
      navigate(`/admin/quotes/${quote.id}`);
      return;
    }

    const po = purchaseOrders.find((item) =>
      [item.id, item.poNumber, item.buyerPoReference, item.quoteId, item.buyerName, item.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (po) {
      navigate(`/admin/purchase-orders/${po.id}`);
      return;
    }

    const contract = contracts.find((item) =>
      [item.id, item.contractNumber, item.title, item.poNumber, item.companyName, item.buyerName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (contract) {
      navigate(`/admin/contracts/${contract.id}`);
      return;
    }

    const invoice = invoices.find((item) =>
      [item.id, item.invoiceNumber, item.poNumber, item.poId, item.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (invoice) {
      navigate(`/admin/invoices/${invoice.id}`);
      return;
    }

    const shipment = shipments.find((item) =>
      [item.id, item.shipmentNumber, item.trackingNumber, item.poNumber, item.poId, item.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    if (shipment) {
      navigate(`/admin/shipments/${shipment.id}`);
      return;
    }

    showToast(`No admin records matched "${globalSearch.trim()}".`, 'warning');
  };

  const sidebarSections: SidebarSection[] = [
    {
      title: 'DASHBOARD',
      items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }]
    },
    {
      title: 'BUYERS',
      items: [
        { label: 'Buyers', href: '/admin/buyers', icon: Users, permissions: ['buyers.view'] },
        {
          label: 'Approvals',
          href: '/admin/approvals',
          icon: UserCheck,
          count: pendingApprovalsCount,
          alert: pendingApprovalsCount > 0,
          permissions: ['buyers.approve']
        },
        { label: 'Buyer Groups', href: '/admin/buyer-groups', icon: Tag, permissions: ['buyers.update'] }
      ]
    },
    {
      title: 'CATALOG',
      items: [
        { label: 'Products', href: '/admin/products', icon: Package, permissions: ['products.view'] },
        { label: 'Categories', href: '/admin/products?tab=categories', icon: Layers, permissions: ['products.view'] },
        { label: 'Pricing', href: '/admin/products?tab=pricing', icon: CreditCard, permissions: ['pricing.view'] }
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
          alert: pendingRfqsCount > 0,
          permissions: ['rfqs.view']
        },
        {
          label: 'Quotes',
          href: '/admin/quotes',
          icon: FileSpreadsheet,
          count: quoteApprovalCount,
          alert: quoteApprovalCount > 0,
          permissions: ['quotes.view']
        },
        { label: 'Orders', href: '/admin/purchase-orders', icon: ShoppingBag, permissions: ['purchase_orders.view'] },
        { label: 'Contracts', href: '/admin/contracts', icon: FileText, permissions: ['contracts.view'] }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Warehouses', href: '/admin/warehouses', icon: Warehouse, permissions: ['inventory.view'] },
        { label: 'Inventory', href: '/admin/inventory', icon: Boxes, permissions: ['inventory.view'] },
        { label: 'Stock Movements', href: '/admin/inventory?tab=movements', icon: History, permissions: ['inventory.view'] },
        { label: 'Allocations', href: '/admin/inventory?tab=allocations', icon: FileSpreadsheet, permissions: ['inventory.allocate'] },
        { label: 'Backorders', href: '/admin/inventory?tab=backorders', icon: AlertOctagon, permissions: ['inventory.view'] }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Invoices', href: '/admin/invoices', icon: Receipt, permissions: ['invoices.view'] },
        { label: 'Payments', href: '/admin/invoices?tab=payments', icon: DollarSign, permissions: ['payments.view'] },
        { label: 'Credit', href: '/admin/credit', icon: CreditCard, permissions: ['credit.view'] },
        { label: 'Credit Notes', href: '/admin/invoices?tab=credit-notes', icon: FileMinus, permissions: ['invoices.view'] }
      ]
    },
    {
      title: 'LOGISTICS',
      items: [
        { label: 'Shipments', href: '/admin/shipments', icon: Truck, permissions: ['shipments.view'] },
        { label: 'Carriers', href: '/admin/shipments?tab=carriers', icon: MapPin, permissions: ['shipments.update'] },
        { label: 'Tracking', href: '/admin/shipments?tab=tracking', icon: Search, permissions: ['shipments.view'] }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          label: 'Reports',
          href: '/admin/reports',
          icon: BarChart3,
          permissions: ['reports.sales', 'reports.buyers', 'reports.contracts', 'reports.employee_performance']
        },
        {
          label: 'Sales Performance',
          href: '/admin/reports?tab=sales',
          icon: TrendingUp,
          permissions: ['reports.sales', 'reports.employee_performance']
        }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Users', href: '/admin/users', icon: UserCog, permissions: ['users.view'] },
        { label: 'Roles', href: '/admin/roles', icon: Shield, permissions: ['roles.view'] },
        { label: 'Permissions', href: '/admin/permissions', icon: KeyRound, permissions: ['permissions.view'] },
        { label: 'Activity Logs', href: '/admin/activity-logs', icon: History, permissions: ['activity_logs.view'] },
        { label: 'Settings', href: '/admin/settings', icon: Settings, permissions: ['settings.manage'] }
      ]
    }
  ];

  const visibleSidebarSections = sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permissions || hasAnyPermission(currentRole, item.permissions))
    }))
    .filter((section) => section.items.length > 0);

  if (!canUseAdminPortal) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-slate-100 text-slate-900">
        <RoleSwitcher />
        <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
          <AccessDeniedState
            currentRole={currentRole}
            returnTo={currentRole === 'VERIFIED_BUYER' ? '/buyer/dashboard' : '/'}
            returnLabel={currentRole === 'VERIFIED_BUYER' ? 'Return to Buyer Dashboard' : 'Return Home'}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-100 text-slate-900">
      <RoleSwitcher />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs xl:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin navigation overlay"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-full w-72 flex-col overflow-hidden border-r border-slate-800 bg-[#08111f] text-slate-300 transition-all duration-200 ease-in-out xl:sticky xl:top-0 xl:shrink-0 xl:translate-x-0 ${
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
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white xl:flex"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white xl:hidden"
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

          <nav className={sidebarScrollClasses}>
            {visibleSidebarSections.map((section) => (
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
                        `flex items-center rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08111f] ${
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
                          title={`${item.label} needs action count: ${item.count}`}
                          aria-label={`${item.label} needs action count: ${item.count}`}
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
                    {adminRoleName}
                  </div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <Link to="/login" title="Sign Out" aria-label="Sign out" className="text-slate-400 hover:text-rose-400 p-1.5">
                <LogOut className="w-4 h-4" />
              </Link>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <header className="min-h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-xs">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setSidebarOpen(true);
                }}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 xl:hidden"
                aria-label="Open admin navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <form
                role="search"
                onSubmit={handleGlobalSearch}
                className="flex min-w-0 max-w-xl flex-1 items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
              >
                <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={globalSearch}
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  aria-label="Search admin buyers, products, RFQs, purchase orders, invoices, and shipments"
                  placeholder="Search admin records..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </form>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <NotificationDropdown />
              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100">
                    <Avatar name={adminProfile.name} src={adminProfile.avatar} size="sm" status="online" />
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight">{adminProfile.name}</div>
                      <div className="text-[10px] text-slate-500">{adminProfile.department || adminRoleName}</div>
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
            {canUseAdminRoute ? (
              <Outlet />
            ) : (
              <AccessDeniedState currentRole={currentRole} returnTo="/admin/dashboard" />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
