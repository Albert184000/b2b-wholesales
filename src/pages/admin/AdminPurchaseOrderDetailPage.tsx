import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  CreditCard,
  FileText,
  PackageCheck,
  Receipt,
  ShoppingBag,
  Truck,
  UserRound
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  KPICard,
  PageHeader,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Invoice, PurchaseOrderItem, Shipment } from '../../types';
import { getInvoiceBalance, getShipmentProgress } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

const getOrderTotal = (po: { grandTotal?: number; totalAmount?: number; subtotal?: number }) =>
  po.grandTotal || po.totalAmount || po.subtotal || 0;

const getRelatedInvoice = (poId: string, poNumber: string | undefined, invoiceId: string | undefined, invoices: Invoice[]) =>
  invoices.find(
    (invoice) =>
      invoice.id === invoiceId ||
      invoice.poId === poId ||
      (poNumber && invoice.poNumber === poNumber)
  );

const getRelatedShipment = (poId: string, poNumber: string | undefined, shipments: Shipment[]) =>
  shipments.find(
    (shipment) =>
      shipment.poId === poId ||
      (poNumber && shipment.poNumber === poNumber)
  );

export const AdminPurchaseOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    buyers,
    purchaseOrders,
    invoices,
    shipments,
    contracts,
    updatePOStatus,
    showToast
  } = useApp();

  const po = purchaseOrders.find((item) => item.id === id);

  if (!po) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Order Not Found"
          subtitle="The requested purchase order is not available in the current order workspace."
          breadcrumbs={[
            { label: 'Orders', href: '/admin/purchase-orders' },
            { label: 'Not Found' }
          ]}
          actions={
            <Link to="/admin/purchase-orders">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Orders
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const buyer = buyers.find((item) => item.id === po.buyerId);
  const invoice = getRelatedInvoice(po.id, po.poNumber, po.invoiceId, invoices);
  const shipment = getRelatedShipment(po.id, po.poNumber, shipments);
  const contract = contracts.find((item) => item.id === po.contractId || item.poId === po.id || item.poNumber === po.poNumber);
  const orderTotal = getOrderTotal(po);
  const paymentStatus = invoice ? (getInvoiceBalance(invoice) <= 0 ? 'Paid' : invoice.status) : 'Unpaid';
  const balanceDue = invoice ? getInvoiceBalance(invoice) : orderTotal;
  const shipmentStatus = shipment?.status || po.shipmentStatus || po.status;
  const shipmentProgress = shipment ? getShipmentProgress(shipment) : 0;

  const moveStatus = (status: string) => {
    updatePOStatus(po.id, status);
    showToast(`${po.poNumber || po.id} moved to ${status}.`, status === 'Cancelled' ? 'warning' : 'success');
  };

  const itemColumns: Column<PurchaseOrderItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs font-semibold text-blue-700">{item.sku}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      accessor: (item) => (
        <div className="font-mono font-bold text-slate-900">{item.quantity.toLocaleString()}</div>
      )
    },
    {
      key: 'unit',
      header: 'Unit Price',
      align: 'right',
      accessor: (item) => <span className="font-mono text-slate-900">{formatCurrency(item.unitPrice, po.currency || 'USD')}</span>
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(item.subtotal || item.quantity * item.unitPrice, po.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'allocation',
      header: 'Allocation',
      accessor: (item) => <StatusBadge status={item.allocationStatus || po.stockStatus || 'Pending'} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.poNumber || po.id.toUpperCase()}
        subtitle={`${po.companyName || po.buyerName} - ${po.paymentTerms}`}
        breadcrumbs={[
          { label: 'Orders', href: '/admin/purchase-orders' },
          { label: po.poNumber || po.id }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/purchase-orders">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            {po.status === 'Pending Approval' && (
              <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => moveStatus('Approved')}>
                Approve
              </Button>
            )}
            {['Approved', 'Processing'].includes(po.status) && (
              <Button variant="primary" size="sm" icon={PackageCheck} onClick={() => moveStatus('Stock Allocated')}>
                Allocate Stock
              </Button>
            )}
            {po.status === 'Stock Allocated' && (
              <Button variant="primary" size="sm" icon={Truck} onClick={() => moveStatus('Fully Shipped')}>
                Mark Shipped
              </Button>
            )}
            {['Fully Shipped', 'Fulfilled'].includes(po.status) && (
              <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => moveStatus('Completed')}>
                Complete
              </Button>
            )}
            {!['Cancelled', 'Completed'].includes(po.status) && (
              <Button variant="outline" size="sm" icon={Ban} onClick={() => moveStatus('Cancelled')}>
                Cancel
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Order Total" value={formatCurrency(orderTotal, po.currency || 'USD')} subtext={`${po.items.length} line item${po.items.length === 1 ? '' : 's'}`} icon={ShoppingBag} />
        <KPICard title="Payment Status" value={paymentStatus} subtext={formatCurrency(balanceDue, po.currency || 'USD') + ' open'} icon={CreditCard} />
        <KPICard title="Fulfillment" value={shipmentStatus} subtext={shipment ? `${shipmentProgress}% delivered` : 'No shipment record'} icon={Truck} />
        <KPICard title="Order Status" value={po.status} subtext={po.expectedDeliveryDate} icon={Receipt} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Buyer Information">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <Link to={`/admin/buyers/${po.buyerId}`} className="font-bold text-slate-900 hover:text-blue-700">
                  {po.companyName || buyer?.companyName || po.buyerName}
                </Link>
                <div className="mt-0.5 text-xs text-slate-500">{po.contactPerson || buyer?.contactPerson}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <div className="font-bold uppercase tracking-wide text-slate-500">Buyer Group</div>
                <div className="mt-1 font-semibold text-slate-900">{buyer?.buyerGroup || 'Unassigned'}</div>
              </div>
              <div>
                <div className="font-bold uppercase tracking-wide text-slate-500">Credit Standing</div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={po.creditCheck?.status || buyer?.accountStanding || 'Good Standing'} size="sm" />
                </div>
              </div>
              <div>
                <div className="font-bold uppercase tracking-wide text-slate-500">Shipping Address</div>
                <div className="mt-1 leading-5 text-slate-700">{po.shippingAddress}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Payment and Documents">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="font-bold text-slate-900">{invoice?.invoiceNumber || 'No invoice issued'}</div>
                <div className="text-xs text-slate-500">{invoice ? `Due ${invoice.dueDate}` : 'Pending finance issue'}</div>
              </div>
              <StatusBadge status={paymentStatus} size="sm" />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="font-bold text-slate-900">{contract?.contractNumber || contract?.id || 'No contract linked'}</div>
                <div className="text-xs text-slate-500">{contract ? contract.title : 'Available after approval if required'}</div>
              </div>
              <StatusBadge status={contract?.status || 'Pending'} size="sm" />
            </div>
            {(po.documents || []).map((document) => (
              <div key={document.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <FileText className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-900">{document.name}</div>
                  <div className="text-xs text-slate-500">{document.type} - {document.uploadedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Fulfillment Snapshot">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={shipmentStatus} />
              {shipment && <span className="font-mono text-xs font-bold text-slate-600">{shipment.shipmentNumber || shipment.id}</span>}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${shipmentProgress}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <div className="font-bold uppercase tracking-wide text-slate-500">Carrier</div>
                <div className="mt-1 font-semibold text-slate-900">{shipment?.carrier || 'Not assigned'}</div>
              </div>
              <div>
                <div className="font-bold uppercase tracking-wide text-slate-500">ETA</div>
                <div className="mt-1 font-semibold text-slate-900">{shipment?.estimatedDelivery || po.expectedDeliveryDate}</div>
              </div>
              <div className="col-span-2">
                <div className="font-bold uppercase tracking-wide text-slate-500">Destination</div>
                <div className="mt-1 leading-5 text-slate-700">{shipment?.destinationAddress || po.shippingAddress}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Order Items">
        <DataTable columns={itemColumns} data={po.items} />
      </Card>

      {po.inventoryAllocations && po.inventoryAllocations.length > 0 && (
        <Card title="Inventory Allocation">
          <div className="space-y-4">
            {po.inventoryAllocations.map((allocation) => (
              <div key={`${allocation.sku}-${allocation.requestedQty}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{allocation.productName}</div>
                    <div className="font-mono text-xs font-semibold text-blue-700">{allocation.sku}</div>
                  </div>
                  <StatusBadge status={allocation.result} size="sm" />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <div className="font-bold uppercase tracking-wide text-slate-500">Requested</div>
                    <div className="mt-1 font-mono text-lg font-bold text-slate-900">{allocation.requestedQty.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <div className="font-bold uppercase tracking-wide text-slate-500">Allocated</div>
                    <div className="mt-1 font-mono text-lg font-bold text-slate-900">{allocation.allocatedQty.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <div className="font-bold uppercase tracking-wide text-slate-500">Backorder</div>
                    <div className="mt-1 font-mono text-lg font-bold text-slate-900">{allocation.backorderQty.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  {allocation.warehouses.map((warehouse) => (
                    <div key={warehouse.warehouseId} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                      <div className="font-bold text-slate-900">{warehouse.warehouseName}</div>
                      <div className="mt-1 text-slate-500">{warehouse.city}</div>
                      <div className="mt-2 font-mono font-bold text-slate-900">
                        {warehouse.allocated.toLocaleString()} allocated / {warehouse.available.toLocaleString()} available
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Order Totals">
          <div className="space-y-3 text-sm">
            {[
              ['Subtotal', po.subtotal || 0],
              ['Tax', po.tax || 0],
              ['Discount', -(po.discount || 0)],
              ['Shipping', po.shippingFee || 0],
              ['Grand Total', orderTotal]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <span className={label === 'Grand Total' ? 'font-bold text-slate-900' : 'text-slate-600'}>{label}</span>
                <span className={label === 'Grand Total' ? 'font-mono text-lg font-extrabold text-slate-900' : 'font-mono font-semibold text-slate-800'}>
                  {formatCurrency(Number(value), po.currency || 'USD')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Timeline">
          <div className="space-y-3">
            {(po.timeline || []).map((event) => (
              <div key={`${event.stage}-${event.date}`} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${event.completed ? 'bg-emerald-500' : event.active ? 'bg-blue-500' : 'bg-slate-300'}`} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-bold text-slate-900">{event.stage}</div>
                    {event.active && <StatusBadge status="In Progress" size="sm" />}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-500">{event.date}</div>
                  <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                </div>
              </div>
            ))}
            {(!po.timeline || po.timeline.length === 0) && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No order timeline is attached to this purchase order.
              </div>
            )}
          </div>
        </Card>
      </div>

      {po.creditCheck && (
        <Card title="Credit Review">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                Credit Status
              </div>
              <div className="mt-2">
                <StatusBadge status={po.creditCheck.status} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Available Credit</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">{formatCurrency(po.creditCheck.availableCredit)}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">PO Amount</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">{formatCurrency(po.creditCheck.poAmount)}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Shortfall</div>
              <div className="mt-1 font-mono text-lg font-bold text-rose-700">{formatCurrency(po.creditCheck.shortfall)}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">{po.creditCheck.message}</p>
        </Card>
      )}
    </div>
  );
};
