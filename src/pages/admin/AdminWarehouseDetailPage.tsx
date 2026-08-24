import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Archive, ArrowLeft, Boxes, CheckCircle2, Edit, MapPin, Package, Plus, Save, Trash2, Warehouse } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Input,
  KPICard,
  Modal,
  PageHeader,
  Select,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { mockWarehouses } from '../../data/mockData';
import { InventoryItem } from '../../types';
import { formatCurrency } from '../../utils/pricing';

const getStockStatus = (item: InventoryItem) => {
  if (item.available <= 0) return 'Out of Stock';
  if (item.available <= item.reorderPoint) return 'Low Stock';
  return 'In Stock';
};

interface LocationBin {
  id: string;
  code: string;
  zone: string;
  capacity: number;
  occupied: number;
  skuCount: number;
  status: string;
  isCustom?: boolean;
}

interface LocationDraft {
  code: string;
  zone: string;
  capacity: string;
  status: string;
}

const blankLocationDraft: LocationDraft = {
  code: '',
  zone: 'Pallet Reserve',
  capacity: '500',
  status: 'Active'
};

export const AdminWarehouseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { inventory, showToast } = useApp();
  const warehouse = mockWarehouses.find((record) => record.id === id || record.code === id);
  const warehouseInventory = useMemo(
    () => (warehouse ? inventory.filter((item) => item.warehouseId === warehouse.id) : []),
    [inventory, warehouse]
  );
  const [customLocations, setCustomLocations] = useState<LocationBin[]>([]);
  const [locationOverrides, setLocationOverrides] = useState<Record<string, Partial<LocationBin>>>({});
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationDraft, setLocationDraft] = useState<LocationDraft>(blankLocationDraft);

  const derivedLocationRows = useMemo(() => {
    const grouped = new Map<string, LocationBin>();

    warehouseInventory.forEach((item) => {
      const code = item.locationBin || item.location || 'Unassigned';
      const existing = grouped.get(code) || {
        id: code,
        code,
        zone: code.includes('DOCK')
          ? 'Receiving Dock'
          : code.includes('OUT')
          ? 'Outbound Staging'
          : code.includes('CAGE')
          ? 'High Value Cage'
          : 'Pallet Reserve',
        capacity: Math.max(500, item.onHand + item.reserved + 150),
        occupied: 0,
        skuCount: 0,
        status: 'Active'
      };

      existing.occupied += item.onHand + item.reserved;
      existing.skuCount += 1;
      existing.capacity = Math.max(existing.capacity, existing.occupied + 100);
      existing.status = existing.occupied >= existing.capacity ? 'Full' : 'Active';
      grouped.set(code, existing);
    });

    return Array.from(grouped.values()).map((location) => ({
      ...location,
      ...locationOverrides[location.id]
    }));
  }, [locationOverrides, warehouseInventory]);

  const locationRows = useMemo(() => {
    const derivedIds = new Set(derivedLocationRows.map((location) => location.id));
    return [
      ...customLocations.filter((location) => !derivedIds.has(location.id)),
      ...derivedLocationRows
    ];
  }, [customLocations, derivedLocationRows]);

  if (!warehouse) {
    return (
      <EmptyState
        icon={Warehouse}
        title="Warehouse not found"
        description="The requested warehouse record is not available in the current admin workspace."
        actionText="Back to Warehouses"
        actionIcon={ArrowLeft}
        onAction={() => window.history.back()}
      />
    );
  }

  const availableUnits = warehouseInventory.reduce((sum, item) => sum + item.available, 0);
  const reservedUnits = warehouseInventory.reduce((sum, item) => sum + item.reserved, 0);
  const inventoryValue = warehouseInventory.reduce((sum, item) => sum + item.available * item.unitCost, 0);
  const lowStockRows = warehouseInventory.filter((item) => getStockStatus(item) !== 'In Stock');

  const openLocationModal = (location?: LocationBin) => {
    if (location) {
      setEditingLocationId(location.id);
      setLocationDraft({
        code: location.code,
        zone: location.zone,
        capacity: String(location.capacity),
        status: location.status
      });
    } else {
      setEditingLocationId(null);
      setLocationDraft(blankLocationDraft);
    }
    setLocationModalOpen(true);
  };

  const saveLocation = (event: React.FormEvent) => {
    event.preventDefault();
    const code = locationDraft.code.trim().toUpperCase();
    const capacity = Number(locationDraft.capacity);

    if (!code || !Number.isFinite(capacity) || capacity <= 0) {
      showToast('Enter a valid bin code and capacity.', 'error');
      return;
    }

    const patch = {
      code,
      zone: locationDraft.zone,
      capacity,
      status: locationDraft.status
    };

    if (editingLocationId) {
      setCustomLocations((current) =>
        current.map((location) => (location.id === editingLocationId ? { ...location, ...patch } : location))
      );
      setLocationOverrides((current) => ({ ...current, [editingLocationId]: patch }));
      showToast(`${code} location updated.`, 'success');
    } else {
      setCustomLocations((current) => [
        {
          id: code,
          ...patch,
          occupied: 0,
          skuCount: 0,
          isCustom: true
        },
        ...current
      ]);
      showToast(`${code} location added to ${warehouse.code}.`, 'success');
    }

    setLocationModalOpen(false);
  };

  const toggleLocationStatus = (location: LocationBin) => {
    const nextStatus = location.status === 'Active' ? 'Inactive' : 'Active';
    if (location.isCustom) {
      setCustomLocations((current) => current.map((item) => (item.id === location.id ? { ...item, status: nextStatus } : item)));
    }
    setLocationOverrides((current) => ({
      ...current,
      [location.id]: { ...current[location.id], status: nextStatus }
    }));
    showToast(`${location.code} set to ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
  };

  const deleteLocation = (location: LocationBin) => {
    if (location.occupied > 0) {
      showToast('Only empty bins can be deleted. Move stock before deleting this location.', 'warning');
      return;
    }

    setCustomLocations((current) => current.filter((item) => item.id !== location.id));
    setLocationOverrides((current) => {
      const next = { ...current };
      delete next[location.id];
      return next;
    });
    showToast(`${location.code} removed from warehouse locations.`, 'warning');
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'sku',
      header: 'SKU / Product',
      accessor: (item) => (
        <div className="min-w-[260px]">
          <div className="font-mono font-bold text-blue-700">{item.sku}</div>
          <div className="font-semibold text-slate-900">{item.productName}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      accessor: (item) => <span className="font-mono text-xs text-slate-700">{item.locationBin || item.location || 'Unassigned'}</span>
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      accessor: (item) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{item.available.toLocaleString()} available</div>
          <div className="text-xs text-slate-500">{item.reserved.toLocaleString()} reserved</div>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{formatCurrency(item.available * item.unitCost)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => <StatusBadge status={getStockStatus(item)} size="sm" />
    }
  ];

  const locationColumns: Column<LocationBin>[] = [
    {
      key: 'code',
      header: 'Location / Bin',
      accessor: (location) => (
        <div className="min-w-[180px]">
          <div className="font-mono font-bold text-blue-700">{location.code}</div>
          <div className="text-xs font-semibold text-slate-700">{location.zone}</div>
        </div>
      )
    },
    {
      key: 'skuCount',
      header: 'SKUs',
      align: 'right',
      accessor: (location) => <span className="font-mono font-bold text-slate-900">{location.skuCount}</span>
    },
    {
      key: 'utilization',
      header: 'Utilization',
      accessor: (location) => {
        const utilization = Math.min(100, Math.round((location.occupied / location.capacity) * 100));
        return (
          <div className="min-w-[160px]">
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-700">
              <span>{utilization}%</span>
              <span className="font-mono">{location.occupied.toLocaleString()} / {location.capacity.toLocaleString()}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${utilization}%` }} />
            </div>
          </div>
        );
      }
    },
    { key: 'status', header: 'Status', accessor: (location) => <StatusBadge status={location.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (location) => (
        <div className="flex min-w-[220px] flex-wrap items-center gap-1.5">
          <Button variant="outline" size="xs" icon={Edit} onClick={() => openLocationModal(location)}>
            Edit
          </Button>
          <Button
            variant={location.status === 'Active' ? 'ghost' : 'success'}
            size="xs"
            icon={location.status === 'Active' ? Archive : CheckCircle2}
            onClick={() => toggleLocationStatus(location)}
          >
            {location.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="ghost" size="xs" icon={Trash2} onClick={() => deleteLocation(location)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={warehouse.name}
        subtitle={`${warehouse.code} - ${warehouse.city}`}
        breadcrumbs={[
          { label: 'Warehouses', href: '/admin/warehouses' },
          { label: warehouse.code }
        ]}
        actions={
          <Link to="/admin/warehouses">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Available Units" value={availableUnits.toLocaleString()} subtext={`${reservedUnits.toLocaleString()} reserved`} icon={Boxes} />
        <KPICard title="Inventory Value" value={formatCurrency(inventoryValue)} subtext="Available stock at cost" icon={Package} />
        <KPICard title="Capacity" value={`${warehouse.capacityUtilization || 0}%`} subtext="Pallet occupancy" icon={Warehouse} />
        <KPICard title="Stock Alerts" value={lowStockRows.length} subtext="Rows needing review" icon={MapPin} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Facility Details" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Address</div>
              <div className="mt-1 font-semibold text-slate-900">{warehouse.address}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Operations Status</div>
              <div className="mt-2">
                <StatusBadge status={warehouse.status || 'Active'} />
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Locations & Bins"
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => openLocationModal()}>
              Add Bin
            </Button>
          }
        >
          <DataTable columns={locationColumns} data={locationRows} compact emptyMessage="No locations are configured for this warehouse." />
        </Card>
      </div>

      <Card title="Warehouse Stock">
        <DataTable columns={columns} data={warehouseInventory} emptyMessage="No inventory rows are attached to this warehouse." />
      </Card>

      <Modal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        title={editingLocationId ? 'Edit Location or Bin' : 'Add Location or Bin'}
        subtitle="Maintain warehouse bin capacity, zone mapping, and availability."
      >
        <form onSubmit={saveLocation} className="space-y-4">
          <Input
            label="Bin Code"
            required
            value={locationDraft.code}
            onChange={(event) => setLocationDraft((draft) => ({ ...draft, code: event.target.value }))}
            placeholder="A1-BIN-04"
          />
          <Select
            label="Zone"
            value={locationDraft.zone}
            onChange={(event) => setLocationDraft((draft) => ({ ...draft, zone: event.target.value }))}
            options={[
              { label: 'Receiving Dock', value: 'Receiving Dock' },
              { label: 'Outbound Staging', value: 'Outbound Staging' },
              { label: 'High Value Cage', value: 'High Value Cage' },
              { label: 'Pallet Reserve', value: 'Pallet Reserve' },
              { label: 'Returns Bay', value: 'Returns Bay' }
            ]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Capacity"
              type="number"
              min="1"
              required
              value={locationDraft.capacity}
              onChange={(event) => setLocationDraft((draft) => ({ ...draft, capacity: event.target.value }))}
            />
            <Select
              label="Status"
              value={locationDraft.status}
              onChange={(event) => setLocationDraft((draft) => ({ ...draft, status: event.target.value }))}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Full', value: 'Full' },
                { label: 'Maintenance', value: 'Maintenance' }
              ]}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setLocationModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
