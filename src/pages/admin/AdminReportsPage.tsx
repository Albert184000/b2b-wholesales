import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Download,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  Package,
  Printer,
  Receipt,
  RefreshCw,
  SearchCheck,
  TrendingUp,
  Truck,
  Users
} from 'lucide-react';
import {
  Button,
  Card,
  ChartCard,
  Column,
  DataTable,
  EmptyState,
  Input,
  KPICard,
  PageHeader,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/pricing';
import { getInvoiceBalance, getInvoiceTotal } from '../../utils/financeLogistics';
import { getPOTotal } from '../../utils/poContract';

type ReportType =
  | 'sales'
  | 'buyers'
  | 'contracts'
  | 'employees'
  | 'products'
  | 'inventory'
  | 'finance'
  | 'shipments';

interface ReportRow {
  id: string;
  primary: string;
  secondary: string;
  owner: string;
  metric: string;
  amount: number;
  date: string;
  status: string;
  buyerId?: string;
  buyerGroup?: string;
  productId?: string;
  category?: string;
  salesRep?: string;
  warehouse?: string;
  currency?: string;
}

const reportTypes: { id: ReportType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'sales', label: 'Sales Reports', icon: LineChartIcon },
  { id: 'buyers', label: 'Buyer Reports', icon: Users },
  { id: 'contracts', label: 'Contract Reports', icon: BriefcaseBusiness },
  { id: 'employees', label: 'Employee Performance', icon: BarChart3 },
  { id: 'products', label: 'Product Reports', icon: Package },
  { id: 'inventory', label: 'Inventory Reports', icon: Boxes },
  { id: 'finance', label: 'Finance Reports', icon: Receipt },
  { id: 'shipments', label: 'Shipment Reports', icon: Truck }
];

const employeePerformance = [
  { id: 'emp-001', name: 'David Chen', role: 'Account Executive', revenue: 485000, quotes: 34, winRate: 78, buyerCount: 12, status: 'Active' },
  { id: 'emp-002', name: 'Marcus Vance', role: 'Sales Manager', revenue: 392000, quotes: 27, winRate: 74, buyerCount: 18, status: 'Active' },
  { id: 'emp-003', name: 'Sreymom Heng', role: 'Sales Manager', revenue: 318000, quotes: 21, winRate: 71, buyerCount: 10, status: 'Active' },
  { id: 'emp-004', name: 'Malis Chan', role: 'Finance Officer', revenue: 0, quotes: 0, winRate: 94, buyerCount: 0, status: 'Active' }
];

const defaultDateFrom = '2026-07-01';
const defaultDateTo = '2026-08-24';

