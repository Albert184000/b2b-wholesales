import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, FileCheck, MapPin, Package, PenLine, RadioTower, Truck, UserRound } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  KPICard,
  PageHeader,
  StatusBadge,
  Timeline
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { ShipmentItem, TrackingEvent } from '../../types';
import { getShipmentProgress, getShipmentTotals } from '../../utils/financeLogistics';

export const AdminShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { shipments, purchaseOrders, invoices, updateShipmentStatus, showToast } = useApp();
  const shipment = shipments.find((record) => record.id === id || record.shipmentNumber === id);

  if (!shipment) {
    return (
      <EmptyState
        icon={Truck}
        title="Shipment not found"
        description="The requested shipment record is not available in the current admin workspace."
        actionText="Back to Shipments"
        actionIcon={ArrowLeft}
        onAction={() => window.history.back()}
      />
    );
  }

  const po = purchaseOrders.find((record) => record.id === shipment.poId || record.poNumber === shipment.poNumber);
  const invoice = invoices.find((record) => record.id === shipment.invoiceId || record.poId === shipment.poId);
  const totals = getShipmentTotals(shipment);
  const progress = getShipmentProgress(shipment);
  const shipmentStatuses = ['Planned', 'Preparing', 'Ready', 'Shipped', 'In Transit', 'Partially Delivered', 'Delivered', 'Failed', 'Cancelled'];
  const proofOfDelivery = shipment.proofOfDelivery || {
    receivedBy: shipment.contactPerson || 'Receiver pending',
    timestamp: shipment.actualDelivery || 'Pending delivery confirmation',
    notes: 'Proof of delivery will be attached after receiver confirmation.',
    status: shipment.status === 'Delivered' ? 'Available' : 'Pending'
  };

  const setStatus = (status: string) => {
    updateShipmentStatus(shipment.id, status);
    showToast(`${shipment.shipmentNumber || shipment.id} moved to ${status}.`, ['Failed', 'Cancelled'].includes(status) ? 'warning' : 'success');
  };

  const itemColumns: Column<ShipmentItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs text-blue-700">{item.sku}</div>
        </div>
      )
    },
    {
      key: 'ordered',
      header: 'Ordered',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{item.orderedQty.toLocaleString()}</span>
    },
    {
      key: 'shipped',
      header: 'Shipped',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{item.shippedQty.toLocaleString()}</span>
    },
    {
      key: 'delivered',
      header: 'Delivered',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{item.deliveredQty.toLocaleString()}</span>
    },
    {
      key: 'remaining',
      header: 'Remaining',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-bold text-amber-700">
          {(item.remainingQty ?? Math.max(0, item.orderedQty - item.shippedQty)).toLocaleString()}
        </span>
      )
    }
  ];

  const timelineItems = (shipment.timeline || []).map((item: TrackingEvent) => ({
    title: item.status,
    date: item.timestamp,
    actor: item.location,
    description: item.description,
    completed: item.completed,
    active: item.active
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={shipment.shipmentNumber || shipment.id.toUpperCase()}
        subtitle={`${shipment.carrier} - ${shipment.trackingNumber}`}
        breadcrumbs={[
          { label: 'Shipments', href: '/admin/shipments' },
          { label: shipment.shipmentNumber || shipment.id }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/shipments">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={RadioTower} onClick={() => setStatus('In Transit')}>
              In Transit
            </Button>
            <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => setStatus('Delivered')}>
              Delivered
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Shipment Status" value={shipment.status} subtext={shipment.estimatedDelivery} icon={Truck} />
        <KPICard title="Progress" value={`${progress}%`} subtext={`${totals.delivered}/${totals.ordered} delivered`} icon={Package} />
        <KPICard title="Carrier" value={shipment.carrier} subtext={shipment.serviceLevel || 'Freight service'} icon={RadioTower} />
        <KPICard title="Packages" value={shipment.packagesCount || shipment.items?.length || 0} subtext={shipment.warehouseName || shipment.originWarehouse} icon={MapPin} />
      </div>

      <Card title="Shipment Status Workflow" subtitle="Operational status controls from planning through delivery completion.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-9">
          {shipmentStatuses.map((status) => (
            <Button
              key={status}
              type="button"
              variant={shipment.status === status ? 'primary' : status === 'Failed' || status === 'Cancelled' ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => setStatus(status)}
              className="justify-center"
            >
              {status}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Shipment Route" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Origin</div>
              <div className="mt-1 font-bold text-slate-900">{shipment.originWarehouse || shipment.warehouseName}</div>
              <p className="mt-1 text-sm text-slate-600">{shipment.originAddress}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Destination</div>
              <div className="mt-1 font-bold text-slate-900">{shipment.companyName}</div>
              <p className="mt-1 text-sm text-slate-600">{shipment.destinationAddress || shipment.deliveryAddress}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
        </Card>

        <Card title="Related Records">
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Purchase Order</div>
              <div className="mt-1 font-bold text-slate-900">
                {po ? (
                  <Link to={`/admin/purchase-orders/${po.id}`} className="text-blue-700 hover:text-blue-900">
                    {po.poNumber || po.id}
                  </Link>
                ) : (
                  shipment.poNumber || shipment.poId || 'N/A'
                )}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Invoice</div>
              <div className="mt-1 font-bold text-slate-900">
                {invoice ? (
                  <Link to={`/admin/invoices/${invoice.id}`} className="text-blue-700 hover:text-blue-900">
                    {invoice.invoiceNumber || invoice.id}
                  </Link>
                ) : (
                  shipment.invoiceId || 'N/A'
                )}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-blue-700" />
                <div>
                  <div className="font-bold text-slate-900">{shipment.contactPerson || 'Receiving contact pending'}</div>
                  <div className="text-xs text-slate-500">{shipment.deliveryWindow || 'Delivery window pending'}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Partial Shipment Summary" subtitle="Ordered vs shipped vs remaining quantity across shipment lines.">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Ordered</div>
              <div className="mt-1 font-mono text-2xl font-extrabold text-slate-900">{totals.ordered.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Shipped</div>
              <div className="mt-1 font-mono text-2xl font-extrabold text-blue-700">{totals.shipped.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Remaining</div>
              <div className="mt-1 font-mono text-2xl font-extrabold text-amber-700">{Math.max(0, totals.ordered - totals.shipped).toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${totals.ordered > 0 ? Math.round((totals.shipped / totals.ordered) * 100) : 0}%` }} />
          </div>
        </Card>

        <Card title="Proof of Delivery" subtitle="Receiver confirmation, signature placeholder, delivery photo, and POD document status.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <UserRound className="h-4 w-4" />
                Receiver
              </div>
              <div className="mt-2 font-bold text-slate-900">{proofOfDelivery.receivedBy}</div>
              <div className="mt-1 text-sm text-slate-600">{proofOfDelivery.timestamp}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <FileCheck className="h-4 w-4" />
                POD Status
              </div>
              <div className="mt-2">
                <StatusBadge status={proofOfDelivery.status || 'Pending'} size="sm" />
              </div>
              <div className="mt-1 text-sm text-slate-600">{proofOfDelivery.notes || 'No delivery notes attached yet.'}</div>
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <PenLine className="h-4 w-4 text-blue-700" />
                Signature Placeholder
              </div>
              <div className="mt-4 h-14 rounded-lg border border-slate-200 bg-slate-50" />
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Camera className="h-4 w-4 text-blue-700" />
                Delivery Photo Placeholder
              </div>
              <div className="mt-4 flex h-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
                POD image pending
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Shipment Items">
        <DataTable columns={itemColumns} data={shipment.items || []} emptyMessage="No shipment line items are attached." />
      </Card>

      <Card title="Tracking Timeline">
        <Timeline items={timelineItems} />
      </Card>
    </div>
  );
};
