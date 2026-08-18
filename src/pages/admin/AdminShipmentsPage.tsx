import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, MapPin, RadioTower, Search, Truck } from 'lucide-react';
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
import { Shipment } from '../../types';
import { getShipmentProgress } from '../../utils/financeLogistics';

interface CarrierRow {
  id: string;
  carrier: string;
  activeShipments: number;
  deliveredShipments: number;
  serviceLevel: string;
  status: string;
}

export const AdminShipmentsPage: React.FC = () => {
  const { shipments, updateShipmentStatus, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'shipments';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const inTransitCount = shipments.filter((shipment) => ['Dispatched', 'In Transit', 'Out for Delivery'].includes(shipment.status)).length;
  const deliveredCount = shipments.filter((shipment) => shipment.status === 'Delivered').length;
  const delayedCount = shipments.filter((shipment) => shipment.status === 'Delayed').length;
  const readyCount = shipments.filter((shipment) => ['Ready', 'Preparing', 'Pending Dispatch'].includes(shipment.status)).length;

  const carrierRows: CarrierRow[] = useMemo(() => {
    const grouped = new Map<string, CarrierRow>();
    shipments.forEach((shipment) => {
      const row = grouped.get(shipment.carrier) || {
        id: shipment.carrier,
        carrier: shipment.carrier,
        activeShipments: 0,
        deliveredShipments: 0,
        serviceLevel: shipment.serviceLevel || 'Mixed freight',
        status: 'Active'
      };
      row.activeShipments += shipment.status === 'Delivered' ? 0 : 1;
      row.deliveredShipments += shipment.status === 'Delivered' ? 1 : 0;
      grouped.set(shipment.carrier, row);
    });
    return Array.from(grouped.values());
  }, [shipments]);

  const filteredShipments = shipments.filter((shipment) => {
    const query = searchTerm.trim().toLowerCase();
    const matchSearch =
      query === '' ||
      (shipment.shipmentNumber || shipment.id).toLowerCase().includes(query) ||
      shipment.trackingNumber.toLowerCase().includes(query) ||
      (shipment.poNumber || shipment.poId || '').toLowerCase().includes(query) ||
      shipment.carrier.toLowerCase().includes(query) ||
      (shipment.companyName || '').toLowerCase().includes(query);
    const matchStatus = statusFilter === 'ALL' || shipment.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredCarriers = carrierRows.filter((carrier) => {
    const query = searchTerm.trim().toLowerCase();
    return query === '' || carrier.carrier.toLowerCase().includes(query) || carrier.serviceLevel.toLowerCase().includes(query);
  });

  const updateStatus = (shipment: Shipment, status: string) => {
    updateShipmentStatus(shipment.id, status);
    showToast(`${shipment.shipmentNumber || shipment.id} moved to ${status}.`, status === 'Delayed' ? 'warning' : 'success');
  };

  const shipmentColumns: Column<Shipment>[] = [
    {
      key: 'shipment',
      header: 'Shipment / Tracking',
      accessor: (shipment) => (
        <div className="min-w-[210px]">
          <Link to={`/admin/shipments/${shipment.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
            {shipment.shipmentNumber || shipment.id.toUpperCase()}
          </Link>
          <div className="font-mono text-[11px] text-slate-500">{shipment.trackingNumber}</div>
        </div>
      )
    },
    {
      key: 'po',
      header: 'PO / Buyer',
      accessor: (shipment) => (
        <div className="min-w-[210px]">
          <div className="font-bold text-slate-900">{shipment.poNumber || shipment.poId}</div>
          <div className="text-xs text-slate-500">{shipment.companyName}</div>
        </div>
      )
    },
    {
      key: 'carrier',
      header: 'Carrier',
      accessor: (shipment) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-slate-900">{shipment.carrier}</div>
          <div className="text-xs text-slate-500">{shipment.originWarehouse || shipment.warehouseName}</div>
        </div>
      )
    },
    {
      key: 'eta',
      header: 'Dispatch / ETA',
      accessor: (shipment) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{shipment.dispatchDate || shipment.shipDate || 'Pending'}</div>
          <div className="text-slate-500">ETA {shipment.estimatedDelivery}</div>
        </div>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      accessor: (shipment) => (
        <div className="min-w-[120px]">
          <div className="mb-1 text-xs font-bold text-slate-700">{getShipmentProgress(shipment)}%</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${getShipmentProgress(shipment)}%` }} />
          </div>
        </div>
      )
    },
    { key: 'status', header: 'Status', accessor: (shipment) => <StatusBadge status={shipment.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (shipment) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to={`/admin/shipments/${shipment.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>
          {shipment.status !== 'Delivered' && (
            <Button variant="success" size="xs" icon={CheckCircle2} onClick={() => updateStatus(shipment, 'Delivered')}>
              Delivered
            </Button>
          )}
        </div>
      )
    }
  ];

  const carrierColumns: Column<CarrierRow>[] = [
    { key: 'carrier', header: 'Carrier', accessor: (carrier) => <span className="font-bold text-slate-900">{carrier.carrier}</span> },
    { key: 'service', header: 'Service Level', accessor: (carrier) => <span className="text-slate-700">{carrier.serviceLevel}</span> },
    { key: 'active', header: 'Active Loads', align: 'right', accessor: (carrier) => <span className="font-mono font-bold text-slate-900">{carrier.activeShipments}</span> },
    { key: 'delivered', header: 'Delivered', align: 'right', accessor: (carrier) => <span className="font-mono font-bold text-slate-900">{carrier.deliveredShipments}</span> },
    { key: 'status', header: 'Status', accessor: (carrier) => <StatusBadge status={carrier.status} size="sm" /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics Management"
        subtitle="Manage dispatch manifests, carrier performance, tracking status, and delivery confirmation."
        breadcrumbs={[
          { label: 'Logistics', href: '/admin/dashboard' },
          { label: 'Shipments' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Ready for Dispatch" value={readyCount} subtext="Preparing or pending pickup" icon={Truck} />
        <KPICard title="In Transit" value={inTransitCount} subtext="Carrier movement active" icon={RadioTower} />
        <KPICard title="Delivered" value={deliveredCount} subtext="Proof of delivery expected" icon={CheckCircle2} />
        <KPICard title="Delayed" value={delayedCount} subtext="Requires logistics review" icon={MapPin} badge={delayedCount ? 'Review' : undefined} badgeVariant="danger" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'shipments', label: 'Shipments', icon: Truck },
          { id: 'carriers', label: 'Carriers', icon: RadioTower },
          { id: 'tracking', label: 'Tracking', icon: MapPin }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              icon={Icon}
              onClick={() => setSearchParams(tab.id === 'shipments' ? {} : { tab: tab.id })}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search shipment, carrier, tracking number, PO, or buyer..."
              />
            </div>
            {activeTab !== 'carriers' && (
              <FilterBar
                filters={[
                  {
                    id: 'status',
                    label: 'Status',
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: [
                      { label: 'Preparing', value: 'Preparing' },
                      { label: 'Ready', value: 'Ready' },
                      { label: 'Dispatched', value: 'Dispatched' },
                      { label: 'In Transit', value: 'In Transit' },
                      { label: 'Delivered', value: 'Delivered' },
                      { label: 'Delayed', value: 'Delayed' }
                    ]
                  }
                ]}
                hasActiveFilters={statusFilter !== 'ALL' || searchTerm !== ''}
                onReset={() => {
                  setStatusFilter('ALL');
                  setSearchTerm('');
                }}
              />
            )}
          </div>

          {activeTab === 'carriers' ? (
            <DataTable columns={carrierColumns} data={filteredCarriers} emptyMessage="No carriers match the current search." />
          ) : (
            <DataTable columns={shipmentColumns} data={filteredShipments} emptyMessage="No shipments match the selected filters." />
          )}
        </div>
      </Card>
    </div>
  );
};
