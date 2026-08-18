import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, Eye, FileMinus, Receipt, Search } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  FilterBar,
  KPICard,
  PageHeader,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Invoice, Payment } from '../../types';
import { getInvoiceBalance, getInvoicePaidAmount, getInvoiceTotal } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

interface PaymentRow extends Payment {
  buyerName?: string;
  invoiceNumber?: string;
}

const creditNotes = [
  {
    id: 'CN-2026-004',
    invoiceNumber: 'INV-2026-0108',
    buyerName: 'ABC Technology Ltd.',
    reason: 'Freight service adjustment',
    amount: 180,
    status: 'Issued',
    date: '2026-08-18'
  },
  {
    id: 'CN-2026-003',
    invoiceNumber: 'INV-2026-0097',
    buyerName: 'Mekong Retail Corp.',
    reason: 'Damaged carton allowance',
    amount: 420,
    status: 'Pending Approval',
    date: '2026-08-14'
  }
];

export const AdminInvoicesPage: React.FC = () => {
  const { invoices, updateInvoiceStatus, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'invoices';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const invoiceTotal = invoices.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
  const paidTotal = invoices.reduce((sum, invoice) => sum + getInvoicePaidAmount(invoice), 0);
  const balanceTotal = invoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const overdueCount = invoices.filter((invoice) => invoice.status === 'Overdue').length;

  const paymentRows: PaymentRow[] = useMemo(
    () =>
      invoices.flatMap((invoice) =>
        (invoice.payments || []).map((payment) => ({
          ...payment,
          buyerName: invoice.companyName || invoice.buyerName,
          invoiceNumber: invoice.invoiceNumber || invoice.id
        }))
      ),
    [invoices]
  );

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchTerm.trim().toLowerCase();
    const matchSearch =
      query === '' ||
      (invoice.invoiceNumber || invoice.id).toLowerCase().includes(query) ||
      (invoice.companyName || invoice.buyerName || '').toLowerCase().includes(query) ||
      (invoice.poNumber || invoice.poId || '').toLowerCase().includes(query);
    const matchStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPayments = paymentRows.filter((payment) => {
    const query = searchTerm.trim().toLowerCase();
    return (
      query === '' ||
      (payment.paymentId || payment.id).toLowerCase().includes(query) ||
      (payment.invoiceNumber || '').toLowerCase().includes(query) ||
      (payment.buyerName || '').toLowerCase().includes(query) ||
      payment.reference.toLowerCase().includes(query)
    );
  });

  const filteredCreditNotes = creditNotes.filter((note) => {
    const query = searchTerm.trim().toLowerCase();
    return (
      query === '' ||
      note.id.toLowerCase().includes(query) ||
      note.invoiceNumber.toLowerCase().includes(query) ||
      note.buyerName.toLowerCase().includes(query) ||
      note.reason.toLowerCase().includes(query)
    );
  });

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoice',
      header: 'Invoice / PO',
      accessor: (invoice) => (
        <div className="min-w-[190px]">
          <Link to={`/admin/invoices/${invoice.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
            {invoice.invoiceNumber || invoice.id.toUpperCase()}
          </Link>
          <div className="text-[11px] text-slate-500">PO {invoice.poNumber || invoice.poId || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (invoice) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{invoice.companyName || invoice.buyerName}</div>
          <div className="text-[11px] text-slate-500">{invoice.buyerId}</div>
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      accessor: (invoice) => <span className="font-mono font-bold text-slate-900">{formatCurrency(getInvoiceTotal(invoice), invoice.currency || 'USD')}</span>
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      accessor: (invoice) => <span className="font-mono font-bold text-rose-700">{formatCurrency(getInvoiceBalance(invoice), invoice.currency || 'USD')}</span>
    },
    {
      key: 'due',
      header: 'Due Date',
      accessor: (invoice) => <span className="font-semibold text-slate-700">{invoice.dueDate}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (invoice) => <StatusBadge status={invoice.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (invoice) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to={`/admin/invoices/${invoice.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>
          {getInvoiceBalance(invoice) > 0 && (
            <Button
              variant="success"
              size="xs"
              icon={CheckCircle2}
              onClick={() => {
                updateInvoiceStatus(invoice.id, 'Paid', getInvoiceTotal(invoice));
                showToast(`${invoice.invoiceNumber || invoice.id} marked paid.`, 'success');
              }}
            >
              Paid
            </Button>
          )}
        </div>
      )
    }
  ];

  const paymentColumns: Column<PaymentRow>[] = [
    {
      key: 'payment',
      header: 'Payment',
      accessor: (payment) => (
        <div className="min-w-[190px]">
          <div className="font-mono font-bold text-blue-700">{payment.paymentId || payment.id}</div>
          <div className="text-xs text-slate-500">{payment.reference}</div>
        </div>
      )
    },
    { key: 'invoice', header: 'Invoice', accessor: (payment) => <span className="font-mono font-semibold text-slate-800">{payment.invoiceNumber}</span> },
    { key: 'buyer', header: 'Buyer', accessor: (payment) => <span className="font-semibold text-slate-900">{payment.buyerName}</span> },
    { key: 'date', header: 'Date', accessor: (payment) => <span className="text-slate-700">{payment.date}</span> },
    { key: 'amount', header: 'Amount', align: 'right', accessor: (payment) => <span className="font-mono font-bold text-slate-900">{formatCurrency(payment.amount)}</span> },
    { key: 'status', header: 'Status', accessor: (payment) => <StatusBadge status={payment.status} size="sm" /> }
  ];

  const creditColumns: Column<(typeof creditNotes)[number]>[] = [
    { key: 'note', header: 'Credit Note', accessor: (note) => <span className="font-mono font-bold text-blue-700">{note.id}</span> },
    { key: 'invoice', header: 'Invoice', accessor: (note) => <span className="font-mono text-slate-800">{note.invoiceNumber}</span> },
    { key: 'buyer', header: 'Buyer', accessor: (note) => <span className="font-semibold text-slate-900">{note.buyerName}</span> },
    { key: 'reason', header: 'Reason', accessor: (note) => <span className="text-slate-700">{note.reason}</span> },
    { key: 'amount', header: 'Amount', align: 'right', accessor: (note) => <span className="font-mono font-bold text-slate-900">{formatCurrency(note.amount)}</span> },
    { key: 'status', header: 'Status', accessor: (note) => <StatusBadge status={note.status} size="sm" /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Management"
        subtitle="Manage tax invoices, payments, credit notes, reconciliation status, and accounts receivable exposure."
        breadcrumbs={[
          { label: 'Finance', href: '/admin/dashboard' },
          { label: 'Invoices' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Invoice Total" value={formatCurrency(invoiceTotal)} subtext={`${invoices.length} invoices`} icon={Receipt} />
        <KPICard title="Paid" value={formatCurrency(paidTotal)} subtext="Completed payments" icon={CreditCard} />
        <KPICard title="Open Balance" value={formatCurrency(balanceTotal)} subtext="Accounts receivable" icon={Search} />
        <KPICard title="Overdue" value={overdueCount} subtext="Requires finance review" icon={FileMinus} badge={overdueCount ? 'Review' : undefined} badgeVariant="danger" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'invoices', label: 'Invoices', icon: Receipt },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'credit-notes', label: 'Credit Notes', icon: FileMinus }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              icon={Icon}
              onClick={() => setSearchParams(tab.id === 'invoices' ? {} : { tab: tab.id })}
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
                placeholder="Search invoice, payment, buyer, PO, or credit note..."
              />
            </div>
            {activeTab === 'invoices' && (
              <FilterBar
                filters={[
                  {
                    id: 'status',
                    label: 'Status',
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: [
                      { label: 'Issued', value: 'Issued' },
                      { label: 'Unpaid', value: 'Unpaid' },
                      { label: 'Partially Paid', value: 'Partially Paid' },
                      { label: 'Paid', value: 'Paid' },
                      { label: 'Overdue', value: 'Overdue' }
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

          {activeTab === 'payments' ? (
            <DataTable columns={paymentColumns} data={filteredPayments} emptyMessage="No payments match the current search." />
          ) : activeTab === 'credit-notes' ? (
            <DataTable columns={creditColumns} data={filteredCreditNotes} emptyMessage="No credit notes match the current search." />
          ) : (
            <DataTable columns={invoiceColumns} data={filteredInvoices} emptyMessage="No invoices match the selected filters." />
          )}
        </div>
      </Card>
    </div>
  );
};
