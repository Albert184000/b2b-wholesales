import React from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  DollarSign,
  FileQuestion,
  Package,
  Receipt,
  ShoppingBag,
  Truck,
  UserCheck,
  Users
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  Button,
  Card,
  ChartCard,
  Column,
  DataTable,
  KPICard,
  PageHeader,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BuyerApplication, Invoice, PurchaseOrder, RFQ } from '../../types';
import { getInvoiceBalance } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

export const AdminDashboardPage: React.FC = () => {
  const {
    adminDashboardStats,
    buyerApplications,
    purchaseOrders,
    products,
    rfqs,
    invoices,
    inventory,
    recentAdminActivity
  } = useApp();

  const pendingApplications = buyerApplications.filter((application) =>
    !['Approved', 'Rejected'].includes(application.status)
  );
  const totalOrders = purchaseOrders.length;
  const totalProducts = products.length;
  const recentPOs = purchaseOrders.slice(0, 5);
  const latestRfqs = rfqs.slice(0, 5);
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'Overdue').slice(0, 5);
  const lowStockItems = inventory.filter((item) => item.available <= item.reorderPoint).slice(0, 5);

  const pendingColumns: Column<BuyerApplication>[] = [
    {
      key: 'company',
      header: 'Company',
      accessor: (application) => (
        <div className="min-w-[200px]">
          <Link to={`/admin/approvals/${application.id}`} className="font-bold text-blue-700 hover:text-blue-900">
            {application.companyName}
          </Link>
          <div className="text-xs text-slate-500">{application.applicationNumber}</div>
        </div>
      )
    },
    {
      key: 'submitted',
      header: 'Submitted',
      accessor: (application) => <span className="font-semibold text-slate-700">{application.submittedDate}</span>
    },
    {
      key: 'reviewer',
      header: 'Reviewer',
      accessor: (application) => <span className="text-slate-700">{application.assignedReviewer}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (application) => <StatusBadge status={application.status} size="sm" />
    }
  ];

  const poColumns: Column<PurchaseOrder>[] = [
    {
      key: 'po',
      header: 'PO',
      accessor: (po) => (
        <Link to={`/admin/purchase-orders/${po.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
          {po.poNumber || po.id.toUpperCase()}
        </Link>
      )
    },
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (po) => <span className="font-semibold text-slate-800">{po.companyName}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      accessor: (po) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(po.grandTotal || po.totalAmount || 0, po.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (po) => <StatusBadge status={po.status} size="sm" />
    }
  ];

  const rfqColumns: Column<RFQ>[] = [
    {
      key: 'rfq',
      header: 'RFQ',
      accessor: (rfq) => <span className="font-mono font-bold text-blue-700">{rfq.rfqNumber || rfq.id.toUpperCase()}</span>
    },
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (rfq) => <span className="font-semibold text-slate-800">{rfq.companyName || rfq.buyerName}</span>
    },
    {
      key: 'value',
      header: 'Target',
      align: 'right',
      accessor: (rfq) => <span className="font-mono font-bold">{formatCurrency(rfq.targetBudget || rfq.targetValue || 0)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (rfq) => <StatusBadge status={rfq.status} size="sm" />
    }
  ];

  const overdueColumns: Column<Invoice>[] = [
    {
      key: 'invoice',
      header: 'Invoice',
      accessor: (invoice) => (
        <Link to={`/admin/invoices/${invoice.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
          {invoice.invoiceNumber || invoice.id.toUpperCase()}
        </Link>
      )
    },
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (invoice) => <span className="font-semibold text-slate-800">{invoice.companyName}</span>
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      accessor: (invoice) => (
        <span className="font-mono font-bold text-rose-700">
          {formatCurrency(getInvoiceBalance(invoice), invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'due',
      header: 'Due',
      accessor: (invoice) => <span className="font-semibold text-slate-700">{invoice.dueDate}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="ERP overview for buyer onboarding, sales pipeline, finance risk, inventory, and logistics."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Dashboard' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/approvals">
              <Button variant="outline" size="sm" icon={UserCheck}>
                Review Approvals
              </Button>
            </Link>
            <Link to="/admin/buyers">
              <Button variant="primary" size="sm" icon={Users}>
                Manage Buyers
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard title="Total Revenue" value={formatCurrency(adminDashboardStats.totalRevenue)} change="+18.4%" changeType="positive" icon={DollarSign} />
        <KPICard title="Total Orders" value={totalOrders} subtext="Purchase orders in queue" icon={ShoppingBag} />
        <KPICard title="Active Buyers" value={adminDashboardStats.activeBuyers} subtext="Verified commercial accounts" icon={Users} />
        <KPICard title="Total Products" value={totalProducts} subtext={`${products.filter((product) => product.status === 'Active').length} active catalog SKUs`} icon={Package} />
        <KPICard title="Pending Buyer Approvals" value={adminDashboardStats.pendingApprovals} subtext={`${pendingApplications.length} visible in queue`} icon={UserCheck} badge="Review" badgeVariant="amber" />
        <KPICard title="Open RFQs" value={adminDashboardStats.openRFQs} subtext="Awaiting sales action" icon={FileQuestion} />
        <KPICard title="Active Purchase Orders" value={adminDashboardStats.purchaseOrdersCount} subtext="Approved or processing" icon={ShoppingBag} />
        <KPICard title="Outstanding Invoices" value={formatCurrency(adminDashboardStats.outstandingInvoicesTotal)} subtext="Open AR exposure" icon={Receipt} badge="Finance" badgeVariant="danger" />
        <KPICard title="Low Stock Items" value={adminDashboardStats.lowStockItemsCount} subtext="Below reorder point" icon={Boxes} badge="Ops" badgeVariant="amber" />
        <KPICard title="Shipments In Transit" value={adminDashboardStats.shipmentsInTransitCount} subtext="Carrier movement active" icon={Truck} />
      </div>

      <Card title="Quick Actions">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Add Product', href: '/admin/products/new', icon: Package, detail: 'Create SKU, MOQ, tiers, and stock' },
            { label: 'Review Orders', href: '/admin/purchase-orders', icon: ShoppingBag, detail: 'Approve, allocate, and fulfill POs' },
            { label: 'Approve Buyers', href: '/admin/approvals', icon: UserCheck, detail: 'Verify business applications' },
            { label: 'Adjust Inventory', href: '/admin/inventory', icon: Boxes, detail: 'Update stock counts by warehouse' }
          ].map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                to={action.href}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">{action.label}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{action.detail}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Revenue Overview" subtitle="Monthly revenue against operating target." className="xl:col-span-2 border-slate-200">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminDashboardStats.revenueMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#adminRevenue)" />
                <Line type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Sales by Category" subtitle="Share of billed product categories." className="border-slate-200">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={adminDashboardStats.salesByCategoryData} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3}>
                  {adminDashboardStats.salesByCategoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Monthly Sales" subtitle="Sales records and quoted opportunities." className="border-slate-200">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminDashboardStats.monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="quotes" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="RFQ Conversion" subtitle="RFQ funnel volume by stage." className="border-slate-200">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminDashboardStats.rfqConversionData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={12} width={86} />
                <Tooltip />
                <Bar dataKey="value" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Purchase Order Volume" subtitle="Approved versus pending PO flow." className="border-slate-200">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminDashboardStats.poVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="approved" stackId="po" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" stackId="po" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Buyer Growth" subtitle="Verified buyer count by group." className="border-slate-200">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={adminDashboardStats.buyerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="standard" stroke="#64748b" strokeWidth={2} />
              <Line type="monotone" dataKey="corporate" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="vip" stroke="#059669" strokeWidth={2} />
              <Line type="monotone" dataKey="distributor" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card
          title="Pending Buyer Approvals"
          action={
            <Link to="/admin/approvals" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View queue
            </Link>
          }
        >
          <DataTable columns={pendingColumns} data={pendingApplications.slice(0, 5)} compact emptyMessage="No pending buyer approvals." />
        </Card>

        <Card
          title="Recent Purchase Orders"
          action={
            <Link to="/admin/purchase-orders" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View POs
            </Link>
          }
        >
          <DataTable columns={poColumns} data={recentPOs} compact />
        </Card>

        <Card title="Latest RFQs">
          <DataTable columns={rfqColumns} data={latestRfqs} compact />
        </Card>

        <Card title="Overdue Invoices">
          <DataTable columns={overdueColumns} data={overdueInvoices} compact emptyMessage="No overdue invoices in the current ledger." />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Low Stock Alerts">
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="font-mono text-blue-700">{item.sku} / {item.warehouseName}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-rose-700">{item.available} available</div>
                  <div className="text-slate-500">Reorder at {item.reorderPoint}</div>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No low stock alerts.
              </div>
            )}
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="space-y-3">
            {recentAdminActivity.map((activity) => (
              <div key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-bold text-slate-900">{activity.title}</div>
                  <div className="text-xs text-slate-500">{activity.timestamp}</div>
                </div>
                <div className="mt-1 text-xs font-semibold text-blue-700">{activity.module} / {activity.actor}</div>
                <p className="mt-2 text-sm text-slate-600">{activity.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
