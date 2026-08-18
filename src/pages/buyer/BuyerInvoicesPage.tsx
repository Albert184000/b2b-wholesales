import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Eye,
  Receipt,
  Search,
  WalletCards
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  FilterBar,
  Input,
  KPICard,
  PageHeader,
  Pagination,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import {
  getCreditAvailable,
  getInvoiceBalance,
  getInvoicePaidAmount,
  getInvoiceTotal,
  isInvoiceDueSoon,
  isInvoiceOverdue
} from '../../utils/financeLogistics';

const pageSize = 5;

export const BuyerInvoicesPage: React.FC = () => {
  const { invoices, currentBuyer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dueFilter, setDueFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const invoiceSummary = useMemo(() => {
    const openInvoices = invoices.filter((invoice) => !['Paid', 'Cancelled', 'Draft'].includes(invoice.status));
    const totalOutstanding = openInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
    const dueSoon = invoices
      .filter((invoice) => isInvoiceDueSoon(invoice, undefined, 7) || invoice.status === 'Due Soon')
      .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
    const overdue = invoices
      .filter((invoice) => invoice.status === 'Overdue' || isInvoiceOverdue(invoice))
      .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
    const paidThisMonth = invoices.reduce(
      (sum, invoice) =>
        sum +
        (invoice.payments || [])
          .filter((payment) => payment.status === 'Completed' && payment.date.startsWith('2026-08'))
          .reduce((paymentSum, payment) => paymentSum + payment.amount, 0),
      0
    );

    return {
      totalOutstanding,
      dueSoon,
      overdue,
      paidThisMonth,
      availableCredit: getCreditAvailable(currentBuyer.creditLimit, currentBuyer.usedCredit)
    };
  }, [currentBuyer.creditLimit, currentBuyer.usedCredit, invoices]);

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const searchable = [
        invoice.id,
        invoice.invoiceNumber,
        invoice.poNumber,
        invoice.poId,
        invoice.contractNumber,
        invoice.companyName
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
      const matchesDue =
        dueFilter === 'ALL' ||
        (dueFilter === 'DUE_7' && isInvoiceDueSoon(invoice, undefined, 7)) ||
        (dueFilter === 'DUE_14' && isInvoiceDueSoon(invoice, undefined, 14)) ||
        (dueFilter === 'OVERDUE' && (invoice.status === 'Overdue' || isInvoiceOverdue(invoice)));
      const matchesFrom = !dateFrom || invoice.issueDate >= dateFrom;
      const matchesTo = !dateTo || invoice.issueDate <= dateTo;

      return matchesSearch && matchesStatus && matchesDue && matchesFrom && matchesTo;
    });
  }, [dateFrom, dateTo, dueFilter, invoices, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPageSafe - 1) * pageSize,
    currentPageSafe * pageSize
  );

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDueFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice',
      header: 'Invoice Number',
      accessor: (invoice) => (
        <div className="min-w-[170px]">
          <Link
            to={`/buyer/invoices/${invoice.id}`}
            className="font-mono font-bold text-blue-700 hover:text-blue-900"
          >
            {invoice.invoiceNumber || invoice.id.toUpperCase()}
          </Link>
          <div className="mt-0.5 text-[11px] text-slate-500">{invoice.companyName}</div>
        </div>
      )
    },
    {
      key: 'po',
      header: 'PO Number',
      accessor: (invoice) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {invoice.poNumber || invoice.poId || 'N/A'}
        </span>
      )
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      accessor: (invoice) => <span className="font-semibold text-slate-700">{invoice.issueDate}</span>
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      accessor: (invoice) => (
        <div>
          <div className="font-semibold text-slate-900">{invoice.dueDate}</div>
          {(invoice.status === 'Overdue' || isInvoiceOverdue(invoice)) && (
            <div className="text-[11px] font-bold text-rose-600">Past due</div>
          )}
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      accessor: (invoice) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(getInvoiceTotal(invoice), invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'paid',
      header: 'Paid',
      align: 'right',
      accessor: (invoice) => (
        <span className="font-mono font-semibold text-emerald-700">
          {formatCurrency(getInvoicePaidAmount(invoice), invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      accessor: (invoice) => (
        <span className="font-mono font-extrabold text-blue-700">
          {formatCurrency(getInvoiceBalance(invoice), invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'terms',
      header: 'Payment Terms',
      accessor: (invoice) => <span className="text-xs font-semibold text-slate-600">{invoice.paymentTerms}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (invoice) => <StatusBadge status={invoice.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (invoice) => (
        <Link to={`/buyer/invoices/${invoice.id}`}>
          <Button variant="outline" size="xs" icon={Eye}>
            View
          </Button>
        </Link>
      )
    }
  ];

  const hasActiveFilters =
    searchTerm !== '' || statusFilter !== 'ALL' || dueFilter !== 'ALL' || dateFrom !== '' || dateTo !== '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Credit"
        subtitle="Manage wholesale invoice balances, due dates, payment history, and available buyer credit."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Invoices' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard
          title="Total Outstanding"
          value={formatCurrency(invoiceSummary.totalOutstanding)}
          subtext="Open issued balances"
          icon={Receipt}
        />
        <KPICard
          title="Due Soon"
          value={formatCurrency(invoiceSummary.dueSoon)}
          subtext="Due within 7 days"
          icon={CalendarClock}
          badge="Watch"
          badgeVariant="amber"
        />
        <KPICard
          title="Overdue"
          value={formatCurrency(invoiceSummary.overdue)}
          subtext="Needs finance follow-up"
          icon={AlertTriangle}
          badge="Action"
          badgeVariant="danger"
        />
        <KPICard
          title="Paid This Month"
          value={formatCurrency(invoiceSummary.paidThisMonth)}
          subtext="Recorded bank transfers"
          icon={CheckCircle2}
          badge="Aug 2026"
          badgeVariant="success"
        />
        <KPICard
          title="Available Credit"
          value={formatCurrency(invoiceSummary.availableCredit)}
          subtext={currentBuyer.paymentTerms}
          icon={WalletCards}
        />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                placeholder="Search invoice, PO, contract, or company..."
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px]">
              <Input
                label="Issue From"
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setCurrentPage(1);
                }}
              />
              <Input
                label="Issue To"
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
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
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Issued', value: 'Issued' },
                  { label: 'Due Soon', value: 'Due Soon' },
                  { label: 'Partially Paid', value: 'Partially Paid' },
                  { label: 'Paid', value: 'Paid' },
                  { label: 'Overdue', value: 'Overdue' },
                  { label: 'Cancelled', value: 'Cancelled' }
                ]
              },
              {
                id: 'due',
                label: 'Due Date',
                value: dueFilter,
                onChange: (value) => {
                  setDueFilter(value);
                  setCurrentPage(1);
                },
                options: [
                  { label: 'Due in 7 days', value: 'DUE_7' },
                  { label: 'Due in 14 days', value: 'DUE_14' },
                  { label: 'Overdue', value: 'OVERDUE' }
                ]
              }
            ]}
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
            extraActions={
              <Button variant="outline" size="xs" icon={CreditCard}>
                Credit Summary
              </Button>
            }
          />
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState
              icon={Search}
              title="No invoices found"
              description="Try adjusting the invoice search, status, due-date, or issue-date filters."
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4 pt-0">
            <DataTable columns={columns} data={paginatedInvoices} compact />
            <Pagination
              currentPage={currentPageSafe}
              totalPages={totalPages}
              totalItems={filteredInvoices.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
