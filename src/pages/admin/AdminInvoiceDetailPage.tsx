import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Download, FileText, Receipt, ShoppingBag, UserRound } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  KPICard,
  PageHeader,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { InvoiceItem, Payment } from '../../types';
import { getInvoiceBalance, getInvoicePaidAmount, getInvoiceTotal } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

export const AdminInvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices, purchaseOrders, buyers, updateInvoiceStatus, showToast } = useApp();
  const invoice = invoices.find((record) => record.id === id || record.invoiceNumber === id);

  if (!invoice) {
    return (
      <EmptyState
        icon={Receipt}
        title="Invoice not found"
        description="The requested invoice record is not available in the current admin workspace."
        actionText="Back to Invoices"
        actionIcon={ArrowLeft}
        onAction={() => window.history.back()}
      />
    );
  }

  const po = purchaseOrders.find((record) => record.id === invoice.poId || record.poNumber === invoice.poNumber);
  const buyer = buyers.find((record) => record.id === invoice.buyerId);
  const invoiceTotal = getInvoiceTotal(invoice);
  const paidAmount = getInvoicePaidAmount(invoice);
  const balanceDue = getInvoiceBalance(invoice);

  const markPaid = () => {
    updateInvoiceStatus(invoice.id, 'Paid', invoiceTotal);
    showToast(`${invoice.invoiceNumber || invoice.id} marked paid in the finance ledger.`, 'success');
  };

  const itemColumns: Column<InvoiceItem>[] = [
    {
      key: 'item',
      header: 'Invoice Item',
      accessor: (item) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{item.productName || item.description}</div>
          <div className="font-mono text-xs text-blue-700">{item.sku || item.productId || 'SERVICE'}</div>
        </div>
      )
    },
    {
      key: 'qty',
      header: 'Qty',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{item.quantity.toLocaleString()}</span>
    },
    {
      key: 'unit',
      header: 'Unit',
      align: 'right',
      accessor: (item) => <span className="font-mono text-slate-700">{formatCurrency(item.unitPrice, invoice.currency || 'USD')}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{formatCurrency(item.amount || item.subtotal || item.quantity * item.unitPrice, invoice.currency || 'USD')}</span>
    }
  ];

  const paymentColumns: Column<Payment>[] = [
    {
      key: 'payment',
      header: 'Payment',
      accessor: (payment) => (
        <div className="min-w-[180px]">
          <div className="font-mono font-bold text-blue-700">{payment.paymentId || payment.id}</div>
          <div className="text-xs text-slate-500">{payment.reference}</div>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (payment) => <span className="font-semibold text-slate-700">{payment.date}</span>
    },
    {
      key: 'method',
      header: 'Method',
      accessor: (payment) => <span className="text-slate-700">{payment.method}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      accessor: (payment) => <span className="font-mono font-bold text-slate-900">{formatCurrency(payment.amount, invoice.currency || 'USD')}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (payment) => <StatusBadge status={payment.status} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.invoiceNumber || invoice.id.toUpperCase()}
        subtitle={`${invoice.companyName || invoice.buyerName} - Due ${invoice.dueDate}`}
        breadcrumbs={[
          { label: 'Invoices', href: '/admin/invoices' },
          { label: invoice.invoiceNumber || invoice.id }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/invoices">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={Download} onClick={() => showToast('Invoice PDF export queued.', 'info')}>
              Export PDF
            </Button>
            {balanceDue > 0 && (
              <Button variant="success" size="sm" icon={CheckCircle2} onClick={markPaid}>
                Mark Paid
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Invoice Total" value={formatCurrency(invoiceTotal, invoice.currency || 'USD')} subtext={invoice.paymentTerms} icon={Receipt} />
        <KPICard title="Paid" value={formatCurrency(paidAmount, invoice.currency || 'USD')} subtext={`${invoice.payments?.length || 0} payment records`} icon={CreditCard} />
        <KPICard title="Balance Due" value={formatCurrency(balanceDue, invoice.currency || 'USD')} subtext={`Due ${invoice.dueDate}`} icon={FileText} />
        <KPICard title="Status" value={invoice.status} subtext={invoice.issueDate} icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Buyer and Billing" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-blue-700" />
                <div>
                  <Link to={`/admin/buyers/${invoice.buyerId}`} className="font-bold text-slate-900 hover:text-blue-700">
                    {invoice.companyName || invoice.buyerName || buyer?.companyName}
                  </Link>
                  <div className="text-xs text-slate-500">{invoice.contactPerson || buyer?.contactPerson}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{invoice.billingAddress || buyer?.address}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Related Purchase Order</div>
              <div className="mt-1 font-bold text-slate-900">
                {po ? (
                  <Link to={`/admin/purchase-orders/${po.id}`} className="text-blue-700 hover:text-blue-900">
                    {po.poNumber || po.id}
                  </Link>
                ) : (
                  invoice.poNumber || invoice.poId || 'Not linked'
                )}
              </div>
              <div className="mt-2 text-sm text-slate-600">{invoice.contractNumber || invoice.contractId || 'No contract reference'}</div>
            </div>
          </div>
        </Card>

        <Card title="Finance Actions">
          <div className="space-y-3">
            <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => updateInvoiceStatus(invoice.id, 'Overdue')}>
              Mark Overdue
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => updateInvoiceStatus(invoice.id, 'Partially Paid', Math.round(invoiceTotal * 0.5))}>
              Record 50% Payment
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => showToast('Credit note draft prepared for this invoice.', 'info')}>
              Draft Credit Note
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Invoice Items">
        <DataTable columns={itemColumns} data={invoice.items} />
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Payments">
          <DataTable columns={paymentColumns} data={invoice.payments || []} compact emptyMessage="No payments have been recorded for this invoice." />
        </Card>
        <Card title="Activity">
          <div className="space-y-3">
            {(invoice.activity || []).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.timestamp}</div>
                </div>
                <div className="mt-1 text-xs font-semibold text-blue-700">{item.actor}</div>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
            {(!invoice.activity || invoice.activity.length === 0) && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No invoice activity has been recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
