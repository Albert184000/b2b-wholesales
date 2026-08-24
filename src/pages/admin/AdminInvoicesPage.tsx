import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, Edit, Eye, FileMinus, Plus, Receipt, Save, Search, Trash2 } from 'lucide-react';
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
  StatusBadge,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Invoice, Payment } from '../../types';
import { getInvoiceBalance, getInvoicePaidAmount, getInvoiceTotal } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

interface PaymentRow extends Payment {
  buyerName?: string;
  invoiceNumber?: string;
  isManual?: boolean;
}

interface CreditNoteRow {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  reason: string;
  amount: number;
  status: string;
  date: string;
}

interface PaymentDraft {
  invoiceId: string;
  date: string;
  method: string;
  amount: string;
  reference: string;
  status: string;
}

interface CreditNoteDraft {
  id: string;
  invoiceId: string;
  reason: string;
  amount: string;
  status: string;
}

const today = () => new Date().toISOString().split('T')[0];

const initialCreditNotes: CreditNoteRow[] = [
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

const createPaymentDraft = (invoiceId = ''): PaymentDraft => ({
  invoiceId,
  date: today(),
  method: 'Bank Transfer',
  amount: '',
  reference: `PAY-${Date.now()}`,
  status: 'Completed'
});

const createCreditNoteDraft = (invoiceId = ''): CreditNoteDraft => ({
  id: `CN-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  invoiceId,
  reason: '',
  amount: '',
  status: 'Pending Approval'
});

export const AdminInvoicesPage: React.FC = () => {
  const { invoices, updateInvoiceStatus, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'invoices';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [manualPayments, setManualPayments] = useState<PaymentRow[]>([]);
  const [creditNoteRows, setCreditNoteRows] = useState<CreditNoteRow[]>(initialCreditNotes);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<PaymentDraft>(() => createPaymentDraft(invoices[0]?.id || ''));
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);
  const [editingCreditNoteId, setEditingCreditNoteId] = useState<string | null>(null);
  const [creditNoteDraft, setCreditNoteDraft] = useState<CreditNoteDraft>(() => createCreditNoteDraft(invoices[0]?.id || ''));

  const invoiceTotal = invoices.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
  const paidTotal = invoices.reduce((sum, invoice) => sum + getInvoicePaidAmount(invoice), 0);
  const balanceTotal = invoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const overdueCount = invoices.filter((invoice) => invoice.status === 'Overdue').length;

  const paymentRows: PaymentRow[] = useMemo(
    () =>
      [
        ...manualPayments,
        ...invoices.flatMap((invoice) =>
          (invoice.payments || []).map((payment) => ({
            ...payment,
            buyerName: invoice.companyName || invoice.buyerName,
            invoiceNumber: invoice.invoiceNumber || invoice.id,
            isManual: false
          }))
        )
      ],
    [invoices, manualPayments]
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

  const filteredCreditNotes = creditNoteRows.filter((note) => {
    const query = searchTerm.trim().toLowerCase();
    return (
      query === '' ||
      note.id.toLowerCase().includes(query) ||
      note.invoiceNumber.toLowerCase().includes(query) ||
      note.buyerName.toLowerCase().includes(query) ||
      note.reason.toLowerCase().includes(query)
    );
  });

  const openPaymentModal = (payment?: PaymentRow, invoiceId?: string) => {
    if (payment) {
      setEditingPaymentId(payment.id);
      const invoice = invoices.find((item) => (item.invoiceNumber || item.id) === payment.invoiceNumber || item.id === payment.invoiceId);
      setPaymentDraft({
        invoiceId: invoice?.id || payment.invoiceId,
        date: payment.date,
        method: payment.method,
        amount: String(payment.amount),
        reference: payment.reference,
        status: payment.status
      });
    } else {
      setEditingPaymentId(null);
      setPaymentDraft(createPaymentDraft(invoiceId || invoices[0]?.id || ''));
    }
    setPaymentModalOpen(true);
  };

  const savePayment = (event: React.FormEvent) => {
    event.preventDefault();
    const invoice = invoices.find((item) => item.id === paymentDraft.invoiceId);
    const amount = Number(paymentDraft.amount);

    if (!invoice || !Number.isFinite(amount) || amount <= 0) {
      showToast('Select an invoice and enter a valid payment amount.', 'error');
      return;
    }

    const buyerName = invoice.companyName || invoice.buyerName || 'Unassigned buyer';
    const invoiceNumber = invoice.invoiceNumber || invoice.id;
    const paymentRecord: PaymentRow = {
      id: editingPaymentId || `pay-${Date.now()}`,
      paymentId: editingPaymentId || `PAY-${Date.now()}`,
      invoiceId: invoice.id,
      invoiceNumber,
      buyerName,
      date: paymentDraft.date,
      method: paymentDraft.method,
      amount,
      reference: paymentDraft.reference.trim() || `PAY-${invoiceNumber}`,
      status: paymentDraft.status,
      isManual: true
    };

    setManualPayments((current) =>
      editingPaymentId
        ? current.map((payment) => (payment.id === editingPaymentId ? paymentRecord : payment))
        : [paymentRecord, ...current]
    );

    if (!editingPaymentId && paymentRecord.status === 'Completed') {
      const paidAmount = getInvoicePaidAmount(invoice) + amount;
      const nextStatus = paidAmount >= getInvoiceTotal(invoice) ? 'Paid' : 'Partially Paid';
      updateInvoiceStatus(invoice.id, nextStatus, paidAmount);
    }

    setPaymentModalOpen(false);
    showToast(`${paymentRecord.paymentId} saved for ${invoiceNumber}.`, 'success');
  };

  const deletePayment = (payment: PaymentRow) => {
    setManualPayments((current) => current.filter((item) => item.id !== payment.id));
    showToast(`${payment.paymentId || payment.id} removed from payment ledger.`, 'warning');
  };

  const openCreditNoteModal = (note?: CreditNoteRow) => {
    if (note) {
      const invoice = invoices.find((item) => (item.invoiceNumber || item.id) === note.invoiceNumber);
      setEditingCreditNoteId(note.id);
      setCreditNoteDraft({
        id: note.id,
        invoiceId: invoice?.id || invoices[0]?.id || '',
        reason: note.reason,
        amount: String(note.amount),
        status: note.status
      });
    } else {
      setEditingCreditNoteId(null);
      setCreditNoteDraft(createCreditNoteDraft(invoices[0]?.id || ''));
    }
    setCreditNoteModalOpen(true);
  };

  const saveCreditNote = (event: React.FormEvent) => {
    event.preventDefault();
    const invoice = invoices.find((item) => item.id === creditNoteDraft.invoiceId);
    const amount = Number(creditNoteDraft.amount);

    if (!invoice || !creditNoteDraft.reason.trim() || !Number.isFinite(amount) || amount <= 0) {
      showToast('Select an invoice, reason, and valid credit amount.', 'error');
      return;
    }

    const noteRecord: CreditNoteRow = {
      id: creditNoteDraft.id.trim() || `CN-${Date.now()}`,
      invoiceNumber: invoice.invoiceNumber || invoice.id,
      buyerName: invoice.companyName || invoice.buyerName || 'Unassigned buyer',
      reason: creditNoteDraft.reason.trim(),
      amount,
      status: creditNoteDraft.status,
      date: today()
    };

    setCreditNoteRows((current) =>
      editingCreditNoteId
        ? current.map((note) => (note.id === editingCreditNoteId ? noteRecord : note))
        : [noteRecord, ...current]
    );
    setCreditNoteModalOpen(false);
    showToast(`${noteRecord.id} saved for ${noteRecord.invoiceNumber}.`, 'success');
  };

  const deleteCreditNote = (note: CreditNoteRow) => {
    setCreditNoteRows((current) => current.filter((item) => item.id !== note.id));
    showToast(`${note.id} removed from credit notes.`, 'warning');
  };

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
    { key: 'method', header: 'Method', accessor: (payment) => <span className="text-slate-700">{payment.method}</span> },
    { key: 'amount', header: 'Amount', align: 'right', accessor: (payment) => <span className="font-mono font-bold text-slate-900">{formatCurrency(payment.amount)}</span> },
    { key: 'status', header: 'Status', accessor: (payment) => <StatusBadge status={payment.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (payment) =>
        payment.isManual ? (
          <div className="flex min-w-[130px] flex-wrap items-center gap-1.5">
            <Button variant="outline" size="xs" icon={Edit} onClick={() => openPaymentModal(payment)}>
              Edit
            </Button>
            <Button variant="ghost" size="xs" icon={Trash2} onClick={() => deletePayment(payment)}>
              Delete
            </Button>
          </div>
        ) : (
          <StatusBadge status="Posted" size="sm" showDot={false} />
        )
    }
  ];

  const creditColumns: Column<CreditNoteRow>[] = [
    { key: 'note', header: 'Credit Note', accessor: (note) => <span className="font-mono font-bold text-blue-700">{note.id}</span> },
    { key: 'invoice', header: 'Invoice', accessor: (note) => <span className="font-mono text-slate-800">{note.invoiceNumber}</span> },
    { key: 'buyer', header: 'Buyer', accessor: (note) => <span className="font-semibold text-slate-900">{note.buyerName}</span> },
    { key: 'reason', header: 'Reason', accessor: (note) => <span className="text-slate-700">{note.reason}</span> },
    { key: 'amount', header: 'Amount', align: 'right', accessor: (note) => <span className="font-mono font-bold text-slate-900">{formatCurrency(note.amount)}</span> },
    { key: 'status', header: 'Status', accessor: (note) => <StatusBadge status={note.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (note) => (
        <div className="flex min-w-[130px] flex-wrap items-center gap-1.5">
          <Button variant="outline" size="xs" icon={Edit} onClick={() => openCreditNoteModal(note)}>
            Edit
          </Button>
          <Button variant="ghost" size="xs" icon={Trash2} onClick={() => deleteCreditNote(note)}>
            Delete
          </Button>
        </div>
      )
    }
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

      <Card
        className="border-slate-200"
        noPadding
        action={
          activeTab === 'payments' ? (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => openPaymentModal()}>
              Record Payment
            </Button>
          ) : activeTab === 'credit-notes' ? (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => openCreditNoteModal()}>
              Create Credit Note
            </Button>
          ) : null
        }
      >
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

      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={editingPaymentId ? 'Edit Payment' : 'Record Payment'}
        subtitle="Capture buyer payment details for finance reconciliation."
      >
        <form onSubmit={savePayment} className="space-y-4">
          <Select
            label="Invoice"
            required
            value={paymentDraft.invoiceId}
            onChange={(event) => setPaymentDraft((draft) => ({ ...draft, invoiceId: event.target.value }))}
            options={invoices.map((invoice) => ({
              label: `${invoice.invoiceNumber || invoice.id} - ${invoice.companyName || invoice.buyerName}`,
              value: invoice.id
            }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Payment Date"
              type="date"
              required
              value={paymentDraft.date}
              onChange={(event) => setPaymentDraft((draft) => ({ ...draft, date: event.target.value }))}
            />
            <Input
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={paymentDraft.amount}
              onChange={(event) => setPaymentDraft((draft) => ({ ...draft, amount: event.target.value }))}
              prefixText="$"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Method"
              value={paymentDraft.method}
              onChange={(event) => setPaymentDraft((draft) => ({ ...draft, method: event.target.value }))}
              options={[
                { label: 'Bank Transfer', value: 'Bank Transfer' },
                { label: 'Corporate Card', value: 'Corporate Card' },
                { label: 'ACH', value: 'ACH' },
                { label: 'Cashier Check', value: 'Cashier Check' }
              ]}
            />
            <Select
              label="Status"
              value={paymentDraft.status}
              onChange={(event) => setPaymentDraft((draft) => ({ ...draft, status: event.target.value }))}
              options={[
                { label: 'Completed', value: 'Completed' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Failed', value: 'Failed' },
                { label: 'Reversed', value: 'Reversed' }
              ]}
            />
          </div>
          <Input
            label="Reference"
            required
            value={paymentDraft.reference}
            onChange={(event) => setPaymentDraft((draft) => ({ ...draft, reference: event.target.value }))}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={creditNoteModalOpen}
        onClose={() => setCreditNoteModalOpen(false)}
        title={editingCreditNoteId ? 'Edit Credit Note' : 'Create Credit Note'}
        subtitle="Issue freight, damage, tax, or commercial adjustment credits."
      >
        <form onSubmit={saveCreditNote} className="space-y-4">
          <Input
            label="Credit Note ID"
            required
            value={creditNoteDraft.id}
            onChange={(event) => setCreditNoteDraft((draft) => ({ ...draft, id: event.target.value }))}
          />
          <Select
            label="Invoice"
            required
            value={creditNoteDraft.invoiceId}
            onChange={(event) => setCreditNoteDraft((draft) => ({ ...draft, invoiceId: event.target.value }))}
            options={invoices.map((invoice) => ({
              label: `${invoice.invoiceNumber || invoice.id} - ${invoice.companyName || invoice.buyerName}`,
              value: invoice.id
            }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={creditNoteDraft.amount}
              onChange={(event) => setCreditNoteDraft((draft) => ({ ...draft, amount: event.target.value }))}
              prefixText="$"
            />
            <Select
              label="Status"
              value={creditNoteDraft.status}
              onChange={(event) => setCreditNoteDraft((draft) => ({ ...draft, status: event.target.value }))}
              options={[
                { label: 'Pending Approval', value: 'Pending Approval' },
                { label: 'Issued', value: 'Issued' },
                { label: 'Rejected', value: 'Rejected' }
              ]}
            />
          </div>
          <Textarea
            label="Reason"
            required
            rows={3}
            value={creditNoteDraft.reason}
            onChange={(event) => setCreditNoteDraft((draft) => ({ ...draft, reason: event.target.value }))}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreditNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Credit Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
