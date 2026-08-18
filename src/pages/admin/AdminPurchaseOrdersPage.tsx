import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  PackageCheck,
  Receipt,
  ShoppingBag,
  Truck
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  FilterBar,
  KPICard,
  PageHeader,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Invoice, PurchaseOrder, Shipment } from '../../types';
import { getInvoiceBalance } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

const getOrderTotal = (po: PurchaseOrder) => po.grandTotal || po.totalAmount || po.subtotal || 0;

const getRelatedInvoice = (po: PurchaseOrder, invoices: Invoice[]) =>
  invoices.find(
    (invoice) =>
      invoice.id === po.invoiceId ||
      invoice.poId === po.id ||
      (po.poNumber && invoice.poNumber === po.poNumber)
  );

const getRelatedShipment = (po: PurchaseOrder, shipments: Shipment[]) =>
  shipments.find(
    (shipment) =>
      shipment.poId === po.id ||
      (po.poNumber && shipment.poNumber === po.poNumber)
  );

const getPaymentStatus = (po: PurchaseOrder, invoices: Invoice[]) => {
  const invoice = getRelatedInvoice(po, invoices);
  if (!invoice) return 'Unpaid';
  if (getInvoiceBalance(invoice) <= 0) return 'Paid';
  return invoice.status;
};

const getFulfillmentStatus = (po: PurchaseOrder, shipments: Shipment[]) => {
  const shipment = getRelatedShipment(po, shipments);
  return shipment?.status || po.shipmentStatus || po.status;
};

