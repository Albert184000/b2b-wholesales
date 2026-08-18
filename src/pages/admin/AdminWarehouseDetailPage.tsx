import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Boxes, MapPin, Package, Warehouse } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  KPICard,
  PageHeader,
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

export const AdminWarehouseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { inventory } = useApp();
  const warehouse = mockWarehouses.find((record) => record.id === id || record.code === id);

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

  const warehouseInventory = inventory.filter((item) => item.warehouseId === warehouse.id);
  const availableUnits = warehouseInventory.reduce((sum, item) => sum + item.available, 0);
  const reservedUnits = warehouseInventory.reduce((sum, item) => sum + item.reserved, 0);
  const inventoryValue = warehouseInventory.reduce((sum, item) => sum + item.available * item.unitCost, 0);
  const lowStockRows = warehouseInventory.filter((item) => getStockStatus(item) !== 'In Stock');

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

        <Card title="Location Zones">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {['Receiving Dock', 'Outbound Staging', 'High Value Cage', 'Pallet Reserve', 'Returns Bay'].map((zone, index) => (
              <div key={zone} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-800">{zone}</span>
                <span className="font-mono text-xs text-slate-500">Z-{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Warehouse Stock">
        <DataTable columns={columns} data={warehouseInventory} emptyMessage="No inventory rows are attached to this warehouse." />
      </Card>
    </div>
  );
};
