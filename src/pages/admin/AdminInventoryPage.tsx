import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  ClipboardList,
  DollarSign,
  History,
  PackageCheck,
  Warehouse
} from 'lucide-react';
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
import { InventoryItem } from '../../types';
import { formatCurrency } from '../../utils/pricing';

const getInventoryStockStatus = (item: InventoryItem) => {
  if (item.available <= 0) return 'Out of Stock';
  if (item.available <= item.reorderPoint) return 'Low Stock';
  return 'In Stock';
};

export const AdminInventoryPage: React.FC = () => {
  const { inventory, products, purchaseOrders, updateStock, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stock';
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [adjustModalItem, setAdjustModalItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Cycle Count Adjustment');

  const categories = Array.from(new Set(products.map((product) => product.category))).sort();
  const warehouses = Array.from(new Set(inventory.map((item) => item.warehouseName))).sort();
  const totalOnHand = inventory.reduce((sum, item) => sum + item.onHand, 0);
  const totalReserved = inventory.reduce((sum, item) => sum + item.reserved, 0);
  const lowStockCount = inventory.filter((item) => getInventoryStockStatus(item) === 'Low Stock').length;
  const outOfStockCount = inventory.filter((item) => getInventoryStockStatus(item) === 'Out of Stock').length;
  const inventoryValue = inventory.reduce((sum, item) => sum + item.available * item.unitCost, 0);

  const stockMovements = inventory.map((item, index) => ({
    id: `mov-${item.id}`,
    sku: item.sku,
    productName: item.productName,
    warehouseName: item.warehouseName,
    type: index % 2 === 0 ? 'Cycle Count Adjustment' : 'Inbound Receipt',
    quantity: index % 2 === 0 ? item.available - item.reorderPoint : item.reserved,
    date: `2026-08-${String(18 - index).padStart(2, '0')}`,
    status: 'Completed'
  }));

  const allocationRows = purchaseOrders.flatMap((po) =>
    (po.inventoryAllocations || []).map((allocation) => ({
      id: `${po.id}-${allocation.sku}`,
      poId: po.id,
      poNumber: po.poNumber || po.id,
      buyerName: po.companyName || po.buyerName || po.buyerId,
      sku: allocation.sku,
      productName: allocation.productName,
      requestedQty: allocation.requestedQty,
      allocatedQty: allocation.allocatedQty,
      backorderQty: allocation.backorderQty,
      result: allocation.result
    }))
  );

  const backorderRows = allocationRows.filter((row) => row.backorderQty > 0);
  const inventoryQuery = searchTerm.trim().toLowerCase();
  const filteredStockMovements = stockMovements.filter(
    (row) =>
      inventoryQuery === '' ||
      row.sku.toLowerCase().includes(inventoryQuery) ||
      row.productName.toLowerCase().includes(inventoryQuery) ||
      row.warehouseName.toLowerCase().includes(inventoryQuery) ||
      row.type.toLowerCase().includes(inventoryQuery)
  );
  const filteredAllocationRows = allocationRows.filter(
    (row) =>
      inventoryQuery === '' ||
      row.poNumber.toLowerCase().includes(inventoryQuery) ||
      row.buyerName.toLowerCase().includes(inventoryQuery) ||
      row.sku.toLowerCase().includes(inventoryQuery) ||
      row.productName.toLowerCase().includes(inventoryQuery)
  );
  const filteredBackorderRows = backorderRows.filter(
    (row) =>
      inventoryQuery === '' ||
      row.poNumber.toLowerCase().includes(inventoryQuery) ||
      row.buyerName.toLowerCase().includes(inventoryQuery) ||
      row.sku.toLowerCase().includes(inventoryQuery) ||
      row.productName.toLowerCase().includes(inventoryQuery)
  );

  const filteredInventory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return inventory.filter((item) => {
      const product = products.find((record) => record.id === item.productId);
      const matchSearch =
        query === '' ||
        item.productName.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.warehouseName.toLowerCase().includes(query) ||
        (item.locationBin || item.location || '').toLowerCase().includes(query);
      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouseName === warehouseFilter;
      const matchCategory = categoryFilter === 'ALL' || product?.category === categoryFilter;
      const matchStock = stockFilter === 'ALL' || getInventoryStockStatus(item) === stockFilter;

      return matchSearch && matchWarehouse && matchCategory && matchStock;
    });
  }, [inventory, products, searchTerm, warehouseFilter, categoryFilter, stockFilter]);

  const openAdjustModal = (item: InventoryItem) => {
    setAdjustModalItem(item);
    setAdjustQty(item.onHand);
    setAdjustReason('Cycle Count Adjustment');
  };

  const handleAdjustSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!adjustModalItem) return;

    updateStock(adjustModalItem.productId, adjustModalItem.warehouseId, adjustQty);
    showToast(`${adjustModalItem.sku} stock adjusted to ${adjustQty.toLocaleString()} on-hand units.`, 'success');
    setAdjustModalItem(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setWarehouseFilter('ALL');
    setCategoryFilter('ALL');
    setStockFilter('ALL');
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'sku',
      header: 'SKU / Product',
      accessor: (item) => {
        const product = products.find((record) => record.id === item.productId);

        return (
          <div className="min-w-[260px]">
            <div className="font-mono font-bold text-blue-700">{item.sku}</div>
            <div className="line-clamp-1 font-semibold text-slate-900">{item.productName}</div>
            <div className="text-[11px] text-slate-500">{product?.category || 'Uncategorized'}</div>
          </div>
        );
      },
      sortable: true
    },
    {
      key: 'warehouse',
      header: 'Warehouse / Bin',
      accessor: (item) => (
        <div className="min-w-[220px]">
          <div className="font-semibold text-slate-900">{item.warehouseName}</div>
          <div className="font-mono text-[11px] text-slate-500">Bin {item.locationBin || item.location || 'Unassigned'}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'stock',
      header: 'Stock Levels',
      accessor: (item) => (
        <div className="min-w-[180px] text-xs">
          <div className="font-bold text-slate-900">{item.available.toLocaleString()} available</div>
          <div className="text-slate-500">
            {item.onHand.toLocaleString()} on hand - {item.reserved.toLocaleString()} reserved
          </div>
          <div className="text-slate-500">Reorder at {item.reorderPoint.toLocaleString()}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'value',
      header: 'Available Value',
      align: 'right',
      accessor: (item) => (
        <div className="min-w-[120px]">
          <div className="font-mono font-bold text-slate-900">{formatCurrency(item.available * item.unitCost)}</div>
          <div className="text-[11px] text-slate-500">{formatCurrency(item.unitCost)} cost</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Stock Status',
      accessor: (item) => <StatusBadge status={getInventoryStockStatus(item)} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (item) => (
        <Button variant="outline" size="xs" icon={ArrowUpDown} onClick={() => openAdjustModal(item)}>
          Adjust
        </Button>
      )
    }
  ];

  const movementColumns: Column<(typeof stockMovements)[number]>[] = [
    { key: 'date', header: 'Date', accessor: (row) => <span className="font-semibold text-slate-700">{row.date}</span> },
    {
      key: 'sku',
      header: 'SKU / Product',
      accessor: (row) => (
        <div className="min-w-[240px]">
          <div className="font-mono font-bold text-blue-700">{row.sku}</div>
          <div className="font-semibold text-slate-900">{row.productName}</div>
        </div>
      )
    },
    { key: 'warehouse', header: 'Warehouse', accessor: (row) => <span className="text-slate-700">{row.warehouseName}</span> },
    { key: 'type', header: 'Movement Type', accessor: (row) => <span className="font-semibold text-slate-800">{row.type}</span> },
    { key: 'qty', header: 'Qty Delta', align: 'right', accessor: (row) => <span className="font-mono font-bold text-slate-900">{row.quantity.toLocaleString()}</span> },
    { key: 'status', header: 'Status', accessor: (row) => <StatusBadge status={row.status} size="sm" /> }
  ];

  const allocationColumns: Column<(typeof allocationRows)[number]>[] = [
    {
      key: 'po',
      header: 'PO / Buyer',
      accessor: (row) => (
        <div className="min-w-[200px]">
          <div className="font-mono font-bold text-blue-700">{row.poNumber}</div>
          <div className="text-xs text-slate-500">{row.buyerName}</div>
        </div>
      )
    },
    {
      key: 'sku',
      header: 'SKU / Product',
      accessor: (row) => (
        <div className="min-w-[240px]">
          <div className="font-mono font-bold text-blue-700">{row.sku}</div>
          <div className="font-semibold text-slate-900">{row.productName}</div>
        </div>
      )
    },
    { key: 'requested', header: 'Requested', align: 'right', accessor: (row) => <span className="font-mono font-bold">{row.requestedQty.toLocaleString()}</span> },
    { key: 'allocated', header: 'Allocated', align: 'right', accessor: (row) => <span className="font-mono font-bold">{row.allocatedQty.toLocaleString()}</span> },
    { key: 'backorder', header: 'Backorder', align: 'right', accessor: (row) => <span className="font-mono font-bold text-rose-700">{row.backorderQty.toLocaleString()}</span> },
    { key: 'status', header: 'Status', accessor: (row) => <StatusBadge status={row.result} size="sm" /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        subtitle="Track current stock, reserved quantities, low-stock warnings, warehouse bins, and inventory adjustments."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Inventory' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="On-Hand Units" value={totalOnHand.toLocaleString()} subtext={`${totalReserved.toLocaleString()} reserved`} icon={Boxes} />
        <KPICard title="Inventory Value" value={formatCurrency(inventoryValue)} subtext="Available stock at cost" icon={DollarSign} />
        <KPICard title="Low Stock" value={lowStockCount} subtext="At or below reorder point" icon={AlertTriangle} badge={lowStockCount ? 'Review' : undefined} badgeVariant="amber" />
        <KPICard title="Out of Stock" value={outOfStockCount} subtext="Available quantity is zero" icon={Warehouse} badge={outOfStockCount ? 'Action' : undefined} badgeVariant="danger" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'stock', label: 'Current Stock', icon: Boxes },
          { id: 'movements', label: 'Stock Movements', icon: History },
          { id: 'allocations', label: 'Allocations', icon: ClipboardList },
          { id: 'backorders', label: 'Backorders', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              icon={Icon}
              onClick={() => setSearchParams(tab.id === 'stock' ? {} : { tab: tab.id })}
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
                placeholder="Search by SKU, product, warehouse, or bin..."
              />
            </div>
            {activeTab === 'stock' && (
              <FilterBar
                filters={[
                  {
                    id: 'warehouse',
                    label: 'Warehouse',
                    value: warehouseFilter,
                    onChange: setWarehouseFilter,
                    options: warehouses.map((warehouse) => ({ label: warehouse, value: warehouse }))
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    value: categoryFilter,
                    onChange: setCategoryFilter,
                    options: categories.map((category) => ({ label: category, value: category }))
                  },
                  {
                    id: 'stock',
                    label: 'Stock Status',
                    value: stockFilter,
                    onChange: setStockFilter,
                    options: [
                      { label: 'In Stock', value: 'In Stock' },
                      { label: 'Low Stock', value: 'Low Stock' },
                      { label: 'Out of Stock', value: 'Out of Stock' }
                    ]
                  }
                ]}
                hasActiveFilters={warehouseFilter !== 'ALL' || categoryFilter !== 'ALL' || stockFilter !== 'ALL' || searchTerm !== ''}
                onReset={resetFilters}
              />
            )}
          </div>

          {activeTab === 'movements' ? (
            <DataTable columns={movementColumns} data={filteredStockMovements} emptyMessage="No stock movements found." />
          ) : activeTab === 'allocations' ? (
            <DataTable columns={allocationColumns} data={filteredAllocationRows} emptyMessage="No allocations found." />
          ) : activeTab === 'backorders' ? (
            <DataTable columns={allocationColumns} data={filteredBackorderRows} emptyMessage="No active backorders in the current workspace." />
          ) : (
            <DataTable columns={columns} data={filteredInventory} emptyMessage="No inventory rows match the selected filters." />
          )}
        </div>
      </Card>

      {adjustModalItem && (
        <Modal
          isOpen={Boolean(adjustModalItem)}
          onClose={() => setAdjustModalItem(null)}
          title={`Adjust ${adjustModalItem.sku}`}
          subtitle="Inventory adjustment for on-hand and reserved stock review."
          size="md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{adjustModalItem.productName}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {adjustModalItem.warehouseName} - Bin {adjustModalItem.locationBin || adjustModalItem.location || 'Unassigned'}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="font-bold uppercase tracking-wide text-slate-500">Current</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900">{adjustModalItem.onHand.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-bold uppercase tracking-wide text-slate-500">Reserved</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900">{adjustModalItem.reserved.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-bold uppercase tracking-wide text-slate-500">New Available</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                    {Math.max(0, adjustQty - adjustModalItem.reserved).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="New Physical On-Hand Count"
              type="number"
              min={0}
              required
              value={adjustQty}
              onChange={(event) => setAdjustQty(parseInt(event.target.value, 10) || 0)}
            />

            <Select
              label="Adjustment Reason"
              value={adjustReason}
              onChange={(event) => setAdjustReason(event.target.value)}
              options={[
                { label: 'Cycle Count Adjustment', value: 'Cycle Count Adjustment' },
                { label: 'Inbound Purchase Receipt', value: 'Inbound Purchase Receipt' },
                { label: 'Damaged Stock Write-Off', value: 'Damaged Stock Write-Off' },
                { label: 'Manual Reservation Correction', value: 'Manual Reservation Correction' }
              ]}
            />

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdjustModalItem(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