export const AdminPurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders, invoices, shipments, updatePOStatus, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');

  const totalOrderValue = purchaseOrders.reduce((sum, po) => sum + getOrderTotal(po), 0);
  const pendingApprovals = purchaseOrders.filter((po) => po.status === 'Pending Approval').length;
  const activeOrders = purchaseOrders.filter((po) =>
    ['Approved', 'Processing', 'Stock Allocated', 'Partially Shipped', 'Fully Shipped'].includes(po.status)
  ).length;
  const outstandingPayments = purchaseOrders.reduce((sum, po) => {
    const invoice = getRelatedInvoice(po, invoices);
    return sum + (invoice ? getInvoiceBalance(invoice) : getOrderTotal(po));
  }, 0);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return purchaseOrders.filter((po) => {
      const orderNumber = po.poNumber || po.id;
      const matchSearch =
        query === '' ||
        orderNumber.toLowerCase().includes(query) ||
        (po.quoteNumber || po.quoteId || '').toLowerCase().includes(query) ||
        (po.companyName || po.buyerName || '').toLowerCase().includes(query) ||
        po.buyerId.toLowerCase().includes(query);
      const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
      const matchPayment = paymentFilter === 'ALL' || getPaymentStatus(po, invoices) === paymentFilter;
      const matchFulfillment =
        fulfillmentFilter === 'ALL' || getFulfillmentStatus(po, shipments) === fulfillmentFilter;

      return matchSearch && matchStatus && matchPayment && matchFulfillment;
    });
  }, [purchaseOrders, invoices, shipments, searchTerm, statusFilter, paymentFilter, fulfillmentFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setFulfillmentFilter('ALL');
  };

  const moveStatus = (po: PurchaseOrder, status: string) => {
    updatePOStatus(po.id, status);
    showToast(`${po.poNumber || po.id} moved to ${status}.`, status === 'Cancelled' ? 'warning' : 'success');
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'order',
      header: 'Order',
      accessor: (po) => (
        <div className="min-w-[190px]">
          <Link to={`/admin/purchase-orders/${po.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
            {po.poNumber || po.id.toUpperCase()}
          </Link>
          <div className="text-[11px] text-slate-500">
            Quote {po.quoteNumber || po.quoteId || 'N/A'}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (po) => (
        <div className="min-w-[220px]">
          <Link to={`/admin/buyers/${po.buyerId}`} className="font-bold text-slate-900 hover:text-blue-700">
            {po.companyName || po.buyerName}
          </Link>
          <div className="text-[11px] text-slate-500">{po.contactPerson || po.buyerId}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      accessor: (po) => (
        <div className="min-w-[130px]">
          <div className="font-mono font-bold text-slate-900">
            {formatCurrency(getOrderTotal(po), po.currency || 'USD')}
          </div>
          <div className="text-[11px] text-slate-500">{po.paymentTerms}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'dates',
      header: 'Dates',
      accessor: (po) => (
        <div className="min-w-[150px] text-xs">
          <div className="font-semibold text-slate-800">Ordered {po.orderDate}</div>
          <div className="text-slate-500">ETA {po.expectedDeliveryDate}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'payment',
      header: 'Payment',
      accessor: (po) => <StatusBadge status={getPaymentStatus(po, invoices)} size="sm" />
    },
    {
      key: 'fulfillment',
      header: 'Fulfillment',
      accessor: (po) => <StatusBadge status={getFulfillmentStatus(po, shipments)} size="sm" />
    },
    {
      key: 'status',
      header: 'Order Status',
      accessor: (po) => <StatusBadge status={po.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (po) => (
        <div className="flex min-w-[230px] flex-wrap items-center gap-1.5">
          <Link to={`/admin/purchase-orders/${po.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>
          {po.status === 'Pending Approval' && (
            <Button variant="success" size="xs" icon={CheckCircle2} onClick={() => moveStatus(po, 'Approved')}>
              Approve
            </Button>
          )}
          {['Approved', 'Processing'].includes(po.status) && (
            <Button variant="primary" size="xs" icon={PackageCheck} onClick={() => moveStatus(po, 'Stock Allocated')}>
              Allocate
            </Button>
          )}
          {po.status === 'Stock Allocated' && (
            <Button variant="primary" size="xs" icon={Truck} onClick={() => moveStatus(po, 'Fully Shipped')}>
              Ship
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Management"
        subtitle="Review buyer purchase orders, payment exposure, warehouse allocation, and fulfillment status."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Orders' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Orders" value={purchaseOrders.length} subtext={`${activeOrders} active fulfillment records`} icon={ShoppingBag} />
        <KPICard title="Total Order Value" value={formatCurrency(totalOrderValue)} subtext="All purchase orders" icon={Receipt} />
        <KPICard title="Pending Approvals" value={pendingApprovals} subtext="Credit or manager review" icon={AlertTriangle} badge={pendingApprovals ? 'Review' : undefined} badgeVariant="amber" />
        <KPICard title="Payment Exposure" value={formatCurrency(outstandingPayments)} subtext="Open or unissued order balance" icon={CreditCard} badge="Finance" badgeVariant="danger" />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by PO, quote, buyer, or buyer ID..."
              />
            </div>
            <FilterBar
              filters={[
                {
                  id: 'status',
                  label: 'Order Status',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { label: 'Pending Approval', value: 'Pending Approval' },
                    { label: 'Approved', value: 'Approved' },
                    { label: 'Processing', value: 'Processing' },
                    { label: 'Stock Allocated', value: 'Stock Allocated' },
                    { label: 'Partially Shipped', value: 'Partially Shipped' },
                    { label: 'Fully Shipped', value: 'Fully Shipped' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Cancelled', value: 'Cancelled' },
                    { label: 'Fulfilled', value: 'Fulfilled' }
                  ]
                },
                {
                  id: 'payment',
                  label: 'Payment',
                  value: paymentFilter,
                  onChange: setPaymentFilter,
                  options: [
                    { label: 'Issued', value: 'Issued' },
                    { label: 'Paid', value: 'Paid' },
                    { label: 'Partially Paid', value: 'Partially Paid' },
                    { label: 'Overdue', value: 'Overdue' },
                    { label: 'Unpaid', value: 'Unpaid' }
                  ]
                },
                {
                  id: 'fulfillment',
                  label: 'Fulfillment',
                  value: fulfillmentFilter,
                  onChange: setFulfillmentFilter,
                  options: [
                    { label: 'Preparing', value: 'Preparing' },
                    { label: 'Ready', value: 'Ready' },
                    { label: 'In Transit', value: 'In Transit' },
                    { label: 'Delivered', value: 'Delivered' },
                    { label: 'Pending', value: 'Pending' }
                  ]
                }
              ]}
              hasActiveFilters={statusFilter !== 'ALL' || paymentFilter !== 'ALL' || fulfillmentFilter !== 'ALL' || searchTerm !== ''}
              onReset={resetFilters}
            />
          </div>

          <DataTable columns={columns} data={filteredOrders} emptyMessage="No orders match the selected filters." />
        </div>
      </Card>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p>
            Admin order actions update local frontend state only. In a later backend stage these same workflows can map to approval, allocation, shipment, and finance services.
          </p>
        </div>
      </div>
    </div>
  );
};
