import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LucideIcon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileQuestion,
  FileText,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserCheck,
  Users,
  Warehouse
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Alert,
  Button,
  Card,
  ChartCard,
  Column,
  DataTable,
  EmptyState,
  KPICard,
  LoadingSkeleton,
  PageHeader,
  Select,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BuyerApplication, InventoryItem, Invoice, PurchaseOrder } from '../../types';
import {
  ADMIN_DASHBOARD_REFERENCE_DATE,
  AdminDashboardDateRange,
  adminDashboardDateRangeOptions,
  buildAdminDashboardMetrics,
  getDashboardDaysOverdue,
  parseAdminDate
} from '../../utils/adminMetrics';
import { getInvoiceBalance } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';
import { getRoleDefinition, getRolePermissionCount, hasAnyPermission } from '../../utils/rbac';

type DashboardState = 'ready' | 'loading' | 'success' | 'error';
type KpiTone = 'positive' | 'negative' | 'neutral';

interface DashboardKpi {
  title: string;
  value: string | number;
  href: string;
  icon: LucideIcon;
  subtext: string;
  change?: string;
  changeType?: KpiTone;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'amber' | 'danger';
}

interface AttentionItem {
  id: string;
  severity: 'Overdue' | 'Low Stock' | 'Near Expiry' | 'Missing' | 'Delayed';
  message: string;
  meta: string;
  href: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

const formatDate = (value?: string) => {
  const date = parseAdminDate(value);
  return date ? dateFormatter.format(date) : 'Not scheduled';
};

const getTrendType = (trend: string): KpiTone => {
  if (trend.startsWith('-')) return 'negative';
  if (trend === '0%') return 'neutral';
  return 'positive';
};

const tableClassName = '[&_table]:min-w-[760px]';

const DashboardChartEmpty: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <EmptyState icon={BarChart3} title={title} description={description} className="min-h-64 border-slate-200" />
);

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    buyerApplications,
    buyers,
    products,
    rfqs,
    purchaseOrders,
    contracts,
    invoices,
    shipments,
    inventory,
    recentAdminActivity,
    showToast
  } = useApp();
  const [dateRange, setDateRange] = useState<AdminDashboardDateRange>('last30');
  const [dashboardState, setDashboardState] = useState<DashboardState>('ready');

  const metrics = useMemo(
    () =>
      buildAdminDashboardMetrics(
        {
          buyerApplications,
          buyers,
          products,
          rfqs,
          purchaseOrders,
          contracts,
          invoices,
          shipments,
          inventory
        },
        dateRange
      ),
    [buyerApplications, buyers, contracts, dateRange, inventory, invoices, products, purchaseOrders, rfqs, shipments]
  );

  const isLoading = dashboardState === 'loading';
  const roleDefinition = getRoleDefinition(currentUser.role);
  const rolePermissionCount = getRolePermissionCount(currentUser.role);
  const roleQuickLinks = [
    { label: 'Buyer Lifecycle', href: '/admin/buyers', permissions: ['buyers.view'], icon: Users },
    { label: 'RFQ Queue', href: '/admin/rfqs', permissions: ['rfqs.view'], icon: FileQuestion },
    { label: 'Quotes', href: '/admin/quotes', permissions: ['quotes.view'], icon: FileText },
    { label: 'Purchase Orders', href: '/admin/purchase-orders', permissions: ['purchase_orders.view'], icon: ShoppingBag },
    { label: 'Contracts', href: '/admin/contracts', permissions: ['contracts.view'], icon: ClipboardCheck },
    { label: 'Sales Reports', href: '/admin/reports', permissions: ['reports.sales'], icon: BarChart3 },
    { label: 'Users & Roles', href: '/admin/users', permissions: ['users.view', 'roles.view'], icon: ShieldCheck }
  ].filter((item) => hasAnyPermission(currentUser.role, item.permissions));
  const hasRevenueData = metrics.revenueTrendData.some((item) => item.revenue > 0 || item.previous > 0);
  const hasVolumeData = metrics.purchaseOrderVolumeData.some((item) => item.orders > 0 || item.rfqs > 0);
  const hasFunnelData = metrics.rfqConversionData.some((item) => item.value > 0);
  const hasInvoiceStatusData = metrics.invoiceStatusData.some((item) => item.value > 0);
  const hasBuyerGrowthData = metrics.buyerGrowthData.some((item) => item.newBuyers > 0 || item.activeBuyers > 0);

  const handleDateRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRange = event.target.value as AdminDashboardDateRange;
    const nextLabel =
      adminDashboardDateRangeOptions.find((option) => option.value === nextRange)?.label || 'Selected period';

    setDashboardState('loading');
    setDateRange(nextRange);

    window.setTimeout(() => {
      setDashboardState('success');
      showToast(`Dashboard updated for ${nextLabel}.`, 'success');
      window.setTimeout(() => setDashboardState('ready'), 1800);
    }, 250);
  };

  const handleRetry = () => {
    setDashboardState('ready');
    showToast('Dashboard data is available again.', 'success');
  };

  const primaryKpis: DashboardKpi[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      href: '/admin/invoices',
      icon: DollarSign,
      subtext: `${metrics.periodLabel} paid revenue`,
      change: metrics.revenueTrend,
      changeType: getTrendType(metrics.revenueTrend)
    },
    {
      title: 'Total Purchase Orders',
      value: metrics.totalPurchaseOrders,
      href: '/admin/purchase-orders',
      icon: ShoppingBag,
      subtext: `${formatCurrency(metrics.totalPurchaseOrderAmount)} order value`,
      change: metrics.purchaseOrderTrend,
      changeType: getTrendType(metrics.purchaseOrderTrend)
    },
    {
      title: 'Active Buyers',
      value: metrics.activeBuyers,
      href: '/admin/buyers',
      icon: Users,
      subtext: `${metrics.newBuyersInPeriod} joined in ${metrics.periodLabel}`,
      badge: 'Verified',
      badgeVariant: 'success'
    },
    {
      title: 'Active Products',
      value: metrics.activeProducts,
      href: '/admin/products',
      icon: Package,
      subtext: `${products.length} total catalog records`,
      badge: 'Catalog',
      badgeVariant: 'primary'
    },
    {
      title: 'Pending Buyer Approvals',
      value: metrics.pendingApprovals,
      href: '/admin/approvals',
      icon: UserCheck,
      subtext: 'Needs-action queue shared with sidebar',
      badge: metrics.pendingApprovals > 0 ? 'Review' : 'Clear',
      badgeVariant: metrics.pendingApprovals > 0 ? 'amber' : 'success'
    }
  ];

  const operationalKpis: DashboardKpi[] = [
    {
      title: 'Open RFQs',
      value: metrics.openRfqs,
      href: '/admin/rfqs',
      icon: FileQuestion,
      subtext: `${formatCurrency(metrics.openRfqValue)} target value`,
      badge: 'Sales',
      badgeVariant: 'primary'
    },
    {
      title: 'Active Purchase Orders',
      value: metrics.activePurchaseOrders,
      href: '/admin/purchase-orders',
      icon: ClipboardCheck,
      subtext: `Within ${metrics.periodLabel}`,
      badge: 'Ops',
      badgeVariant: 'primary'
    },
    {
      title: 'Outstanding Invoices',
      value: formatCurrency(metrics.outstandingInvoicesTotal),
      href: '/admin/invoices',
      icon: Receipt,
      subtext: `${metrics.outstandingInvoices.length} invoices with balance`,
      badge: metrics.overdueInvoices.length > 0 ? 'Risk' : 'Current',
      badgeVariant: metrics.overdueInvoices.length > 0 ? 'danger' : 'success'
    },
    {
      title: 'Low Stock Items',
      value: metrics.lowStockItems.length,
      href: '/admin/inventory',
      icon: Boxes,
      subtext: 'Available quantity at or below reorder point',
      badge: metrics.lowStockItems.length > 0 ? 'Reorder' : 'Healthy',
      badgeVariant: metrics.lowStockItems.length > 0 ? 'amber' : 'success'
    },
    {
      title: 'Shipments In Transit',
      value: metrics.shipmentsInTransit.length,
      href: '/admin/shipments',
      icon: Truck,
      subtext: `${metrics.delayedShipments.length} delayed or past ETA`,
      badge: metrics.delayedShipments.length > 0 ? 'Watch' : 'Moving',
      badgeVariant: metrics.delayedShipments.length > 0 ? 'amber' : 'success'
    }
  ];

  const attentionItems: AttentionItem[] = useMemo(
    () =>
      [
        ...metrics.overdueInvoices.slice(0, 2).map((invoice) => ({
          id: `invoice-${invoice.id}`,
          severity: 'Overdue' as const,
          message: `${invoice.invoiceNumber || invoice.id.toUpperCase()} has ${formatCurrency(
            getInvoiceBalance(invoice),
            invoice.currency || 'USD'
          )} outstanding.`,
          meta: `${getDashboardDaysOverdue(invoice)} days overdue`,
          href: `/admin/invoices/${invoice.id}`
        })),
        ...metrics.lowStockItems.slice(0, 2).map((item) => ({
          id: `stock-${item.id}`,
          severity: 'Low Stock' as const,
          message: `${item.productName} is below reorder threshold.`,
          meta: `${item.available} available / reorder at ${item.reorderPoint}`,
          href: '/admin/inventory'
        })),
        ...metrics.contractsNearExpiry.slice(0, 1).map((contract) => ({
          id: `contract-${contract.id}`,
          severity: 'Near Expiry' as const,
          message: `${contract.contractNumber || contract.id.toUpperCase()} requires contract follow-up.`,
          meta: `Ends ${formatDate(contract.endDate)}`,
          href: `/admin/contracts/${contract.id}`
        })),
        ...metrics.buyersMissingDocuments.slice(0, 1).map((application) => ({
          id: `docs-${application.id}`,
          severity: 'Missing' as const,
          message: `${application.companyName} needs document verification.`,
          meta: application.documentStatus,
          href: `/admin/approvals/${application.id}`
        })),
        ...metrics.delayedShipments.slice(0, 1).map((shipment) => ({
          id: `shipment-${shipment.id}`,
          severity: 'Delayed' as const,
          message: `${shipment.shipmentNumber || shipment.id.toUpperCase()} needs logistics review.`,
          meta: `ETA ${formatDate(shipment.estimatedDelivery)}`,
          href: `/admin/shipments/${shipment.id}`
        }))
      ].slice(0, 6),
    [
      metrics.buyersMissingDocuments,
      metrics.contractsNearExpiry,
      metrics.delayedShipments,
      metrics.lowStockItems,
      metrics.overdueInvoices
    ]
  );

  const attentionCounters = [
    {
      label: 'Overdue invoices',
      value: metrics.overdueInvoices.length,
      href: '/admin/invoices',
      severity: 'Overdue',
      icon: Receipt
    },
    {
      label: 'Low stock',
      value: metrics.lowStockItems.length,
      href: '/admin/inventory',
      severity: 'Low Stock',
      icon: Boxes
    },
    {
      label: 'Expiring contracts',
      value: metrics.contractsNearExpiry.length,
      href: '/admin/contracts',
      severity: 'Near Expiry',
      icon: FileText
    },
    {
      label: 'Buyer documents',
      value: metrics.buyersMissingDocuments.length,
      href: '/admin/approvals',
      severity: 'Missing',
      icon: UserCheck
    }
  ];

  const recentPoColumns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO Number',
      accessor: (po) => (
        <div className="min-w-[150px]">
          <Link to={`/admin/purchase-orders/${po.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
            {po.poNumber || po.id.toUpperCase()}
          </Link>
          <div className="text-xs text-slate-500">{po.rfqNumber || po.quoteNumber || 'Direct order'}</div>
        </div>
      )
    },
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (po) => <span className="font-semibold text-slate-800">{po.companyName || po.buyerName}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      accessor: (po) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(po.grandTotal || po.totalAmount || po.subtotal || 0, po.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (po) => <StatusBadge status={po.status} size="sm" />
    },
    {
      key: 'created',
      header: 'Created Date',
      accessor: (po) => <span className="whitespace-nowrap text-slate-700">{formatDate(po.orderDate)}</span>
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      accessor: (po) => (
        <Link
          to={`/admin/purchase-orders/${po.id}`}
          aria-label={`View purchase order ${po.poNumber || po.id.toUpperCase()}`}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          View
        </Link>
      )
    }
  ];

  const pendingApprovalColumns: Column<BuyerApplication>[] = [
    {
      key: 'company',
      header: 'Company',
      accessor: (application) => (
        <div className="min-w-[210px]">
          <Link to={`/admin/approvals/${application.id}`} className="font-bold text-blue-700 hover:text-blue-900">
            {application.companyName}
          </Link>
          <div className="font-mono text-xs text-slate-500">{application.applicationNumber}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      accessor: (application) => (
        <div>
          <div className="font-semibold text-slate-800">{application.contactName}</div>
          <div className="text-xs text-slate-500">{application.contactEmail}</div>
        </div>
      )
    },
    {
      key: 'documents',
      header: 'Document Status',
      accessor: (application) => <StatusBadge status={application.documentStatus} size="sm" />
    },
    {
      key: 'risk',
      header: 'Risk',
      accessor: (application) => <StatusBadge status={application.riskStatus} size="sm" />
    },
    {
      key: 'submitted',
      header: 'Submitted Date',
      accessor: (application) => <span className="whitespace-nowrap text-slate-700">{formatDate(application.submittedDate)}</span>
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      accessor: (application) => (
        <Link
          to={`/admin/approvals/${application.id}`}
          aria-label={`Review buyer application ${application.applicationNumber}`}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Review
        </Link>
      )
    }
  ];

  const overdueInvoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoice',
      header: 'Invoice Number',
      accessor: (invoice) => (
        <Link to={`/admin/invoices/${invoice.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
          {invoice.invoiceNumber || invoice.id.toUpperCase()}
        </Link>
      )
    },
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (invoice) => <span className="font-semibold text-slate-800">{invoice.companyName || invoice.buyerName}</span>
    },
    {
      key: 'amount',
      header: 'Outstanding Amount',
      align: 'right',
      accessor: (invoice) => (
        <span className="font-mono font-bold text-rose-700">
          {formatCurrency(getInvoiceBalance(invoice), invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      accessor: (invoice) => <span className="whitespace-nowrap text-slate-700">{formatDate(invoice.dueDate)}</span>
    },
    {
      key: 'days',
      header: 'Days Overdue',
      align: 'right',
      accessor: (invoice) => <span className="font-bold text-rose-700">{getDashboardDaysOverdue(invoice)}</span>
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      accessor: (invoice) => (
        <Link
          to={`/admin/invoices/${invoice.id}`}
          aria-label={`View invoice ${invoice.invoiceNumber || invoice.id.toUpperCase()}`}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          View
        </Link>
      )
    }
  ];

  const lowStockColumns: Column<InventoryItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[230px]">
          <div className="font-bold text-slate-900">{item.productName}</div>
          <div className="text-xs text-slate-500">{item.locationBin || item.location || 'Primary pick face'}</div>
        </div>
      )
    },
    {
      key: 'sku',
      header: 'SKU',
      accessor: (item) => <span className="font-mono font-bold text-blue-700">{item.sku}</span>
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      accessor: (item) => <span className="text-slate-700">{item.warehouseName}</span>
    },
    {
      key: 'available',
      header: 'Available Stock',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-rose-700">{item.available}</span>
    },
    {
      key: 'reorder',
      header: 'Reorder Point',
      align: 'right',
      accessor: (item) => <span className="font-mono text-slate-700">{item.reorderPoint}</span>
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      accessor: (item) => (
        <Link
          to="/admin/inventory"
          aria-label={`Adjust inventory for ${item.sku}`}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          Adjust
        </Link>
      )
    }
  ];

  const quickActions = [
    {
      label: 'Add Product',
      href: '/admin/products/new',
      icon: Package,
      detail: 'Create SKU, MOQ, tiers, and stock.'
    },
    {
      label: 'Review Buyer Approvals',
      href: '/admin/approvals',
      icon: UserCheck,
      detail: 'Verify applications and documents.'
    },
    {
      label: 'Create Purchase Order',
      href: '/admin/purchase-orders',
      icon: ShoppingBag,
      detail: 'Open the order operations workspace.'
    },
    {
      label: 'Adjust Inventory',
      href: '/admin/inventory',
      icon: Warehouse,
      detail: 'Review stock and bin adjustments.'
    },
    {
      label: 'Create Invoice',
      href: '/admin/invoices',
      icon: Receipt,
      detail: 'Open finance billing tools.'
    },
    {
      label: 'Create Shipment',
      href: '/admin/shipments',
      icon: Truck,
      detail: 'Prepare carrier and tracking records.'
    },
    {
      label: 'View Reports',
      href: '/admin/reports',
      icon: BarChart3,
      detail: 'Analyze sales and operations.'
    }
  ];

  const renderKpiGrid = (items: DashboardKpi[]) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {items.map((item) => (
        <Link
          key={item.title}
          to={item.href}
          aria-label={`Open ${item.title}`}
          className="block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <KPICard
            title={item.title}
            value={item.value}
            icon={item.icon}
            change={item.change}
            changeType={item.changeType}
            subtext={item.subtext}
            badge={item.badge}
            badgeVariant={item.badgeVariant}
            className="h-full min-h-[170px]"
          />
        </Link>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="ERP overview for buyer onboarding, sales, finance, inventory, and logistics."
        className="mb-4 pb-3"
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Dashboard' }
        ]}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-nowrap sm:items-end">
            <div className="w-full sm:w-[210px]">
              <Select
                id="admin-dashboard-date-range"
                label="Date Range"
                value={dateRange}
                onChange={handleDateRangeChange}
                options={adminDashboardDateRangeOptions}
                className="h-10"
              />
            </div>
            <Link to="/admin/approvals" className="sm:self-end">
              <Button variant="outline" size="sm" icon={UserCheck} className="min-h-10 w-full sm:w-auto">
                Review Approvals
              </Button>
            </Link>
            <Link to="/admin/buyers" className="sm:self-end">
              <Button variant="primary" size="sm" icon={Users} className="min-h-10 w-full sm:w-auto">
                Manage Buyers
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="border-blue-100 bg-blue-50/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Active role dashboard</div>
                <h2 className="text-lg font-extrabold text-slate-900">{roleDefinition.name}</h2>
              </div>
              <StatusBadge status={`${rolePermissionCount} permissions`} size="sm" showDot={false} />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs leading-5 text-slate-600 md:grid-cols-2">
              {roleDefinition.dashboardFocus.map((focus) => (
                <div key={focus} className="rounded-lg border border-blue-100 bg-white/80 px-3 py-2">
                  {focus}
                </div>
              ))}
            </div>
          </div>
          {roleQuickLinks.length > 0 && (
            <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-md lg:justify-end">
              {roleQuickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.href} to={item.href}>
                    <Button variant="outline" size="xs" icon={Icon}>
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {dashboardState === 'error' && (
        <Alert type="error" title="Dashboard could not refresh.">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Operational records are still available from their individual admin pages.</span>
            <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {dashboardState === 'success' && (
        <Alert type="success" title="Dashboard updated.">
          Metrics and charts now reflect {metrics.periodLabel.toLowerCase()}.
        </Alert>
      )}

      {metrics.totalPurchaseOrders === 0 && metrics.totalRevenue === 0 && metrics.newBuyersInPeriod === 0 && (
        <Alert type="info" title="No activity found for this date range.">
          Current operational queues remain visible below so staff can keep working.
        </Alert>
      )}

      <section
        aria-label="Requires attention summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {attentionCounters.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.href}
              className="group flex min-h-[76px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs transition hover:border-blue-200 hover:bg-blue-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:border-blue-200 group-hover:text-blue-700">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">{item.label}</span>
                  <span className="mt-1 block">
                    <StatusBadge status={item.severity} size="sm" />
                  </span>
                </span>
              </span>
              <span className="font-mono text-2xl font-extrabold text-slate-900">{item.value}</span>
            </Link>
          );
        })}
      </section>

      <section aria-labelledby="primary-kpis" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="primary-kpis" className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Business Overview
          </h2>
          <span className="text-xs font-semibold text-slate-500">{metrics.periodLabel}</span>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingSkeleton key={index} type="card" />
            ))}
          </div>
        ) : (
          renderKpiGrid(primaryKpis)
        )}
      </section>

      <section aria-labelledby="operational-kpis" className="space-y-3">
        <h2 id="operational-kpis" className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Operational Health
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingSkeleton key={index} type="card" />
            ))}
          </div>
        ) : (
          renderKpiGrid(operationalKpis)
        )}
      </section>

      <section aria-labelledby="dashboard-analytics" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="dashboard-analytics" className="text-lg font-bold text-slate-900">
              Analytics
            </h2>
            <p className="text-sm text-slate-500">
              Current period is compared against the previous matching period where available.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Through {dateFormatter.format(ADMIN_DASHBOARD_REFERENCE_DATE)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <ChartCard
            title="Revenue Trend"
            subtitle="Paid invoice revenue against the previous period."
            legend={
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Current
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                  Previous
                </span>
              </div>
            }
          >
            {isLoading ? (
              <LoadingSkeleton type="table" rows={4} className="h-72" />
            ) : hasRevenueData ? (
              <div role="img" aria-label="Revenue trend comparing current and previous periods" className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.revenueTrendData} margin={{ top: 12, right: 18, left: 8, bottom: 6 }}>
                    <defs>
                      <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Current"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#dashboardRevenueFill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      name="Previous"
                      stroke="#64748b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <DashboardChartEmpty title="No revenue in this range" description="Paid invoice revenue will appear here as the period changes." />
            )}
          </ChartCard>

          <ChartCard
            title="Sales / Purchase Order Volume"
            subtitle="Purchase orders and RFQs created during the selected period."
            legend={
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  POs
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  RFQs
                </span>
              </div>
            }
          >
            {isLoading ? (
              <LoadingSkeleton type="table" rows={4} className="h-72" />
            ) : hasVolumeData ? (
              <div role="img" aria-label="Purchase order and RFQ volume by period" className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.purchaseOrderVolumeData} margin={{ top: 12, right: 18, left: 8, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={42} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" name="Purchase Orders" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="rfqs" name="RFQs" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <DashboardChartEmpty title="No sales volume" description="Purchase order and RFQ activity will display when records fall inside this range." />
            )}
          </ChartCard>

          <ChartCard title="RFQ Conversion Funnel" subtitle="Progression from submitted RFQs to converted purchase orders.">
            {isLoading ? (
              <LoadingSkeleton type="table" rows={4} className="h-72" />
            ) : hasFunnelData ? (
              <div role="img" aria-label="RFQ conversion funnel by stage" className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.rfqConversionData} layout="vertical" margin={{ top: 12, right: 22, left: 22, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={12} width={112} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="RFQs" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <DashboardChartEmpty title="No RFQ activity" description="RFQ stages will appear after submissions are inside this period." />
            )}
          </ChartCard>

          <ChartCard
            title="Invoice Status"
            subtitle="Invoice health across paid, outstanding, overdue, and draft records."
            legend={
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                {metrics.invoiceStatusData.map((item) => (
                  <span key={item.name} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                ))}
              </div>
            }
          >
            {isLoading ? (
              <LoadingSkeleton type="table" rows={4} className="h-72" />
            ) : hasInvoiceStatusData ? (
              <div role="img" aria-label="Invoice status distribution" className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.invoiceStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {metrics.invoiceStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <DashboardChartEmpty title="No invoice records" description="Invoice status distribution will appear when finance records are available." />
            )}
          </ChartCard>

          <ChartCard
            title="Buyer Growth"
            subtitle="New buyers and cumulative active buyers over time."
            className="2xl:col-span-2"
            legend={
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Active buyers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  New buyers
                </span>
              </div>
            }
          >
            {isLoading ? (
              <LoadingSkeleton type="table" rows={4} className="h-72" />
            ) : hasBuyerGrowthData ? (
              <div role="img" aria-label="Buyer growth over the selected period" className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.buyerGrowthData} margin={{ top: 12, right: 22, left: 8, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={42} />
                    <Tooltip />
                    <Line type="monotone" dataKey="activeBuyers" name="Active Buyers" stroke="#2563eb" strokeWidth={3} />
                    <Line type="monotone" dataKey="newBuyers" name="New Buyers" stroke="#059669" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <DashboardChartEmpty title="No buyer growth in this range" description="Buyer onboarding activity will display when registrations fall inside this period." />
            )}
          </ChartCard>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_360px]">
        <Card
          title="Quick Actions"
          subtitle="Common admin workflows with direct navigation."
          className="h-full"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group flex min-h-[94px] items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900">{action.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">{action.detail}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card title="Requires Attention" subtitle="Highest priority cross-functional follow-ups.">
          {attentionItems.length > 0 ? (
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="block rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start justify-between gap-3">
                    <StatusBadge status={item.severity} size="sm" />
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-snug text-slate-900">{item.message}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{item.meta}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No urgent follow-ups"
              description="Finance, inventory, buyer, contract, and logistics queues are clear."
              className="border-slate-200"
            />
          )}
        </Card>
      </div>

      <section aria-labelledby="dashboard-tables" className="space-y-4">
        <div>
          <h2 id="dashboard-tables" className="text-lg font-bold text-slate-900">
            Operations Work Queue
          </h2>
          <p className="text-sm text-slate-500">Recent records and needs-action lists across the admin portal.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <Card
            title="Recent Purchase Orders"
            action={
              <Link to="/admin/purchase-orders" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                View All
              </Link>
            }
          >
            <DataTable
              columns={recentPoColumns}
              data={metrics.recentPurchaseOrders}
              compact
              isLoading={isLoading}
              className={tableClassName}
              emptyMessage="No purchase orders are available for the dashboard."
            />
          </Card>

          <Card
            title="Pending Buyer Approvals"
            action={
              <Link to="/admin/approvals" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                View All
              </Link>
            }
          >
            <DataTable
              columns={pendingApprovalColumns}
              data={metrics.pendingApplications}
              compact
              isLoading={isLoading}
              className={tableClassName}
              emptyMessage="No buyer applications require review."
            />
          </Card>

          <Card
            title="Overdue Invoices"
            action={
              <Link to="/admin/invoices" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                View All
              </Link>
            }
          >
            <DataTable
              columns={overdueInvoiceColumns}
              data={metrics.overdueInvoices.slice(0, 6)}
              compact
              isLoading={isLoading}
              className={tableClassName}
              emptyMessage="No overdue invoices in the current ledger."
            />
          </Card>

          <Card
            title="Low Stock Alerts"
            action={
              <Link to="/admin/inventory" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                View All
              </Link>
            }
          >
            <DataTable
              columns={lowStockColumns}
              data={metrics.lowStockItems.slice(0, 6)}
              compact
              isLoading={isLoading}
              className={tableClassName}
              emptyMessage="No inventory items are below reorder point."
            />
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Admin Activity" subtitle="Recent staff and system operations." className="xl:col-span-2">
          <div className="space-y-3">
            {recentAdminActivity.map((activity) => (
              <div key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-bold text-slate-900">{activity.title}</div>
                  <div className="text-xs font-semibold text-slate-500">{activity.timestamp}</div>
                </div>
                <div className="mt-1 text-xs font-bold text-blue-700">
                  {activity.module} / {activity.actor}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{activity.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Queue Summary" subtitle="Current needs-action counts.">
          <div className="space-y-3">
            {[
              {
                label: 'Buyer approvals',
                value: metrics.pendingApprovals,
                icon: Building2,
                href: '/admin/approvals'
              },
              {
                label: 'Open RFQs',
                value: metrics.openRfqs,
                icon: FileQuestion,
                href: '/admin/rfqs'
              },
              {
                label: 'Near-expiry contracts',
                value: metrics.contractsNearExpiry.length,
                icon: FileText,
                href: '/admin/contracts'
              },
              {
                label: 'Delayed shipments',
                value: metrics.delayedShipments.length,
                icon: AlertTriangle,
                href: '/admin/shipments'
              },
              {
                label: 'Low stock products',
                value: metrics.lowStockItems.length,
                icon: Boxes,
                href: '/admin/inventory'
              }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-bold text-slate-800">{item.label}</span>
                  </span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">{item.value}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
