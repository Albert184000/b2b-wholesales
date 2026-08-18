import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  Eye,
  PackageCheck,
  PackageOpen,
  Search,
  Truck
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  FilterBar,
  KPICard,
  PageHeader,
  Pagination,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { getShipmentProgress, getShipmentTotals } from '../../utils/financeLogistics';

const pageSize = 5;

export const BuyerShipmentsPage: React.FC = () => {
  const { shipments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const summary = useMemo(
    () => ({
      preparing: shipments.filter((shipment) => shipment.status === 'Preparing').length,
      ready: shipments.filter((shipment) => shipment.status === 'Ready').length,
      inTransit: shipments.filter((shipment) =>
        ['Dispatched', 'In Transit', 'Out for Delivery'].includes(shipment.status)
      ).length,
      partiallyDelivered: shipments.filter((shipment) => shipment.status === 'Partially Delivered').length,
      delivered: shipments.filter((shipment) => shipment.status === 'Delivered').length
    }),
    [shipments]
  );

  const filteredShipments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const searchable = [
        shipment.id,
        shipment.shipmentNumber,
        shipment.poNumber,
        shipment.poId,
        shipment.warehouseName,
        shipment.carrier,
        shipment.trackingNumber,
        shipment.destinationAddress
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || shipment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, shipments, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedShipments = filteredShipments.slice(
    (currentPageSafe - 1) * pageSize,
    currentPageSafe * pageSize
  );

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const columns: Column<Shipment>[] = [
    {
      key: 'shipment',
      header: 'Shipment Number',
      accessor: (shipment) => (
        <div className="min-w-[180px]">
          <Link
            to={`/buyer/shipments/${shipment.id}`}
            className="font-mono font-bold text-blue-700 hover:text-blue-900"
          >
            {shipment.shipmentNumber || shipment.id.toUpperCase()}
          </Link>
          <div className="mt-0.5 font-mono text-[11px] text-slate-500">{shipment.trackingNumber}</div>
        </div>
      )
    },
    {
      key: 'po',
      header: 'PO Number',
      accessor: (shipment) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {shipment.poNumber || shipment.poId || 'N/A'}
        </span>
      )
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      accessor: (shipment) => (
        <div className="min-w-[180px]">
          <div className="font-semibold text-slate-900">{shipment.warehouseName || shipment.originWarehouse}</div>
          <div className="text-[11px] text-slate-500">{shipment.serviceLevel || 'Standard freight'}</div>
        </div>
      )
    },
    {
      key: 'carrier',
      header: 'Carrier',
      accessor: (shipment) => <span className="text-sm font-semibold text-slate-700">{shipment.carrier}</span>
    },
    {
      key: 'shipDate',
      header: 'Ship Date',
      accessor: (shipment) => <span className="font-semibold text-slate-700">{shipment.shipDate || 'Pending'}</span>
    },
    {
      key: 'eta',
      header: 'Estimated Delivery',
      accessor: (shipment) => <span className="font-semibold text-slate-700">{shipment.estimatedDelivery}</span>
    },
    {
      key: 'items',
      header: 'Items',
      accessor: (shipment) => {
        const totals = getShipmentTotals(shipment);
        return (
          <div className="min-w-[140px] text-xs">
            <div className="font-bold text-slate-900">{totals.shipped.toLocaleString()} shipped</div>
            <div className="text-slate-500">{totals.remaining.toLocaleString()} remaining</div>
          </div>
        );
      }
    },
    {
      key: 'progress',
      header: 'Progress',
      accessor: (shipment) => (
        <div className="min-w-[120px]">
          <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>{getShipmentProgress(shipment)}%</span>
            <span>{getShipmentTotals(shipment).delivered}/{getShipmentTotals(shipment).ordered}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.min(100, getShipmentProgress(shipment))}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (shipment) => <StatusBadge status={shipment.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (shipment) => (
        <Link to={`/buyer/shipments/${shipment.id}`}>
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
        title="Shipments"
        subtitle="Track warehouse dispatch, split deliveries, carrier milestones, and proof-of-delivery status."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Shipments' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard title="Preparing" value={summary.preparing} subtext="Packing in warehouse" icon={PackageOpen} />
        <KPICard title="Ready to Ship" value={summary.ready} subtext="Awaiting carrier pickup" icon={PackageCheck} />
        <KPICard title="In Transit" value={summary.inTransit} subtext="Carrier movement active" icon={Truck} />
        <KPICard
          title="Partially Delivered"
          value={summary.partiallyDelivered}
          subtext="Split fulfillment open"
          icon={Clock3}
          badge="Partial"
          badgeVariant="amber"
        />
        <KPICard
          title="Delivered"
          value={summary.delivered}
          subtext="POD available"
          icon={CheckCircle2}
          badge="POD"
          badgeVariant="success"
        />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                placeholder="Search shipment, PO, carrier, tracking number, or warehouse..."
              />
            </div>
            <FilterBar
              filters={[
                {
                  id: 'status',
                  label: 'Status',
                  value: statusFilter,
                  onChange: (value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  },
                  options: [
                    { label: 'Preparing', value: 'Preparing' },
                    { label: 'Ready', value: 'Ready' },
                    { label: 'Dispatched', value: 'Dispatched' },
                    { label: 'In Transit', value: 'In Transit' },
                    { label: 'Out for Delivery', value: 'Out for Delivery' },
                    { label: 'Partially Delivered', value: 'Partially Delivered' },
                    { label: 'Delivered', value: 'Delivered' },
                    { label: 'Delayed', value: 'Delayed' },
                    { label: 'Cancelled', value: 'Cancelled' }
                  ]
                }
              ]}
              hasActiveFilters={statusFilter !== 'ALL' || searchTerm !== ''}
              onReset={resetFilters}
              className="lg:w-auto"
            />
          </div>
        </div>

        {filteredShipments.length === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState
              icon={Search}
              title="No shipments found"
              description="Try changing the shipment status or search terms."
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4 pt-0">
            <DataTable columns={columns} data={paginatedShipments} compact />
            <Pagination
              currentPage={currentPageSafe}
              totalPages={totalPages}
              totalItems={filteredShipments.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
