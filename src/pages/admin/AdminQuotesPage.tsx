import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Search, Eye, Download, CheckCircle2, MessageSquare } from 'lucide-react';
import {
  Button,
  DataTable,
  Column,
  StatusBadge,
  PageHeader,
  SearchBar,
  FilterBar,
  Card
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Quote } from '../../types';

export const AdminQuotesPage: React.FC = () => {
  const { quotes, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredQuotes = quotes.filter((q) => {
    const matchSearch =
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.rfqId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<Quote>[] = [
    {
      header: 'Quote ID & RFQ',
      accessor: (q) => (
        <div>
          <Link to={`/admin/quotes/${q.id}`} className="font-mono font-bold text-blue-600 block hover:text-blue-800">
            {q.quoteNumber || q.id}
          </Link>
          <span className="text-[11px] text-slate-500">Ref: {q.rfqId}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Corporate Buyer',
      accessor: (q) => (
        <div>
          <span className="font-bold text-slate-900">{q.buyerName}</span>
          <span className="text-[11px] text-slate-400 block">{q.buyerId}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Quote Total',
      accessor: (q) => (
        <div>
          <span className="font-mono font-bold text-slate-900">
            ${q.totalAmount.toLocaleString()} USD
          </span>
          <span className="text-[10px] text-slate-400 block">{q.paymentTerms}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Validity Period',
      accessor: (q) => (
        <div className="text-slate-600 text-xs">
          <span>{q.createdAt}</span> to <span className="font-semibold text-slate-800">{q.validUntil}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Status',
      accessor: (q) => <StatusBadge status={q.status} />
    },
    {
      header: 'Action',
      accessor: (q) => (
        <Link to={`/admin/quotes/${q.id}`}>
          <Button variant="outline" size="xs" icon={Eye}>
            Inspect Quote
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Quotations & Counter-Offers"
        subtitle="Manage issued price schedules, monitor buyer counter-proposals, and track quotation win-rates"
        breadcrumbs={[
          { label: 'Sales & Procurement', href: '/admin/dashboard' },
          { label: 'Quotes' }
        ]}
      />

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search quotes by Quote ID, Buyer name, or RFQ ID..."
            />
          </div>
          <FilterBar
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'Quoted', value: 'Quoted' },
                  { label: 'Negotiating', value: 'Negotiating' },
                  { label: 'Accepted', value: 'Accepted' },
                  { label: 'Rejected', value: 'Rejected' },
                  { label: 'Expired', value: 'Expired' }
                ]
              }
            ]}
            hasActiveFilters={statusFilter !== 'ALL' || searchTerm !== ''}
            onReset={() => {
              setStatusFilter('ALL');
              setSearchTerm('');
            }}
          />
        </div>

        <DataTable columns={columns} data={filteredQuotes} />
      </Card>
    </div>
  );
};
