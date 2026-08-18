import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  FileText,
  MapPin,
  PackageCheck,
  Paperclip,
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
  FileUpload,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { ShipmentItem, TrackingEvent } from '../../types';
import { getShipmentProgress, getShipmentTotals } from '../../utils/financeLogistics';

const issueTypeOptions = [
  { label: 'Missing quantity', value: 'Missing quantity' },
  { label: 'Damaged items', value: 'Damaged items' },
  { label: 'Wrong product', value: 'Wrong product' },
  { label: 'Late delivery', value: 'Late delivery' },
  { label: 'Other', value: 'Other' }
];

const TrackingTimeline: React.FC<{ events: TrackingEvent[] }> = ({ events }) => (
  <div className="space-y-0">
    {events.map((event, index) => {
      const isLast = index === events.length - 1;
      const iconClasses = event.completed
        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
        : event.active
        ? 'border-blue-200 bg-blue-50 text-blue-600'
        : 'border-slate-200 bg-white text-slate-400';

      return (
        <div key={event.id || `${event.status}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
          {!isLast && <div className="absolute left-4 top-9 h-[calc(100%-1.75rem)] w-px bg-slate-200" />}
          <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${iconClasses}`}>
            {event.completed ? <CheckCircle2 className="h-4 w-4" /> : event.active ? <Truck className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-bold text-slate-900">{event.status}</div>
                <div className="mt-1 text-xs font-semibold text-blue-700">{event.location || 'Location pending'}</div>
              </div>
              <div className="text-xs font-semibold text-slate-500">{event.timestamp || 'Pending'}</div>
            </div>
            {event.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{event.description}</p>}
          </div>
        </div>
      );
    })}
  </div>
);

export const BuyerShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shipments, purchaseOrders, invoices, contracts, showToast } = useApp();
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueType, setIssueType] = useState(issueTypeOptions[0].value);
  const [issueDescription, setIssueDescription] = useState('');
  const [affectedQuantity, setAffectedQuantity] = useState('1');
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const shipment = shipments.find((record) => record.id === id || record.shipmentNumber === id);

  if (!shipment) {
    return (
      <EmptyState
        icon={Truck}
        title="Shipment not found"
        description="The requested shipment is not available in the current workspace."
        actionText="Back to Shipments"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/buyer/shipments')}
      />
    );
  }

  const relatedPO = purchaseOrders.find((po) => po.id === shipment.poId || po.poNumber === shipment.poNumber);
  const relatedInvoice = invoices.find(
    (invoice) => invoice.id === shipment.invoiceId || invoice.poNumber === shipment.poNumber || invoice.poId === shipment.poId
  );
  const relatedContract = contracts.find(
    (contract) => contract.id === shipment.contractId || contract.poId === relatedPO?.id || contract.poNumber === shipment.poNumber
  );
  const relatedShipments = shipments.filter(
    (record) =>
      record.id !== shipment.id &&
      (record.poId === shipment.poId ||
        record.poNumber === shipment.poNumber ||
        shipment.relatedShipmentIds?.includes(record.id))
  );

  const shipmentTotals = getShipmentTotals(shipment);
  const poShipmentRollup = useMemo(() => {
    const samePO = shipments.filter(
      (record) => record.poId === shipment.poId || record.poNumber === shipment.poNumber
    );
    const ordered =
      relatedPO?.items.reduce((sum, item) => sum + item.quantity, 0) ||
      shipment.totalOrdered ||
      shipmentTotals.ordered;
    const shipped = samePO.reduce((sum, record) => sum + getShipmentTotals(record).shipped, 0);
    const delivered = samePO.reduce((sum, record) => sum + getShipmentTotals(record).delivered, 0);

    return {
      ordered,
      shipped,
      delivered,
      remaining: Math.max(0, ordered - delivered),
      progress: ordered > 0 ? Math.round((delivered / ordered) * 100) : 0
    };
  }, [relatedPO?.items, shipment.poId, shipment.poNumber, shipment.totalOrdered, shipmentTotals.ordered, shipments]);

  const itemColumns: Column<ShipmentItem>[] = [
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
      key: 'ordered',
      header: 'Ordered',
      align: 'right',
      accessor: (item) => <span className="font-bold text-slate-900">{item.orderedQty.toLocaleString()}</span>
    },
    {
      key: 'shipped',
      header: 'Shipped',
      align: 'right',
      accessor: (item) => <span className="font-bold text-blue-700">{item.shippedQty.toLocaleString()}</span>
    },
    {
      key: 'delivered',
      header: 'Delivered',
      align: 'right',
      accessor: (item) => <span className="font-bold text-emerald-700">{item.deliveredQty.toLocaleString()}</span>
    },
    {
      key: 'remaining',
      header: 'Remaining',
      align: 'right',
      accessor: (item) => (
        <span className="font-bold text-slate-700">
          {(item.remainingQty ?? Math.max(0, item.orderedQty - item.deliveredQty)).toLocaleString()}
        </span>
      )
    }
  ];

  const submitIssue = () => {
    setIssueSubmitted(true);
    setIssueModalOpen(false);
    showToast(`Delivery issue logged for ${shipment.shipmentNumber || shipment.id.toUpperCase()}.`, 'success');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={shipment.shipmentNumber || shipment.id.toUpperCase()}
        subtitle={`${shipment.carrier} / Tracking ${shipment.trackingNumber}`}
        badge={<StatusBadge status={issueSubmitted ? 'Delivery Issue' : shipment.status} />}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Shipments', href: '/buyer/shipments' },
          { label: shipment.shipmentNumber || shipment.id.toUpperCase() }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/buyer/shipments">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            {relatedPO && (
              <Link to={`/buyer/purchase-orders/${relatedPO.id}`}>
                <Button variant="outline" size="sm" icon={ShoppingBag}>
                  View PO
                </Button>
              </Link>
            )}
            {relatedInvoice && (
              <Link to={`/buyer/invoices/${relatedInvoice.id}`}>
                <Button variant="outline" size="sm" icon={Receipt}>
                  View Invoice
                </Button>
              </Link>
            )}
            <Button variant="primary" size="sm" icon={AlertTriangle} onClick={() => setIssueModalOpen(true)}>
              Report Delivery Issue
            </Button>
          </div>
        }
      />

      {issueSubmitted && (
        <Alert type="success" title="Delivery issue submitted">
          The issue has been recorded for buyer review. Operations can follow up from the shipment workspace.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Shipment Overview" className="border-slate-200">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">PO Reference</div>
                <div className="mt-2 font-mono font-bold text-slate-900">{shipment.poNumber || shipment.poId || 'N/A'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ship Date</div>
                <div className="mt-2 font-semibold text-slate-900">{shipment.shipDate || 'Pending'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-blue-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">ETA</div>
                <div className="mt-2 font-semibold text-blue-900">{shipment.estimatedDelivery}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Origin Warehouse
                </div>
                <div className="mt-2 font-semibold text-slate-900">{shipment.originWarehouse || shipment.warehouseName}</div>
                <p className="mt-1 text-sm text-slate-600">{shipment.originAddress || shipment.warehouseName}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Delivery Address
                </div>
                <div className="mt-2 font-semibold text-slate-900">{shipment.contactPerson || 'Receiving Contact'}</div>
                <p className="mt-1 text-sm text-slate-600">{shipment.deliveryAddress || shipment.destinationAddress}</p>
              </div>
            </div>
          </Card>

          <Card title="Shipment Items" className="border-slate-200">
            <DataTable columns={itemColumns} data={shipment.items || []} compact emptyMessage="No shipment items available." />
          </Card>

          <Card title="Tracking Timeline" className="border-slate-200">
            <TrackingTimeline events={shipment.timeline || []} />
          </Card>

          <Card title="Partial Shipment Summary" className="border-slate-200">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordered</div>
                <div className="mt-2 text-xl font-extrabold text-slate-900">{poShipmentRollup.ordered.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipped</div>
                <div className="mt-2 text-xl font-extrabold text-blue-700">{poShipmentRollup.shipped.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivered</div>
                <div className="mt-2 text-xl font-extrabold text-emerald-700">{poShipmentRollup.delivered.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Remaining</div>
                <div className="mt-2 text-xl font-extrabold text-amber-700">{poShipmentRollup.remaining.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Delivery Progress</span>
                <span>{poShipmentRollup.progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, poShipmentRollup.progress)}%` }} />
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Carrier Details" className="border-slate-200">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Carrier</span>
                <span className="text-right font-semibold text-slate-900">{shipment.carrier}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Tracking</span>
                <span className="text-right font-mono text-xs font-bold text-blue-700">{shipment.trackingNumber}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Packages</span>
                <span className="font-semibold text-slate-900">{shipment.packagesCount || 0}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Delivery Window</span>
                <span className="text-right font-semibold text-slate-900">{shipment.deliveryWindow || 'Pending'}</span>
              </div>
            </div>
          </Card>

          <Card title="Delivery Details" className="border-slate-200">
            {shipment.proofOfDelivery ? (
              <div className="space-y-3 text-sm">
                <StatusBadge status={shipment.proofOfDelivery.status || 'Available'} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivered Date</div>
                  <div className="mt-1 font-semibold text-slate-900">{shipment.actualDelivery || shipment.proofOfDelivery.timestamp}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Received By</div>
                  <div className="mt-1 font-semibold text-slate-900">{shipment.proofOfDelivery.receivedBy}</div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{shipment.proofOfDelivery.notes}</p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ClipboardCheck}
                  className="w-full"
                  onClick={() => showToast('Proof of delivery opened for review.', 'info')}
                >
                  View Proof of Delivery
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Proof of delivery will appear after receiving confirmation.
                </div>
                <Button variant="outline" size="sm" icon={AlertTriangle} className="w-full" onClick={() => setIssueModalOpen(true)}>
                  Report Delivery Issue
                </Button>
              </div>
            )}
          </Card>

          <Card title="Related Records" className="border-slate-200">
            <div className="flex flex-col gap-2">
              {relatedPO ? (
                <Link to={`/buyer/purchase-orders/${relatedPO.id}`}>
                  <Button variant="outline" size="sm" icon={ShoppingBag} className="w-full">
                    View Purchase Order
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={ShoppingBag} disabled>
                  PO Unavailable
                </Button>
              )}
              {relatedInvoice ? (
                <Link to={`/buyer/invoices/${relatedInvoice.id}`}>
                  <Button variant="outline" size="sm" icon={Receipt} className="w-full">
                    View Invoice
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={Receipt} disabled>
                  Invoice Pending
                </Button>
              )}
              {relatedContract ? (
                <Link to={`/buyer/contracts/${relatedContract.id}`}>
                  <Button variant="outline" size="sm" icon={FileText} className="w-full">
                    View Contract
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={FileText} disabled>
                  Contract Unavailable
                </Button>
              )}
            </div>
          </Card>

          {relatedShipments.length > 0 && (
            <Card title="Related Shipments" className="border-slate-200">
              <div className="space-y-2">
                {relatedShipments.map((related) => (
                  <Link
                    key={related.id}
                    to={`/buyer/shipments/${related.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span>
                      <span className="block font-mono font-bold text-blue-700">{related.shipmentNumber || related.id}</span>
                      <span className="text-slate-500">{getShipmentTotals(related).shipped} shipped</span>
                    </span>
                    <StatusBadge status={related.status} size="sm" />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>

      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title={`Report Delivery Issue: ${shipment.shipmentNumber || shipment.id.toUpperCase()}`}
      >
        <div className="space-y-4">
          <Select
            label="Issue Type"
            value={issueType}
            onChange={(event) => setIssueType(event.target.value)}
            options={issueTypeOptions}
          />
          <Textarea
            label="Description"
            rows={4}
            value={issueDescription}
            onChange={(event) => setIssueDescription(event.target.value)}
            placeholder="Describe the delivery discrepancy..."
          />
          <Input
            label="Affected Quantity"
            type="number"
            min={1}
            value={affectedQuantity}
            onChange={(event) => setAffectedQuantity(event.target.value)}
          />
          <FileUpload
            label="Issue Evidence"
            helperText="Attach photos, receiving notes, or carrier documents."
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Paperclip}
              onClick={submitIssue}
              disabled={!issueDescription.trim() || !affectedQuantity}
            >
              Submit Issue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
