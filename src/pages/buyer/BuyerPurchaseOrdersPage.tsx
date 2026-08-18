import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FileSpreadsheet, PackageCheck, PlusCircle, ShoppingBag } from 'lucide-react';
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
import { PurchaseOrder } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { getDaysUntil, getPONumber, getPOTotal } from '../../utils/poContract';

const PAGE_SIZE = 6;

const statusOptions = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Processing',
  'Stock Allocated',
  'Partially Shipped',
  'Fully Shipped',
  'Completed',
  'Cancelled'
].map((status) => ({ label: status, value: status }));

const dateOptions = [
  { label: 'Created this week', value: 'THIS_WEEK' },
  { label: 'Due in 30 days', value: 'DUE_30' },
  { label: 'Past due delivery', value: 'PAST_DUE' }
];

export const BuyerPurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { purchaseOrders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPOs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return purchaseOrders
      .filter((po) => {
        const haystack = [
          po.id,
          po.poNumber,
          po.quoteId,
          po.quoteNumber,
          po.buyerPoReference,
          po.items.map((item) => `${item.sku} ${item.productName}`).join(' ')
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const matchSearch = !normalizedSearch || haystack.includes(normalizedSearch);
        const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
        const daysFromOrder = getDaysUntil(po.orderDate);
        const daysUntilDelivery = getDaysUntil(po.expectedDeliveryDate || po.requestedDeliveryDate);
        const matchDate =
          dateFilter === 'ALL' ||
          (dateFilter === 'THIS_WEEK' && daysFromOrder !== null && daysFromOrder <= 0 && daysFromOrder >= -7) ||
          (dateFilter === 'DUE_30' &&
            daysUntilDelivery !== null &&
            daysUntilDelivery >= 0 &&
            daysUntilDelivery <= 30) ||
          (dateFilter === 'PAST_DUE' &&
            daysUntilDelivery !== null &&
            daysUntilDelivery < 0 &&
            po.status !== 'Completed');

        return matchSearch && matchStatus && matchDate;
      })
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (sortBy === 'total') return (getPOTotal(a) - getPOTotal(b)) * direction;
        if (sortBy === 'status') return a.status.localeCompare(b.status) * direction;
        if (sortBy === 'delivery') {
          return (a.expectedDeliveryDate || '').localeCompare(b.expectedDeliveryDate || '') * direction;
        }
        return (a.orderDate || '').localeCompare(b.orderDate || '') * direction;
      });
  }, [dateFilter, purchaseOrders, searchTerm, sortBy, sortDirection, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPOs.length / PAGE_SIZE));
  const pagedPOs = filteredPOs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pendingCount = purchaseOrders.filter((po) => po.status === 'Pending Approval').length;
  const processingCount = purchaseOrders.filter((po) => ['Approved', 'Processing', 'Stock Allocated'].includes(po.status)).length;
  const partiallyShippedCount = purchaseOrders.filter((po) => po.status === 'Partially Shipped').length;
  const completedCount = purchaseOrders.filter((po) => po.status === 'Completed').length;

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDirection('desc');
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO Number',
      sortable: true,
      accessor: (po) => (
        <div className="min-w-[180px]">
          <span className="block font-mono text-xs font-bold text-blue-600">{getPONumber(po)}</span>
          <span className="block truncate text-[11px] text-slate-500">{po.buyerPoReference || 'Buyer ref pending'}</span>
        </div>
      )
    },
    {
      key: 'quote',
      header: 'Quote Reference',
      accessor: (po) => (
        <Link to={`/buyer/quotes/${po.quoteId}`} className="font-mono text-xs font-bold text-blue-700 hover:underline">
          {po.quoteNumber || po.quoteId || 'N/A'}
        </Link>
      )
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      sortable: true,
      accessor: (po) => <span className="font-semibold text-slate-700">{po.orderDate}</span>
    },
    {
      key: 'products',
      header: 'Products',
      accessor: (po) => (
        <div className="min-w-[180px] text-sm">
          <div className="font-bold text-slate-900">{po.items.length} SKU{po.items.length === 1 ? '' : 's'}</div>
          <div className="text-xs text-slate-500">
            {po.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} units
          </div>
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total Amount',
      align: 'right',
      sortable: true,
      accessor: (po) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{formatCurrency(getPOTotal(po), po.currency || 'USD')}</div>
          <div className="text-[11px] text-slate-500">{po.currency || 'USD'}</div>
        </div>
      )
    },
    {
      key: 'terms',
      header: 'Payment Terms',
      accessor: (po) => <span className="text-xs font-semibold text-slate-700">{po.paymentTerms}</span>
    },
    {
      key: 'delivery',
      header: 'Required Delivery',
      sortable: true,
      accessor: (po) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{po.requestedDeliveryDate || po.expectedDeliveryDate}</div>
          <div className="text-slate-500">Expected {po.expectedDeliveryDate}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (po) => <StatusBadge status={po.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (po) => (
        <Link to={`/buyer/purchase-orders/${po.id}`} onClick={(event) => event.stopPropagation()}>
          <Button variant="outline" size="xs" icon={ArrowRight} iconPosition="right">
            View
          </Button>
        </Link>
      )
    }
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage buyer POs, approval state, stock allocation, and related contracts."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Purchase Orders' }
        ]}
        actions={
          <Link to="/buyer/purchase-orders/new">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Create PO
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard title="Total POs" value={purchaseOrders.length} icon={ShoppingBag} />
        <KPICard title="Pending Approval" value={pendingCount} icon={Clock3} badge="Review" badgeVariant="amber" />
        <KPICard title="Processing" value={processingCount} icon={PackageCheck} />
        <KPICard title="Partially Shipped" value={partiallyShippedCount} icon={PackageCheck} badge="Open" badgeVariant="amber" />
        <KPICard title="Completed" value={completedCount} icon={CheckCircle2} badge="Closed" badgeVariant="success" />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="min-w-0 flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Search PO, quote, buyer reference, SKU, or product..."
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
                options: statusOptions
              },
              {
                id: 'date',
                label: 'Date',
                value: dateFilter,
                onChange: (value) => {
                  setDateFilter(value);
                  setCurrentPage(1);
                },
                options: dateOptions
              }
            ]}
            hasActiveFilters={statusFilter !== 'ALL' || dateFilter !== 'ALL' || searchTerm !== ''}
            onReset={resetFilters}
          />
        </div>

        {purchaseOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No purchase orders yet."
            description="Start from an accepted quote or browse products to build a new RFQ."
            actionText="View Accepted Quotes"
            actionIcon={FileSpreadsheet}
            onAction={() => navigate('/buyer/quotes?status=Accepted')}
          />
        ) : filteredPOs.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No purchase orders match your filters"
            description="Clear filters or search for another PO reference."
            actionText="Reset Filters"
            onAction={resetFilters}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagedPOs}
              keyExtractor={(po) => po.id}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={(po) => navigate(`/buyer/purchase-orders/${po.id}`)}
            />
            <Pagination
              currentPage={Math.min(currentPage, totalPages)}
              totalPages={totalPages}
              totalItems={filteredPOs.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </div>
  );
};
