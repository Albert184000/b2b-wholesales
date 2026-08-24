import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CreditCard, Edit, Eye, FileMinus, Plus, Receipt, Save, Search, Trash2 } from 'lucide-react';
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
  reasonCategory: string;
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
  reasonCategory: string;
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
    reasonCategory: 'Price Corrections',
    reason: 'Freight service adjustment',
    amount: 180,
    status: 'Issued',
    date: '2026-08-18'
  },
  {
    id: 'CN-2026-003',
    invoiceNumber: 'INV-2026-0097',
    buyerName: 'Mekong Retail Corp.',
    reasonCategory: 'Damaged Products',
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
  reasonCategory: 'Returns',
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
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNoteRow | null>(null);
  const [voidInvoice, setVoidInvoice] = useState<Invoice | null>(null);
  const [voidedInvoiceIds, setVoidedInvoiceIds] = useState<string[]>([]);
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
  const getInvoiceUiStatus = (invoice: Invoice) => (voidedInvoiceIds.includes(invoice.id) ? 'Void' : invoice.status);

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
    const matchStatus = statusFilter === 'ALL' || getInvoiceUiStatus(invoice) === statusFilter;
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
      note.reasonCategory.toLowerCase().includes(query) ||
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
        reasonCategory: note.reasonCategory,
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
      reasonCategory: creditNoteDraft.reasonCategory,
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

  const confirmVoidInvoice = () => {
    if (!voidInvoice) return;
    setVoidedInvoiceIds((current) => (current.includes(voidInvoice.id) ? current : [...current, voidInvoice.id]));
    showToast(`${voidInvoice.invoiceNumber || voidInvoice.id} marked Void in the finance workspace.`, 'warning');
    setVoidInvoice(null);
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
      accessor: (invoice) => (
        <span className="font-mono font-bold text-rose-700">
          {formatCurrency(getInvoiceUiStatus(invoice) === 'Void' ? 0 : getInvoiceBalance(invoice), invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'due',
      header: 'Due Date',
      accessor: (invoice) => <span className="font-semibold text-slate-700">{invoice.dueDate}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (invoice) => <StatusBadge status={getInvoiceUiStatus(invoice)} size="sm" />
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
          {getInvoiceUiStatus(invoice) !== 'Void' && getInvoiceBalance(invoice) > 0 && (
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
          {getInvoiceUiStatus(invoice) !== 'Void' && (
            <Button variant="ghost" size="xs" icon={FileMinus} onClick={() => setVoidInvoice(invoice)}>
              Void
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
    {
      key: 'reason',
      header: 'Reason',
      accessor: (note) => (
        <div className="min-w-[220px]">
          <div className="font-semibold text-slate-900">{note.reasonCategory}</div>
          <div className="text-xs text-slate-600">{note.reason}</div>
        </div>
      )
    },
    { key: 'amount', header: 'Amount', align: 'right', accessor: (note) => <span className="font-mono font-bold text-slate-900">{formatCurrency(note.amount)}</span> },
    { key: 'status', header: 'Status', accessor: (note) => <StatusBadge status={note.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (note) => (
        <div className="flex min-w-[130px] flex-wrap items-center gap-1.5">
          <Button variant="outline" size="xs" icon={Eye} onClick={() => setSelectedCreditNote(note)}>
            View
          </Button>
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
                      { label: 'Draft', value: 'Draft' },
                      { label: 'Issued', value: 'Issued' },
                      { label: 'Partially Paid', value: 'Partially Paid' },
                      { label: 'Paid', value: 'Paid' },
                      { label: 'Overdue', value: 'Overdue' },
                      { label: 'Void', value: 'Void' }
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
          <Select
            label="Credit Reason Category"
            required
            value={creditNoteDraft.reasonCategory}
            onChange={(event) => setCreditNoteDraft((draft) => ({ ...draft, reasonCategory: event.target.value }))}
            options={[
              { label: 'Returns', value: 'Returns' },
              { label: 'Damaged Products', value: 'Damaged Products' },
              { label: 'Incorrect Billing', value: 'Incorrect Billing' },
              { label: 'Disputes', value: 'Disputes' },
              { label: 'Price Corrections', value: 'Price Corrections' }
            ]}
          />
          <Textarea
            label="Reason Details"
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

      {selectedCreditNote && (
        <Modal
          isOpen={Boolean(selectedCreditNote)}
          onClose={() => setSelectedCreditNote(null)}
          title={selectedCreditNote.id}
          subtitle="Credit note detail, category, invoice reference, and approval state."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Invoice</div>
                <div className="mt-1 font-mono font-bold text-blue-700">{selectedCreditNote.invoiceNumber}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Buyer</div>
                <div className="mt-1 font-bold text-slate-900">{selectedCreditNote.buyerName}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Category</div>
                <div className="mt-1 font-bold text-slate-900">{selectedCreditNote.reasonCategory}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Amount</div>
                <div className="mt-1 font-mono font-extrabold text-slate-900">{formatCurrency(selectedCreditNote.amount)}</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Reason Details</div>
                <StatusBadge status={selectedCreditNote.status} size="sm" />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedCreditNote.reason}</p>
              <div className="mt-3 text-xs font-semibold text-slate-500">Issued date: {selectedCreditNote.date}</div>
            </div>
          </div>
        </Modal>
      )}

      {voidInvoice && (
        <Modal
          isOpen={Boolean(voidInvoice)}
          onClose={() => setVoidInvoice(null)}
          title={`Void ${voidInvoice.invoiceNumber || voidInvoice.id}`}
          subtitle="Mock finance control action for invoice cancellation."
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-bold">Confirm invoice void</div>
                <p className="mt-1 leading-6">
                  This UI action marks the invoice as Void in the local finance workspace and hides the outstanding balance from the list view.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Buyer</div>
                <div className="mt-1 font-bold text-slate-900">{voidInvoice.companyName || voidInvoice.buyerName}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Total</div>
                <div className="mt-1 font-mono font-bold text-slate-900">{formatCurrency(getInvoiceTotal(voidInvoice), voidInvoice.currency || 'USD')}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Current Status</div>
                <div className="mt-1">
                  <StatusBadge status={voidInvoice.status} size="sm" />
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setVoidInvoice(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" size="sm" icon={FileMinus} onClick={confirmVoidInvoice}>
                Void Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
