import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  FileSpreadsheet,
  Printer,
  Receipt,
  ShoppingBag,
  Truck
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
  Tabs,
  Timeline
} from '../../components/ui';
import { CreditValidationCard, InventoryAllocationSummary } from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { PODocument, PurchaseOrderItem, StockAllocation } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { getPONumber, getPOItemSubtotal, getPOSubtotal, getPOTotal } from '../../utils/poContract';

const buildAllocationsFromItems = (items: PurchaseOrderItem[]): StockAllocation[] =>
  items.map((item) => {
    const warehouses = item.warehouseAllocation || [];
    const allocatedQty = warehouses.reduce((sum, warehouse) => sum + warehouse.allocated, 0);
    const totalAvailable = warehouses.reduce((sum, warehouse) => sum + warehouse.available, 0);
    const backorderQty = Math.max(0, item.quantity - allocatedQty);

    return {
      productId: item.productId,
      sku: item.sku,
      productName: item.productName,
      requestedQty: item.quantity,
      totalAvailable,
      allocatedQty,
      backorderQty,
      result: item.allocationStatus || (backorderQty === 0 ? 'Fully Available' : 'Partial Availability'),
      warehouses
    };
  });

export const BuyerPODetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseOrders, quotes, contracts, shipments, invoices, currentBuyer, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const po = purchaseOrders.find((record) => record.id === id || record.poNumber === id);

  if (!po) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Purchase order not found"
        description="The requested PO is not available in the current workspace."
        actionText="Back to Purchase Orders"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/buyer/purchase-orders')}
      />
    );
  }

  const associatedQuote = quotes.find((quote) => quote.id === po.quoteId || quote.quoteNumber === po.quoteNumber);
  const associatedContract = contracts.find(
    (contract) => contract.id === po.contractId || contract.poId === po.id || contract.poNumber === po.poNumber
  );
  const associatedShipment = shipments.find((shipment) => shipment.poId === po.id || shipment.poNumber === po.poNumber);
  const associatedInvoice = invoices.find((invoice) => invoice.poId === po.id || invoice.poNumber === po.poNumber || invoice.id === po.invoiceId);
  const allocations = po.inventoryAllocations?.length ? po.inventoryAllocations : buildAllocationsFromItems(po.items);
  const poTotal = getPOTotal(po);

  const itemColumns: Column<PurchaseOrderItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[240px]">
          <div className="font-semibold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs font-bold text-blue-600">{item.sku}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      accessor: (item) => <span className="font-bold text-slate-900">{item.quantity.toLocaleString()}</span>
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{formatCurrency(item.unitPrice)}</span>
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-extrabold text-blue-700">{formatCurrency(getPOItemSubtotal(item))}</span>
      )
    },
    {
      key: 'allocation',
      header: 'Warehouse Allocation',
      accessor: (item) => (
        <div className="min-w-[180px] space-y-1 text-xs">
          {(item.warehouseAllocation || []).slice(0, 2).map((warehouse) => (
            <div key={warehouse.warehouseId} className="flex justify-between gap-2 rounded-md bg-slate-50 px-2 py-1">
              <span className="truncate text-slate-600">{warehouse.warehouseName}</span>
              <span className="font-bold text-slate-900">{warehouse.allocated}</span>
            </div>
          ))}
          {!item.warehouseAllocation?.length && <span className="text-slate-500">Allocation pending</span>}
        </div>
      )
    },
    {
      key: 'fulfilled',
      header: 'Fulfilled / Remaining',
      align: 'right',
      accessor: (item) => (
        <div className="text-xs">
          <div className="font-bold text-emerald-700">{(item.fulfilledQuantity || 0).toLocaleString()} fulfilled</div>
          <div className="text-slate-500">{(item.remainingQuantity ?? item.quantity).toLocaleString()} remaining</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => <StatusBadge status={item.allocationStatus || 'Pending'} size="sm" />
    }
  ];

  const documentColumns: Column<PODocument>[] = [
    {
      key: 'name',
      header: 'Document',
      accessor: (document) => (
        <div>
          <div className="font-semibold text-slate-900">{document.name}</div>
          <div className="text-xs text-slate-500">{document.type} / {document.version || 'v1'}</div>
        </div>
      )
    },
    {
      key: 'uploaded',
      header: 'Uploaded',
      accessor: (document) => <span className="text-sm text-slate-600">{document.uploadedDate}</span>
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (document) => (
        <Button variant="outline" size="xs" onClick={() => showToast(`${document.name} download queued.`, 'info')}>
          Download
        </Button>
      )
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShoppingBag },
    { id: 'items', label: 'Items', icon: ClipboardCheck, count: po.items.length },
    { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
    { id: 'documents', label: 'Documents', icon: FileText, count: po.documents?.length || 0 },
    { id: 'activity', label: 'Activity', icon: FileSpreadsheet },
    { id: 'related', label: 'Related Records', icon: FileSpreadsheet }
  ];

  const timelineItems = (po.timeline || []).map((item) => ({
    title: item.stage,
    date: item.date,
    description: item.description,
    completed: item.completed,
    active: item.active
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={getPONumber(po)}
        subtitle={`${po.companyName || currentBuyer.companyName} / Quote ${po.quoteNumber || po.quoteId || 'N/A'}`}
        badge={<StatusBadge status={po.status} />}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Purchase Orders', href: '/buyer/purchase-orders' },
          { label: getPONumber(po) }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/buyer/purchase-orders">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={FileText} onClick={() => showToast('PO download queued.', 'info')}>
              Download PO
            </Button>
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        }
      />

      {po.approval?.required && po.approval.status === 'Under Review' && (
        <Alert type="warning" title="Approval required">
          {po.approval.reason || 'Order exceeds the standard account approval threshold.'}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card noPadding>
            <div className="px-5 pt-4">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Created</div>
                      <div className="mt-2 font-semibold text-slate-900">{po.orderDate}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Expected Delivery</div>
                      <div className="mt-2 font-semibold text-slate-900">{po.expectedDeliveryDate}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Terms</div>
                      <div className="mt-2 font-semibold text-slate-900">{po.paymentTerms}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-blue-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Grand Total</div>
                      <div className="mt-2 font-mono text-xl font-extrabold text-blue-700">{formatCurrency(poTotal, po.currency || 'USD')}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card title="Buyer & Delivery">
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Buyer Company</div>
                          <div className="mt-1 font-semibold text-slate-900">{po.companyName || currentBuyer.companyName}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipping Address</div>
                          <div className="mt-1 text-slate-700">{po.shippingAddress}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Buyer Reference</div>
                          <div className="mt-1 font-mono text-slate-900">{po.buyerPoReference || 'Not provided'}</div>
                        </div>
                      </div>
                    </Card>

                    <Card title="Assigned Account Executive">
                      <div className="space-y-2 text-sm">
                        <div className="font-bold text-slate-900">{po.assignedRep?.name || currentBuyer.assignedRep.name}</div>
                        <div className="text-slate-600">{po.assignedRep?.title || currentBuyer.assignedRep.title}</div>
                        <div className="text-slate-600">{po.assignedRep?.email || currentBuyer.assignedRep.email}</div>
                        <Button variant="outline" size="xs" onClick={() => showToast('Account executive notified.', 'success')}>
                          Message Rep
                        </Button>
                      </div>
                    </Card>
                  </div>

                  {timelineItems.length > 0 && (
                    <Card title="PO Status Timeline">
                      <Timeline items={timelineItems} />
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'items' && (
                <div className="space-y-6">
                  <DataTable columns={itemColumns} data={po.items} compact />
                  <InventoryAllocationSummary allocations={allocations} />
                </div>
              )}

              {activeTab === 'approvals' && (
                <div className="space-y-6">
                  {po.creditCheck && <CreditValidationCard creditCheck={po.creditCheck} />}
                  <Card title="Approval Status">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</div>
                        <div className="mt-2"><StatusBadge status={po.approval?.status || 'Not Required'} /></div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted</div>
                        <div className="mt-2 font-semibold text-slate-900">{po.approval?.submittedAt || 'Not submitted'}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason</div>
                        <div className="mt-2 text-slate-700">
                          {po.approval?.reason || 'No buyer-visible approval exception.'}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'documents' && (
                <DataTable columns={documentColumns} data={po.documents || []} compact emptyMessage="No PO documents attached yet." />
              )}

              {activeTab === 'activity' && (
                <div className="space-y-3">
                  {(po.activity || []).map((activity) => (
                    <div key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="font-bold text-slate-900">{activity.title}</div>
                        <div className="text-xs text-slate-500">{activity.timestamp}</div>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-blue-700">{activity.actor}</div>
                      <p className="mt-2 text-sm text-slate-600">{activity.description}</p>
                    </div>
                  ))}
                  {!po.activity?.length && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      No activity recorded yet.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'related' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card title="Accepted Quote">
                    {associatedQuote ? (
                      <Link to={`/buyer/quotes/${associatedQuote.id}`}>
                        <Button variant="outline" size="sm" icon={FileSpreadsheet}>
                          View Quote
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-500">No quote linked.</span>
                    )}
                  </Card>
                  <Card title="Contract">
                    {associatedContract ? (
                      <Link to={`/buyer/contracts/${associatedContract.id}`}>
                        <Button variant="outline" size="sm" icon={FileText}>
                          View Contract
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-500">Available after PO approval.</span>
                    )}
                  </Card>
                  <Card title="Invoice">
                    {associatedInvoice ? (
                      <Link to={`/buyer/invoices/${associatedInvoice.id}`}>
                        <Button variant="outline" size="sm" icon={Receipt}>
                          View Invoice
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="secondary" size="sm" icon={Receipt} disabled>
                        Invoice Pending
                      </Button>
                    )}
                  </Card>
                  <Card title="Shipment">
                    {associatedShipment ? (
                      <Link to={`/buyer/shipments/${associatedShipment.id}`}>
                        <Button variant="outline" size="sm" icon={Truck}>
                          Track Shipment
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="secondary" size="sm" icon={Truck} disabled>
                        Shipment Pending
                      </Button>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Financial Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold">{formatCurrency(getPOSubtotal(po))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span className="font-mono font-semibold">{formatCurrency(po.tax || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span className="font-mono font-semibold">-{formatCurrency(po.discount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-mono font-semibold">{formatCurrency(po.shippingFee || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono text-blue-700">{formatCurrency(poTotal)}</span>
              </div>
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="flex flex-col gap-2">
              {associatedQuote ? (
                <Link to={`/buyer/quotes/${associatedQuote.id}`}>
                  <Button variant="outline" size="sm" icon={FileSpreadsheet} className="w-full">
                    View Quote
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={FileSpreadsheet} disabled>
                  View Quote
                </Button>
              )}
              {associatedContract ? (
                <Link to={`/buyer/contracts/${associatedContract.id}`}>
                  <Button variant="outline" size="sm" icon={FileText} className="w-full">
                    View Contract
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={FileText} disabled>
                  Contract Pending
                </Button>
              )}
              {associatedInvoice ? (
                <Link to={`/buyer/invoices/${associatedInvoice.id}`}>
                  <Button variant="outline" size="sm" icon={Receipt} className="w-full">
                    View Invoice
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={Receipt} disabled>
                  View Invoice
                </Button>
              )}
              {associatedShipment ? (
                <Link to={`/buyer/shipments/${associatedShipment.id}`}>
                  <Button variant="outline" size="sm" icon={Truck} className="w-full">
                    Track Shipment
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={Truck} disabled>
                  Track Shipment
                </Button>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};
