import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FileSpreadsheet, MessageSquare } from 'lucide-react';
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
import { QuoteExpiryNotice } from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { Quote } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import {
  getDaysUntilDate,
  getQuoteExpiryState,
  getQuoteNumber,
  getQuoteTotal
} from '../../utils/rfqQuote';

const PAGE_SIZE = 5;

const statusOptions = [
  'Sent',
  'Quoted',
  'Viewed',
  'Negotiating',
  'Pending Manager Approval',
  'Accepted',
  'Rejected',
  'Expired'
].map((status) => ({ label: status, value: status }));

const validityOptions = [
  { label: 'Expiring soon', value: 'EXPIRING_SOON' },
  { label: 'Expired only', value: 'EXPIRED' },
  { label: 'Valid quotes', value: 'VALID' }
];

export const BuyerQuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { quotes } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [validityFilter, setValidityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const haystack = [
        quote.id,
        quote.quoteNumber,
        quote.rfqId,
        quote.rfqNumber,
        quote.items.map((item) => `${item.sku} ${item.productName}`).join(' ')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const expiry = getQuoteExpiryState(quote);
      const matchSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchStatus = statusFilter === 'ALL' || quote.status === statusFilter;
      const matchValidity =
        validityFilter === 'ALL' ||
        (validityFilter === 'EXPIRING_SOON' && expiry.isExpiringSoon) ||
        (validityFilter === 'EXPIRED' && expiry.isExpired) ||
        (validityFilter === 'VALID' && !expiry.isExpired);

      return matchSearch && matchStatus && matchValidity;
    });
  }, [normalizedSearch, quotes, statusFilter, validityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / PAGE_SIZE));
  const pagedQuotes = filteredQuotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeQuotes = quotes.filter((quote) =>
    ['Sent', 'Quoted', 'Viewed', 'Negotiating', 'Pending Manager Approval'].includes(quote.status)
  );
  const acceptedQuotes = quotes.filter((quote) => quote.status === 'Accepted');
  const expiringSoon = quotes.filter((quote) => getQuoteExpiryState(quote).isExpiringSoon);
  const quotePipeline = activeQuotes.reduce((sum, quote) => sum + getQuoteTotal(quote), 0);

  const columns: Column<Quote>[] = [
    {
      key: 'quote',
      header: 'Quote',
      accessor: (quote) => (
        <div className="min-w-[220px]">
          <span className="block font-mono text-xs font-bold text-blue-600">{getQuoteNumber(quote)}</span>
          <span className="block text-[11px] text-slate-500">RFQ {quote.rfqNumber || quote.rfqId}</span>
          <span className="mt-0.5 block max-w-xs truncate text-xs font-semibold text-slate-700">
            {quote.items[0]?.productName || 'Wholesale quote'}
          </span>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      accessor: (quote) => (
        <div className="text-sm">
          <div className="font-bold text-slate-900">{quote.items.length} SKU{quote.items.length === 1 ? '' : 's'}</div>
          <div className="text-xs text-slate-500">
            {quote.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} units
          </div>
        </div>
      )
    },
    {
      key: 'total',
      header: 'Quote Total',
      align: 'right',
      accessor: (quote) => (
        <div>
          <div className="font-mono font-bold text-slate-900">
            {formatCurrency(getQuoteTotal(quote), quote.currency || 'USD')}
          </div>
          <div className="text-[11px] text-slate-500">{quote.paymentTerms}</div>
        </div>
      )
    },
    {
      key: 'validity',
      header: 'Validity',
      accessor: (quote) => <QuoteExpiryNotice quote={quote} compact />
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (quote) => <StatusBadge status={quote.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (quote) => (
        <Link to={`/buyer/quotes/${quote.id}`} onClick={(event) => event.stopPropagation()}>
          <Button variant="primary" size="xs" icon={ArrowRight} iconPosition="right">
            Review
          </Button>
        </Link>
      )
    }
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setValidityFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotes"
        subtitle="Review commercial offers, negotiate counter-offers, and accept quotes before PO creation."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Quotes' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Active Quotes" value={activeQuotes.length} icon={FileSpreadsheet} subtext="Open for review" />
        <KPICard title="In Negotiation" value={quotes.filter((quote) => quote.status === 'Negotiating' || quote.status === 'Pending Manager Approval').length} icon={MessageSquare} />
        <KPICard title="Accepted" value={acceptedQuotes.length} icon={CheckCircle2} badge="Ready for PO" badgeVariant="success" />
        <KPICard title="Expiring Soon" value={expiringSoon.length} icon={Clock3} badge={formatCurrency(quotePipeline)} badgeVariant="amber" />
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
              placeholder="Search by quote, RFQ, SKU, or product..."
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
                id: 'validity',
                label: 'Validity',
                value: validityFilter,
                onChange: (value) => {
                  setValidityFilter(value);
                  setCurrentPage(1);
                },
                options: validityOptions
              }
            ]}
            hasActiveFilters={statusFilter !== 'ALL' || validityFilter !== 'ALL' || searchTerm !== ''}
            onReset={resetFilters}
          />
        </div>

        {filteredQuotes.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No quotes found"
            description="Adjust filters or wait for your account executive to issue a formal quote."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagedQuotes}
              keyExtractor={(quote) => quote.id}
              onRowClick={(quote) => navigate(`/buyer/quotes/${quote.id}`)}
            />
            <Pagination
              currentPage={Math.min(currentPage, totalPages)}
              totalPages={totalPages}
              totalItems={filteredQuotes.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </div>
  );
};
