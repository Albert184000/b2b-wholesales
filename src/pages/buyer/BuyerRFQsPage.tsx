import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock3, FileQuestion, PlusCircle, SearchCheck } from 'lucide-react';
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
import { RFQ } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import {
  getDaysUntilDate,
  getRfqNumber,
  getRfqTargetBudget,
  getRfqTotalQuantity
} from '../../utils/rfqQuote';

const PAGE_SIZE = 5;

const statusOptions = [
  'Draft',
  'Submitted',
  'Under Review',
  'Quoted',
  'Negotiating',
  'Accepted',
  'Rejected',
  'Expired'
].map((status) => ({ label: status, value: status }));

const dateOptions = [
  { label: 'Created this week', value: 'THIS_WEEK' },
  { label: 'Expiring soon', value: 'EXPIRING_SOON' },
  { label: 'Expired only', value: 'EXPIRED' }
];

export const BuyerRFQsPage: React.FC = () => {
  const navigate = useNavigate();
  const { rfqs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredRfqs = useMemo(() => {
    return rfqs.filter((rfq) => {
      const haystack = [
        rfq.id,
        rfq.rfqNumber,
        rfq.projectTitle,
        rfq.companyName,
        rfq.items.map((item) => `${item.sku} ${item.productName}`).join(' ')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchStatus = statusFilter === 'ALL' || rfq.status === statusFilter;
      const daysFromCreated = getDaysUntilDate(rfq.createdAt || rfq.createdDate);
      const daysUntilExpiry = getDaysUntilDate(rfq.expiryDate);
      const matchDate =
        dateFilter === 'ALL' ||
        (dateFilter === 'THIS_WEEK' &&
          daysFromCreated !== null &&
          daysFromCreated <= 0 &&
          daysFromCreated >= -7) ||
        (dateFilter === 'EXPIRING_SOON' &&
          daysUntilExpiry !== null &&
          daysUntilExpiry >= 0 &&
          daysUntilExpiry <= 7) ||
        (dateFilter === 'EXPIRED' &&
          (rfq.status === 'Expired' || (daysUntilExpiry !== null && daysUntilExpiry < 0)));

      return matchSearch && matchStatus && matchDate;
    });
  }, [dateFilter, normalizedSearch, rfqs, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRfqs.length / PAGE_SIZE));
  const pagedRfqs = filteredRfqs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCount = rfqs.filter((rfq) =>
    ['Submitted', 'Under Review', 'Quoted', 'Negotiating'].includes(rfq.status)
  ).length;
  const quotedCount = rfqs.filter((rfq) => rfq.status === 'Quoted' || rfq.status === 'Negotiating').length;
  const expiringCount = rfqs.filter((rfq) => {
    const days = getDaysUntilDate(rfq.expiryDate);
    return days !== null && days >= 0 && days <= 7 && rfq.status !== 'Accepted';
  }).length;
  const targetPipeline = rfqs.reduce((sum, rfq) => sum + getRfqTargetBudget(rfq), 0);

  const columns: Column<RFQ>[] = [
    {
      key: 'rfq',
      header: 'RFQ & Project',
      accessor: (rfq) => (
        <div className="min-w-[220px]">
          <span className="block font-mono text-xs font-bold text-blue-600">{getRfqNumber(rfq)}</span>
          <span className="block max-w-sm truncate font-semibold text-slate-900">
            {rfq.projectTitle || 'Wholesale procurement request'}
          </span>
          <span className="mt-0.5 block text-[11px] text-slate-500">
            {rfq.items.length} SKU{rfq.items.length === 1 ? '' : 's'} /{' '}
            {getRfqTotalQuantity(rfq).toLocaleString()} units
          </span>
        </div>
      )
    },
    {
      key: 'target',
      header: 'Target Value',
      align: 'right',
      accessor: (rfq) => (
        <div className="font-mono font-bold text-slate-900">
          {formatCurrency(getRfqTargetBudget(rfq), rfq.currency || 'USD')}
        </div>
      )
    },
    {
      key: 'created',
      header: 'Created',
      accessor: (rfq) => (
        <div className="text-xs text-slate-600">
          <div className="font-semibold text-slate-800">{rfq.createdAt || rfq.createdDate}</div>
          <div>Need by {rfq.requiredDeliveryDate || 'TBD'}</div>
        </div>
      )
    },
    {
      key: 'expiry',
      header: 'Expiry',
      accessor: (rfq) => {
        const days = getDaysUntilDate(rfq.expiryDate);
        const isExpired = rfq.status === 'Expired' || (days !== null && days < 0);
        return (
          <div className={isExpired ? 'font-semibold text-rose-700' : 'text-slate-600'}>
            <div>{rfq.expiryDate || 'Not set'}</div>
            {days !== null && !isExpired && (
              <div className="text-[11px] text-slate-500">
                {days === 0 ? 'Today' : `${days} days left`}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (rfq) => <StatusBadge status={rfq.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (rfq) => (
        <Link to={`/buyer/rfqs/${rfq.id}`} onClick={(event) => event.stopPropagation()}>
          <Button variant="outline" size="xs" icon={ArrowRight} iconPosition="right">
            Open
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
        title="My RFQs"
        subtitle="Track wholesale quote requests, review lifecycle status, and continue negotiations."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'My RFQs' }
        ]}
        actions={
          <Link to="/buyer/rfqs/new">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              New RFQ
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Open RFQs" value={openCount} icon={FileQuestion} subtext="Submitted through negotiating" />
        <KPICard title="Quoted" value={quotedCount} icon={SearchCheck} subtext="Ready for buyer review" />
        <KPICard title="Expiring Soon" value={expiringCount} icon={Clock3} badge="7 days" badgeVariant="amber" />
        <KPICard title="Target Pipeline" value={formatCurrency(targetPipeline)} subtext="All RFQ target budgets" />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="min-w-0 flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Search by RFQ, project, SKU, or product..."
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

        {filteredRfqs.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No RFQs found"
            description="Adjust the filters or create a new wholesale request for quotation."
            actionText="Create RFQ"
            actionIcon={PlusCircle}
            onAction={() => navigate('/buyer/rfqs/new')}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagedRfqs}
              keyExtractor={(rfq) => rfq.id}
              onRowClick={(rfq) => navigate(`/buyer/rfqs/${rfq.id}`)}
            />
            <Pagination
              currentPage={Math.min(currentPage, totalPages)}
              totalPages={totalPages}
              totalItems={filteredRfqs.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </div>
  );
};