export const AdminReportsPage: React.FC = () => {
  const {
    adminDashboardStats,
    buyers,
    products,
    inventory,
    purchaseOrders,
    quotes,
    rfqs,
    contracts,
    invoices,
    shipments,
    showToast
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeReport = (searchParams.get('tab') as ReportType) || 'sales';
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const [buyerFilter, setBuyerFilter] = useState('ALL');
  const [buyerGroupFilter, setBuyerGroupFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [salesRepFilter, setSalesRepFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewGenerated, setPreviewGenerated] = useState(true);

  const totalRevenue = purchaseOrders.reduce((sum, po) => sum + getPOTotal(po), 0);
  const totalPurchaseOrders = purchaseOrders.length;
  const activeBuyers = buyers.filter((buyer) => ['Approved', 'Active'].includes(buyer.status)).length;
  const pendingRfqs = rfqs.filter((rfq) => ['Submitted', 'Under Review'].includes(rfq.status)).length;
  const acceptedQuotes = quotes.filter((quote) => quote.status === 'Accepted').length;
  const activeContracts = contracts.filter((contract) => contract.status === 'Active').length;
  const renewedContracts = contracts.filter((contract) => contract.status === 'Renewed').length;
  const renewalRate = contracts.length ? Math.round((renewedContracts / contracts.length) * 100) : 0;
  const averageDealSize = totalPurchaseOrders ? totalRevenue / totalPurchaseOrders : 0;
  const buyerLifetimeValue = buyers.length
    ? buyers.reduce((sum, buyer) => sum + (buyer.totalPurchases || 0), 0) / buyers.length
    : 0;
  const topRep = [...employeePerformance].sort((a, b) => b.revenue - a.revenue)[0];

  const buyerOptions = buyers.map((buyer) => ({ label: buyer.companyName, value: buyer.id }));
  const buyerGroupOptions = Array.from(new Set(buyers.map((buyer) => buyer.buyerGroup))).map((group) => ({
    label: group,
    value: group
  }));
  const productOptions = products.map((product) => ({ label: product.name, value: product.id }));
  const categoryOptions = Array.from(new Set(products.map((product) => product.category))).map((category) => ({
    label: category,
    value: category
  }));
  const repOptions = Array.from(
    new Set([
      ...buyers.map((buyer) => buyer.assignedRep.name),
      ...purchaseOrders.map((po) => po.assignedRep?.name).filter(Boolean),
      ...quotes.map((quote) => quote.salesRep?.name).filter(Boolean)
    ])
  ).map((rep) => ({ label: String(rep), value: String(rep) }));
  const warehouseOptions = Array.from(new Set(inventory.map((item) => item.warehouseName))).map((warehouse) => ({
    label: warehouse,
    value: warehouse
  }));

  const reportRows = useMemo<ReportRow[]>(() => {
    if (activeReport === 'buyers') {
      return buyers.map((buyer) => ({
        id: buyer.id,
        primary: buyer.companyName,
        secondary: `${buyer.buyerGroup} / ${buyer.paymentTerms}`,
        owner: buyer.assignedRep.name,
        metric: `${Math.round((buyer.usedCredit / buyer.creditLimit) * 100)}% credit used`,
        amount: buyer.totalPurchases || 0,
        date: buyer.joinedDate,
        status: buyer.status,
        buyerId: buyer.id,
        buyerGroup: buyer.buyerGroup,
        salesRep: buyer.assignedRep.name,
        currency: 'USD'
      }));
    }

    if (activeReport === 'contracts') {
      return contracts.map((contract) => ({
        id: contract.id,
        primary: contract.contractNumber || contract.id,
        secondary: contract.title,
        owner: contract.assignedRep?.name || 'Account team',
        metric: contract.renewalDate ? `Renewal ${contract.renewalDate}` : contract.paymentTerms || 'Terms pending',
        amount: contract.contractValue || 0,
        date: contract.endDate,
        status: contract.status,
        buyerId: contract.buyerId,
        buyerGroup: contract.buyerGroup,
        salesRep: contract.assignedRep?.name,
        currency: contract.currency || 'USD'
      }));
    }

    if (activeReport === 'employees') {
      return employeePerformance.map((employee) => ({
        id: employee.id,
        primary: employee.name,
        secondary: employee.role,
        owner: `${employee.buyerCount} buyers`,
        metric: `${employee.winRate}% performance score`,
        amount: employee.revenue,
        date: dateTo,
        status: employee.status,
        salesRep: employee.name,
        currency: 'USD'
      }));
    }

    if (activeReport === 'products') {
      return products.map((product) => ({
        id: product.id,
        primary: product.sku,
        secondary: product.name,
        owner: product.brand,
        metric: `MOQ ${product.moq.toLocaleString()} ${product.unit}`,
        amount: product.basePrice,
        date: product.tierPricing[0]?.effectiveDate || dateTo,
        status: product.status,
        productId: product.id,
        category: product.category,
        currency: product.currency || 'USD'
      }));
    }

    if (activeReport === 'inventory') {
      return inventory.map((item) => ({
        id: item.id,
        primary: item.sku,
        secondary: item.productName,
        owner: item.warehouseName,
        metric: `${item.available.toLocaleString()} available / ${item.reserved.toLocaleString()} reserved`,
        amount: item.available * item.unitCost,
        date: dateTo,
        status: item.available <= 0 ? 'Out of Stock' : item.available <= item.reorderPoint ? 'Low Stock' : 'In Stock',
        productId: item.productId,
        warehouse: item.warehouseName,
        currency: 'USD'
      }));
    }

    if (activeReport === 'finance') {
      return invoices.map((invoice) => ({
        id: invoice.id,
        primary: invoice.invoiceNumber || invoice.id,
        secondary: invoice.companyName || invoice.buyerName || 'Buyer pending',
        owner: invoice.poNumber || invoice.poId || 'No PO',
        metric: `Balance ${formatCurrency(getInvoiceBalance(invoice), invoice.currency || 'USD')}`,
        amount: getInvoiceTotal(invoice),
        date: invoice.dueDate,
        status: invoice.status,
        buyerId: invoice.buyerId,
        currency: invoice.currency || 'USD'
      }));
    }

    if (activeReport === 'shipments') {
      return shipments.map((shipment) => ({
        id: shipment.id,
        primary: shipment.shipmentNumber || shipment.id,
        secondary: shipment.companyName || shipment.poNumber || 'Shipment buyer pending',
        owner: shipment.carrier,
        metric: `${shipment.trackingNumber} / ${shipment.serviceLevel || 'Standard'}`,
        amount: shipment.totalShipped || shipment.items?.reduce((sum, item) => sum + item.shippedQty, 0) || 0,
        date: shipment.estimatedDelivery,
        status: shipment.status,
        buyerId: shipment.buyerId,
        warehouse: shipment.warehouseName || shipment.originWarehouse,
        currency: 'USD'
      }));
    }

    return purchaseOrders.map((po) => ({
      id: po.id,
      primary: po.poNumber || po.id,
      secondary: po.companyName || po.buyerName || po.buyerId,
      owner: po.assignedRep?.name || 'Unassigned',
      metric: `${po.items.length} line item${po.items.length === 1 ? '' : 's'}`,
      amount: getPOTotal(po),
      date: po.orderDate,
      status: po.status,
      buyerId: po.buyerId,
      salesRep: po.assignedRep?.name,
      currency: po.currency || 'USD'
    }));
  }, [activeReport, buyers, contracts, dateTo, inventory, invoices, products, purchaseOrders, shipments]);

  const filteredRows = reportRows.filter((row) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.primary, row.secondary, row.owner, row.metric, row.status, row.id]
        .join(' ')
        .toLowerCase()
        .includes(query);
    const matchesBuyer = buyerFilter === 'ALL' || row.buyerId === buyerFilter;
    const matchesGroup = buyerGroupFilter === 'ALL' || row.buyerGroup === buyerGroupFilter;
    const matchesProduct = productFilter === 'ALL' || row.productId === productFilter;
    const matchesCategory = categoryFilter === 'ALL' || row.category === categoryFilter;
    const matchesRep = salesRepFilter === 'ALL' || row.salesRep === salesRepFilter || row.owner === salesRepFilter;
    const matchesWarehouse = warehouseFilter === 'ALL' || row.warehouse === warehouseFilter;
    const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
    const matchesCurrency = currencyFilter === 'ALL' || row.currency === currencyFilter;

    return (
      matchesSearch &&
      matchesBuyer &&
      matchesGroup &&
      matchesProduct &&
      matchesCategory &&
      matchesRep &&
      matchesWarehouse &&
      matchesStatus &&
      matchesCurrency
    );
  });

  const reportTotal = filteredRows.reduce((sum, row) => sum + row.amount, 0);
  const reportStatuses = Array.from(new Set(reportRows.map((row) => row.status))).map((status) => ({ label: status, value: status }));
  const chartRows =
    activeReport === 'sales'
      ? adminDashboardStats.revenueMonthlyData
      : adminDashboardStats.buyerGrowthData.map((row) => ({
          month: row.month,
          revenue: row.standard + row.corporate + row.vip + row.distributor,
          target: row.vip + row.distributor
        }));

  const rowColumns: Column<ReportRow>[] = [
    {
      key: 'record',
      header: 'Record',
      accessor: (row) => (
        <div className="min-w-[240px]">
          <div className="font-bold text-slate-900">{row.primary}</div>
          <div className="text-xs text-slate-500">{row.secondary}</div>
        </div>
      )
    },
    { key: 'owner', header: 'Owner / Source', accessor: (row) => <span className="font-semibold text-slate-800">{row.owner}</span> },
    { key: 'metric', header: 'Metric', accessor: (row) => <span className="text-sm text-slate-600">{row.metric}</span> },
    {
      key: 'amount',
      header: activeReport === 'shipments' ? 'Units' : 'Value',
      align: 'right',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {activeReport === 'shipments' ? row.amount.toLocaleString() : formatCurrency(row.amount, row.currency || 'USD')}
        </span>
      )
    },
    { key: 'date', header: 'Date', accessor: (row) => <span className="whitespace-nowrap text-xs font-semibold text-slate-600">{row.date}</span> },
    { key: 'status', header: 'Status', accessor: (row) => <StatusBadge status={row.status} size="sm" /> }
  ];

  const resetFilters = () => {
    setDateFrom(defaultDateFrom);
    setDateTo(defaultDateTo);
    setBuyerFilter('ALL');
    setBuyerGroupFilter('ALL');
    setProductFilter('ALL');
    setCategoryFilter('ALL');
    setSalesRepFilter('ALL');
    setWarehouseFilter('ALL');
    setStatusFilter('ALL');
    setCurrencyFilter('ALL');
    setSearchTerm('');
    setPreviewGenerated(true);
  };

  const runReportAction = (action: string) => {
    setPreviewGenerated(true);
    showToast(`${action} queued for ${reportTypes.find((report) => report.id === activeReport)?.label}.`, 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="MIS Reports & Analytics"
        subtitle="Dynamic management reporting for sales, buyers, contracts, products, inventory, finance, shipments, and employee performance."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="outline" size="sm" icon={Download} onClick={() => runReportAction('PDF export')}>
              Export PDF
            </Button>
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => runReportAction('Excel export')}>
              Excel
            </Button>
            <Button variant="outline" size="sm" icon={Download} onClick={() => runReportAction('CSV export')}>
              CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} subtext="PO total value" icon={TrendingUp} />
        <KPICard title="Purchase Orders" value={totalPurchaseOrders} subtext="All PO records" icon={FileSpreadsheet} />
        <KPICard title="Total Buyers" value={buyers.length} subtext={`${activeBuyers} active`} icon={Users} />
        <KPICard title="Pending RFQs" value={pendingRfqs} subtext="Needs sales action" icon={SearchCheck} badge={pendingRfqs ? 'Review' : undefined} badgeVariant="amber" />
        <KPICard title="Accepted Quotes" value={acceptedQuotes} subtext="Ready or converted" icon={LineChartIcon} />
        <KPICard title="Active Contracts" value={activeContracts} subtext={`${renewalRate}% renewal rate`} icon={BriefcaseBusiness} />
        <KPICard title="Average Deal Size" value={formatCurrency(averageDealSize)} subtext="Revenue per PO" icon={BarChart3} />
        <KPICard title="Buyer Lifetime Value" value={formatCurrency(buyerLifetimeValue)} subtext="Average buyer spend" icon={Users} />
        <KPICard title="Top Sales Rep" value={topRep?.name || 'N/A'} subtext={topRep ? formatCurrency(topRep.revenue) : 'No revenue'} icon={TrendingUp} />
        <KPICard title="Report Rows" value={filteredRows.length} subtext={`${reportRows.length} available`} icon={FileSpreadsheet} />
      </div>

      <Card title="Report Workspace" subtitle="Select report type, reporting period, and contextual filters.">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 2xl:grid-cols-6">
          <Select
            label="Report Type"
            value={activeReport}
            onChange={(event) => setSearchParams(event.target.value === 'sales' ? {} : { tab: event.target.value })}
            options={reportTypes.map((report) => ({ label: report.label, value: report.id }))}
          />
          <Input label="Date From" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input label="Date To" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <Select label="Buyer" value={buyerFilter} onChange={(event) => setBuyerFilter(event.target.value)} options={[{ label: 'All buyers', value: 'ALL' }, ...buyerOptions]} />
          <Select label="Buyer Group" value={buyerGroupFilter} onChange={(event) => setBuyerGroupFilter(event.target.value)} options={[{ label: 'All groups', value: 'ALL' }, ...buyerGroupOptions]} />
          <Select label="Product" value={productFilter} onChange={(event) => setProductFilter(event.target.value)} options={[{ label: 'All products', value: 'ALL' }, ...productOptions]} />
          <Select label="Category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} options={[{ label: 'All categories', value: 'ALL' }, ...categoryOptions]} />
          <Select label="Sales Rep" value={salesRepFilter} onChange={(event) => setSalesRepFilter(event.target.value)} options={[{ label: 'All reps', value: 'ALL' }, ...repOptions]} />
          <Select label="Warehouse" value={warehouseFilter} onChange={(event) => setWarehouseFilter(event.target.value)} options={[{ label: 'All warehouses', value: 'ALL' }, ...warehouseOptions]} />
          <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[{ label: 'All statuses', value: 'ALL' }, ...reportStatuses]} />
          <Select
            label="Currency"
            value={currencyFilter}
            onChange={(event) => setCurrencyFilter(event.target.value)}
            options={[
              { label: 'All currencies', value: 'ALL' },
              { label: 'USD', value: 'USD' },
              { label: 'KHR', value: 'KHR' }
            ]}
          />
          <div className="flex items-end gap-2">
            <Button type="button" variant="primary" size="sm" icon={RefreshCw} className="h-10 flex-1" onClick={() => runReportAction('Report generation')}>
              Generate
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-10 flex-1" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue vs Target" subtitle="Monthly sales performance trend.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Buyer Group Growth" subtitle="Verified buyer segmentation by month.">
          <div className="h-80">
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
      </div>

      <Card
        title={reportTypes.find((report) => report.id === activeReport)?.label}
        subtitle={`Preview from ${dateFrom} to ${dateTo}. Total report value: ${activeReport === 'shipments' ? reportTotal.toLocaleString() : formatCurrency(reportTotal)}.`}
        action={
          <Button variant="outline" size="sm" icon={SearchCheck} onClick={() => setPreviewGenerated(true)}>
            Preview
          </Button>
        }
      >
        <div className="mb-4 max-w-xl">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search report rows by record, owner, metric, or status..." />
        </div>
        {!previewGenerated ? (
          <EmptyState icon={BarChart3} title="Generate a report preview" description="Choose filters and generate the report to preview rows." />
        ) : filteredRows.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} title="No report rows found" description="Adjust filters or reset the workspace to broaden the report." />
        ) : (
          <DataTable columns={rowColumns} data={filteredRows} keyExtractor={(row) => row.id} enablePagination pageSize={10} className="[&_table]:min-w-[980px]" />
        )}
      </Card>
    </div>
  );
};

