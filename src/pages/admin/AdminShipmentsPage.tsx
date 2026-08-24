import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Archive, CheckCircle2, Edit, Eye, MapPin, Plus, RadioTower, Save, Search, Trash2, Truck } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  FilterBar,
  Input,
  KPICard,
  Modal,
  PageHeader,
  SearchBar,
  Select,
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
  isCustom?: boolean;
}

interface CarrierDraft {
  carrier: string;
  serviceLevel: string;
  status: string;
}

const blankCarrierDraft: CarrierDraft = {
  carrier: '',
  serviceLevel: 'Regional LTL',
  status: 'Active'
};

export const AdminShipmentsPage: React.FC = () => {
  const { shipments, updateShipmentStatus, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'shipments';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customCarriers, setCustomCarriers] = useState<CarrierRow[]>([]);
  const [carrierOverrides, setCarrierOverrides] = useState<Record<string, Partial<CarrierRow>>>({});
  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [editingCarrierId, setEditingCarrierId] = useState<string | null>(null);
  const [carrierDraft, setCarrierDraft] = useState<CarrierDraft>(blankCarrierDraft);

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
    const rows = Array.from(grouped.values()).map((carrier) => ({
      ...carrier,
      ...carrierOverrides[carrier.id]
    }));

    const derivedIds = new Set(rows.map((carrier) => carrier.id));
    const standaloneCarriers = customCarriers.filter((carrier) => !derivedIds.has(carrier.id));

    return [...standaloneCarriers, ...rows];
  }, [carrierOverrides, customCarriers, shipments]);

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

  const openCarrierModal = (carrier?: CarrierRow) => {
    if (carrier) {
      setEditingCarrierId(carrier.id);
      setCarrierDraft({
        carrier: carrier.carrier,
        serviceLevel: carrier.serviceLevel,
        status: carrier.status
      });
    } else {
      setEditingCarrierId(null);
      setCarrierDraft(blankCarrierDraft);
    }
    setCarrierModalOpen(true);
  };

  const saveCarrier = (event: React.FormEvent) => {
    event.preventDefault();
    const carrierName = carrierDraft.carrier.trim();
    if (!carrierName) {
      showToast('Carrier name is required.', 'error');
      return;
    }

    if (editingCarrierId) {
      const patch = {
        carrier: carrierName,
        serviceLevel: carrierDraft.serviceLevel,
        status: carrierDraft.status
      };
      setCustomCarriers((current) =>
        current.map((carrier) => (carrier.id === editingCarrierId ? { ...carrier, ...patch } : carrier))
      );
      setCarrierOverrides((current) => ({ ...current, [editingCarrierId]: patch }));
      showToast(`${carrierName} carrier profile updated.`, 'success');
    } else {
      const id = `carrier-${Date.now()}`;
      setCustomCarriers((current) => [
        {
          id,
          carrier: carrierName,
          serviceLevel: carrierDraft.serviceLevel,
          status: carrierDraft.status,
          activeShipments: 0,
          deliveredShipments: 0,
          isCustom: true
        },
        ...current
      ]);
      showToast(`${carrierName} added to logistics carrier directory.`, 'success');
    }

    setCarrierModalOpen(false);
  };

  const toggleCarrierStatus = (carrier: CarrierRow) => {
    const nextStatus = carrier.status === 'Active' ? 'Inactive' : 'Active';
    if (carrier.isCustom) {
      setCustomCarriers((current) => current.map((item) => (item.id === carrier.id ? { ...item, status: nextStatus } : item)));
    }
    setCarrierOverrides((current) => ({
      ...current,
      [carrier.id]: { ...current[carrier.id], status: nextStatus }
    }));
    showToast(`${carrier.carrier} set to ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
  };

  const deleteCarrier = (carrier: CarrierRow) => {
    if (carrier.activeShipments > 0) {
      showToast('Carriers with active shipments cannot be deleted.', 'warning');
      return;
    }
    setCustomCarriers((current) => current.filter((item) => item.id !== carrier.id));
    setCarrierOverrides((current) => {
      const next = { ...current };
      delete next[carrier.id];
      return next;
    });
    showToast(`${carrier.carrier} removed from carrier directory.`, 'warning');
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
    { key: 'status', header: 'Status', accessor: (carrier) => <StatusBadge status={carrier.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (carrier) => (
        <div className="flex min-w-[220px] flex-wrap items-center gap-1.5">
          <Button variant="outline" size="xs" icon={Edit} onClick={() => openCarrierModal(carrier)}>
            Edit
          </Button>
          <Button
            variant={carrier.status === 'Active' ? 'ghost' : 'success'}
            size="xs"
            icon={carrier.status === 'Active' ? Archive : CheckCircle2}
            onClick={() => toggleCarrierStatus(carrier)}
          >
            {carrier.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="ghost" size="xs" icon={Trash2} onClick={() => deleteCarrier(carrier)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  const trackingColumns: Column<Shipment>[] = [
    {
      key: 'tracking',
      header: 'Tracking Number',
      accessor: (shipment) => (
        <div className="min-w-[220px]">
          <Link to={`/admin/shipments/${shipment.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
            {shipment.trackingNumber}
          </Link>
          <div className="text-[11px] text-slate-500">{shipment.shipmentNumber || shipment.id.toUpperCase()}</div>
        </div>
      )
    },
    {
      key: 'carrier',
      header: 'Carrier / Service',
      accessor: (shipment) => (
        <div className="min-w-[200px]">
          <div className="font-bold text-slate-900">{shipment.carrier}</div>
          <div className="text-xs text-slate-500">{shipment.serviceLevel || 'Standard freight'}</div>
        </div>
      )
    },
    {
      key: 'current',
      header: 'Current Event',
      accessor: (shipment) => {
        const currentEvent = [...(shipment.timeline || [])].reverse().find((event) => event.active || event.completed) || shipment.timeline?.[0];

        return (
          <div className="min-w-[260px]">
            <div className="font-bold text-slate-900">{currentEvent?.status || shipment.status}</div>
            <div className="text-xs text-slate-500">{currentEvent?.location || shipment.originWarehouse || shipment.warehouseName}</div>
            <div className="mt-1 text-[11px] text-slate-400">{currentEvent?.timestamp || shipment.dispatchDate || shipment.shipDate || 'Pending scan'}</div>
          </div>
        );
      }
    },
    {
      key: 'eta',
      header: 'ETA / Actual',
      accessor: (shipment) => (
        <div className="min-w-[150px] text-xs">
          <div className="font-semibold text-slate-800">ETA {shipment.estimatedDelivery}</div>
          <div className="text-slate-500">Actual {shipment.actualDelivery || 'Pending'}</div>
        </div>
      )
    },
    {
      key: 'pod',
      header: 'Proof of Delivery',
      accessor: (shipment) => <StatusBadge status={shipment.proofOfDelivery?.status || (shipment.status === 'Delivered' ? 'Pending' : 'Not Required')} size="sm" />
    },
    { key: 'status', header: 'Shipment Status', accessor: (shipment) => <StatusBadge status={shipment.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (shipment) => (
        <Link to={`/admin/shipments/${shipment.id}`}>
          <Button variant="outline" size="xs" icon={Eye}>
            Track
          </Button>
        </Link>
      )
    }
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

      <Card
        className="border-slate-200"
        noPadding
        action={
          activeTab === 'carriers' ? (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => openCarrierModal()}>
              Add Carrier
            </Button>
          ) : null
        }
      >
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
                      { label: 'Planned', value: 'Planned' },
                      { label: 'Preparing', value: 'Preparing' },
                      { label: 'Ready', value: 'Ready' },
                      { label: 'Shipped', value: 'Shipped' },
                      { label: 'Dispatched', value: 'Dispatched' },
                      { label: 'In Transit', value: 'In Transit' },
                      { label: 'Partially Delivered', value: 'Partially Delivered' },
                      { label: 'Delivered', value: 'Delivered' },
                      { label: 'Failed', value: 'Failed' },
                      { label: 'Cancelled', value: 'Cancelled' },
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
          ) : activeTab === 'tracking' ? (
            <DataTable columns={trackingColumns} data={filteredShipments} emptyMessage="No tracking records match the selected filters." />
          ) : (
            <DataTable columns={shipmentColumns} data={filteredShipments} emptyMessage="No shipments match the selected filters." />
          )}
        </div>
      </Card>

      <Modal
        isOpen={carrierModalOpen}
        onClose={() => setCarrierModalOpen(false)}
        title={editingCarrierId ? 'Edit Carrier' : 'Add Carrier'}
        subtitle="Maintain carrier service levels and operational availability for dispatch planning."
      >
        <form onSubmit={saveCarrier} className="space-y-4">
          <Input
            label="Carrier Name"
            required
            value={carrierDraft.carrier}
            onChange={(event) => setCarrierDraft((draft) => ({ ...draft, carrier: event.target.value }))}
          />
          <Input
            label="Service Level"
            required
            value={carrierDraft.serviceLevel}
            onChange={(event) => setCarrierDraft((draft) => ({ ...draft, serviceLevel: event.target.value }))}
            placeholder="Regional LTL, express pallet, cross-border freight..."
          />
          <Select
            label="Status"
            value={carrierDraft.status}
            onChange={(event) => setCarrierDraft((draft) => ({ ...draft, status: event.target.value }))}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Watchlist', value: 'Watchlist' }
            ]}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setCarrierModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              {editingCarrierId ? 'Save Carrier' : 'Create Carrier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
