import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  FileQuestion,
  FileSpreadsheet,
  ShoppingBag,
  Receipt,
  Truck,
  Package,
  ArrowRight,
  Clock,
  ClipboardList
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { BuyerCreditSummary, BuyerProductCard, BuyerProfileSummary } from '../../components/buyer';
import { Button, Card, ChartCard, KPICard, PageHeader, StatusBadge } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import {
  mockBuyerDashboardStats,
  mockBuyerMonthlySpendData,
  mockBuyerRecommendedProductIds,
  mockBuyerWarehouseAvailability
} from '../../data/mockData';
import { formatCurrency } from '../../utils/pricing';

export const BuyerDashboardPage: React.FC = () => {
  const { currentBuyer, products, quotes, purchaseOrders, invoices, shipments } = useApp();

  const recommendedProducts = mockBuyerRecommendedProductIds
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .slice(0, 4);

  const recentQuotes = quotes.slice(0, 3);
  const recentPurchaseOrders = purchaseOrders.slice(0, 3);
  const recentShipments = shipments.slice(0, 3);
  const recentInvoices = invoices.slice(0, 3);

  const invoiceSummary = [
    { label: 'Paid', value: invoices.filter((invoice) => invoice.status === 'Paid').length, tone: 'text-emerald-700' },
    { label: 'Due Soon', value: invoices.filter((invoice) => invoice.status === 'Due Soon').length, tone: 'text-blue-700' },
    { label: 'Open', value: invoices.filter((invoice) => invoice.status !== 'Paid').length, tone: 'text-amber-700' }
  ];

  const quickActions = [
    { label: 'Browse Products', href: '/buyer/products', icon: Package, variant: 'primary' as const },
    { label: 'Request Quote', href: '/buyer/rfqs', icon: FileQuestion, variant: 'outline' as const },
    { label: 'View Purchase Orders', href: '/buyer/purchase-orders', icon: ShoppingBag, variant: 'outline' as const },
    { label: 'View Invoices', href: '/buyer/invoices', icon: Receipt, variant: 'outline' as const }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${currentBuyer.companyName}`}
        subtitle={`Verified ${currentBuyer.buyerGroup} buyer account with ${currentBuyer.paymentTerms} purchasing terms.`}
        badge={<StatusBadge status={currentBuyer.status} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/buyer/products">
              <Button variant="primary" size="sm" icon={Package}>
                Browse Products
              </Button>
            </Link>
            <Link to="/buyer/rfqs">
              <Button variant="outline" size="sm" icon={FileQuestion}>
                Request Quote
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <KPICard title="Open RFQs" value={mockBuyerDashboardStats.openRFQs} subtext="Awaiting review" icon={FileQuestion} />
        <KPICard title="Active Quotes" value={mockBuyerDashboardStats.activeQuotes} subtext="Buyer action needed" icon={FileSpreadsheet} />
        <KPICard title="Active POs" value={mockBuyerDashboardStats.activePurchaseOrders} subtext="In fulfillment" icon={ShoppingBag} />
        <KPICard title="Outstanding Invoice" value={formatCurrency(mockBuyerDashboardStats.outstandingInvoice)} subtext="Due this cycle" icon={Receipt} />
        <KPICard title="Available Credit" value={formatCurrency(mockBuyerDashboardStats.availableCredit)} subtext="Ready to allocate" icon={CreditCard} />
        <KPICard title="In Transit" value={mockBuyerDashboardStats.shipmentsInTransit} subtext="Shipments moving" icon={Truck} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <BuyerCreditSummary buyer={currentBuyer} className="xl:col-span-2" />
        <BuyerProfileSummary buyer={currentBuyer} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard
          title="Monthly Spend"
          subtitle="Buyer spend trend across issued purchase orders"
          className="xl:col-span-2 border-slate-200"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockBuyerMonthlySpendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="buyerSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Spend']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#buyerSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Purchase Order Activity" subtitle="Monthly PO count" className="border-slate-200">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockBuyerMonthlySpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [Number(value), 'POs']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="purchaseOrders" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card
          title="Recent Purchase Orders"
          action={
            <Link to="/buyer/purchase-orders" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          }
          className="border-slate-200"
        >
          <div className="divide-y divide-slate-100">
            {recentPurchaseOrders.map((po) => {
              const total = po.totalAmount || po.grandTotal || po.subtotal || 0;

              return (
                <div key={po.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{po.poNumber || po.id}</span>
                      <StatusBadge status={po.status} size="sm" />
                    </div>
                    <p className="mt-1 text-slate-500 truncate">
                      {po.items.length} SKUs / Expected {po.expectedDeliveryDate}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900">{formatCurrency(total)}</div>
                    <Link to="/buyer/purchase-orders" className="text-[11px] font-semibold text-blue-600">
                      Track
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card
          title="Recent Quotes"
          action={
            <Link to="/buyer/quotes" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          }
          className="border-slate-200"
        >
          <div className="divide-y divide-slate-100">
            {recentQuotes.map((quote) => {
              const total = quote.totalAmount || quote.total || quote.subtotal || 0;

              return (
                <div key={quote.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{quote.quoteNumber || quote.id}</span>
                      <StatusBadge status={quote.status} size="sm" />
                    </div>
                    <p className="mt-1 text-slate-500 truncate">
                      {quote.items.length} SKUs / {quote.paymentTerms}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900">{formatCurrency(total)}</div>
                    <Link to="/buyer/quotes" className="text-[11px] font-semibold text-blue-600">
                      Review
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Invoice Summary" className="border-slate-200">
          <div className="grid grid-cols-3 gap-3">
            {invoiceSummary.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className={`text-xl font-extrabold ${item.tone}`}>{item.value}</div>
                <div className="mt-1 text-[11px] font-semibold text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 divide-y divide-slate-100 text-xs">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono font-bold text-blue-600">{invoice.invoiceNumber || invoice.id}</div>
                  <div className="text-slate-500">Due {invoice.dueDate}</div>
                </div>
                <StatusBadge status={invoice.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Shipment Tracking" className="border-slate-200">
          <div className="space-y-3">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono font-bold text-blue-600">{shipment.shipmentNumber || shipment.id}</div>
                  <StatusBadge status={shipment.status} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    {shipment.carrier}
                  </span>
                  <span>{shipment.estimatedDelivery}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Actions" className="border-slate-200">
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.label} to={action.href} className="block">
                  <Button variant={action.variant} size="sm" className="w-full justify-between" icon={Icon} iconPosition="left">
                    <span className="flex-1 text-left">{action.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4" />
              Quote requests
            </div>
            <p className="mt-1 leading-relaxed">
              Use RFQs to organize product requests and keep buyer pricing discussions with your assigned account executive.
            </p>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Recommended Products</h2>
            <p className="text-xs text-slate-500">Buyer-priced SKUs based on recent quote and purchase activity.</p>
          </div>
          <Link to="/buyer/products">
            <Button variant="outline" size="sm" icon={ClipboardList}>
              View Full Catalog
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <BuyerProductCard
              key={product.id}
              product={product}
              buyerGroup={currentBuyer.buyerGroup}
              availability={mockBuyerWarehouseAvailability[product.id] || []}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
