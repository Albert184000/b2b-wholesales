import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileClock,
  FileText,
  History,
  Printer,
  Receipt,
  ShoppingBag,
  Truck
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Modal,
  PageHeader,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { InvoiceItem, Payment } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import {
  getInvoiceAgingDays,
  getInvoiceBalance,
  getInvoiceNumber,
  getInvoicePaidAmount,
  getInvoiceTotal,
  isInvoiceDueSoon,
  isInvoiceOverdue
} from '../../utils/financeLogistics';

export const BuyerInvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, purchaseOrders, contracts, shipments, currentBuyer, showToast } = useApp();
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);

  const invoice = invoices.find((record) => record.id === id || record.invoiceNumber === id);

  if (!invoice) {
    return (
      <EmptyState
        icon={Receipt}
        title="Invoice not found"
        description="The requested invoice is not available in the current workspace."
        actionText="Back to Invoices"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/buyer/invoices')}
      />
    );
  }

  const relatedPO = purchaseOrders.find(
    (po) => po.id === invoice.poId || po.poNumber === invoice.poNumber || po.invoiceId === invoice.id
  );
  const relatedContract = contracts.find(
    (contract) =>
      contract.id === invoice.contractId ||
      contract.contractNumber === invoice.contractNumber ||
      contract.poId === relatedPO?.id ||
      contract.poNumber === invoice.poNumber
  );
  const relatedShipments = shipments.filter(
    (shipment) =>
      shipment.invoiceId === invoice.id ||
      invoice.shipmentIds?.includes(shipment.id) ||
      shipment.poId === relatedPO?.id ||
      shipment.poNumber === invoice.poNumber
  );
  const balanceDue = getInvoiceBalance(invoice);
  const paidAmount = getInvoicePaidAmount(invoice);
  const grandTotal = getInvoiceTotal(invoice);
  const agingDays = getInvoiceAgingDays(invoice);
  const invoiceLabel = getInvoiceNumber(invoice);
  const isAttentionNeeded = invoice.status === 'Overdue' || isInvoiceOverdue(invoice) || isInvoiceDueSoon(invoice);

  const itemColumns: Column<InvoiceItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[240px]">
          <div className="font-semibold text-slate-900">{item.productName || item.description}</div>
          <div className="font-mono text-xs font-bold text-blue-600">{item.sku || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right',
      accessor: (item) => <span className="font-bold text-slate-900">{item.quantity.toLocaleString()}</span>
    },
    {
      key: 'unit',
      header: 'Unit Price',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-semibold text-slate-900">
          {formatCurrency(item.unitPrice, invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'discount',
      header: 'Discount',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono text-slate-600">
          {item.discount ? `-${formatCurrency(item.discount, invoice.currency || 'USD')}` : formatCurrency(0)}
        </span>
      )
    },
    {
      key: 'tax',
      header: 'Tax',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono text-slate-600">
          {formatCurrency(item.tax || 0, invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-extrabold text-blue-700">
          {formatCurrency(item.subtotal ?? item.amount ?? item.quantity * item.unitPrice, invoice.currency || 'USD')}
        </span>
      )
    }
  ];

  const paymentColumns: Column<Payment>[] = [
    {
      key: 'payment',
      header: 'Payment ID',
      accessor: (payment) => (
        <span className="font-mono font-bold text-blue-700">{payment.paymentId || payment.id}</span>
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
      accessor: (payment) => (
        <span className="font-mono font-bold text-emerald-700">
          {formatCurrency(payment.amount, invoice.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'reference',
      header: 'Reference',
      accessor: (payment) => <span className="font-mono text-xs text-slate-600">{payment.reference}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (payment) => <StatusBadge status={payment.status} size="sm" />
    }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={invoiceLabel}
        subtitle={`Issued ${invoice.issueDate} / Due ${invoice.dueDate}`}
        badge={<StatusBadge status={invoice.status} />}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Invoices', href: '/buyer/invoices' },
          { label: invoiceLabel }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/buyer/invoices">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => showToast(`${invoiceLabel} download queued.`, 'info')}
            >
              Download Invoice
            </Button>
            {relatedPO && (
              <Link to={`/buyer/purchase-orders/${relatedPO.id}`}>
                <Button variant="outline" size="sm" icon={ShoppingBag}>
                  View PO
                </Button>
              </Link>
            )}
            {relatedContract && (
              <Link to={`/buyer/contracts/${relatedContract.id}`}>
                <Button variant="outline" size="sm" icon={FileText}>
                  View Contract
                </Button>
              </Link>
            )}
            <Button variant="primary" size="sm" icon={History} onClick={() => setPaymentHistoryOpen(true)}>
              View Payment History
            </Button>
          </div>
        }
      />

      {isAttentionNeeded && balanceDue > 0 && (
        <Alert
          type={invoice.status === 'Overdue' || isInvoiceOverdue(invoice) ? 'error' : 'warning'}
          title={invoice.status === 'Overdue' || isInvoiceOverdue(invoice) ? 'Invoice overdue' : 'Invoice due soon'}
        >
          Balance due is <strong>{formatCurrency(balanceDue, invoice.currency || 'USD')}</strong>.
          {agingDays > 0 ? ` This invoice is ${agingDays} day(s) past due.` : ` Settlement is due on ${invoice.dueDate}.`}
        </Alert>
      )}

      <Card className="border-slate-200 bg-white shadow-sm" noPadding>
        <div className="p-5 sm:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Invoice</div>
              <h2 className="mt-2 font-mono text-3xl font-extrabold text-slate-900">{invoiceLabel}</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <span>Issue Date: <strong className="text-slate-900">{invoice.issueDate}</strong></span>
                <span>Due Date: <strong className="text-slate-900">{invoice.dueDate}</strong></span>
                <span>PO Reference: <strong className="text-slate-900">{invoice.poNumber || 'N/A'}</strong></span>
                <span>Contract: <strong className="text-slate-900">{invoice.contractNumber || 'N/A'}</strong></span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div className="font-bold uppercase tracking-wider text-slate-500">WholesaleHub</div>
              <div className="mt-2 space-y-1 text-slate-700">
                <div>Veng Sreng Blvd, Phnom Penh, Cambodia</div>
                <div>Tax ID: KHM-VAT-992810</div>
                <div>finance@wholesalehub.com</div>
                <div>+855 (0) 23 882 100</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 py-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Supplier</div>
              <div className="mt-2 text-sm font-extrabold text-slate-900">WholesaleHub</div>
              <div className="mt-1 text-sm text-slate-600">Veng Sreng Blvd, Sangkat Choam Chao, Phnom Penh</div>
              <div className="mt-2 text-xs text-slate-500">Tax ID: KHM-VAT-992810</div>
              <div className="text-xs text-slate-500">Contact: Finance Support</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Bill To</div>
              <div className="mt-2 text-sm font-extrabold text-slate-900">
                {invoice.companyName || currentBuyer.companyName}
              </div>
              <div className="mt-1 text-sm text-slate-600">{invoice.billingAddress || currentBuyer.address}</div>
              <div className="mt-2 text-xs text-slate-500">Tax ID: {invoice.taxId || currentBuyer.taxId}</div>
              <div className="text-xs text-slate-500">
                Contact: {invoice.contactPerson || currentBuyer.contactPerson}
              </div>
            </div>
          </div>

          <div className="py-6">
            <DataTable columns={itemColumns} data={invoice.items} compact />
          </div>

          <div className="flex flex-col gap-5 border-t border-slate-200 pt-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl space-y-3 text-sm text-slate-600">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Terms</div>
                <div className="mt-1 font-semibold text-slate-900">{invoice.paymentTerms}</div>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
                Bank transfer, wire reference, and payment proof details are prepared for finance reconciliation.
              </div>
            </div>

            <div className="w-full max-w-sm space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold">{formatCurrency(invoice.subtotal, invoice.currency || 'USD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span className="font-mono font-semibold">-{formatCurrency(invoice.discount || 0, invoice.currency || 'USD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.taxAmount || invoice.tax || 0, invoice.currency || 'USD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.shipping || 0, invoice.currency || 'USD')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono text-blue-700">{formatCurrency(grandTotal, invoice.currency || 'USD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid</span>
                <span className="font-mono font-bold text-emerald-700">{formatCurrency(paidAmount, invoice.currency || 'USD')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900">
                <span>Balance Due</span>
                <span className="font-mono text-rose-700">{formatCurrency(balanceDue, invoice.currency || 'USD')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card title="Payment History" className="border-slate-200">
          {invoice.payments?.length ? (
            <DataTable columns={paymentColumns} data={invoice.payments} compact />
          ) : (
            <EmptyState
              icon={FileClock}
              title="No payments recorded"
              description="Payment history appears here after bank transfer reconciliation."
            />
          )}
        </Card>

        <Card title="Related Records" className="border-slate-200">
          <div className="flex flex-col gap-2">
            {relatedPO ? (
              <Link to={`/buyer/purchase-orders/${relatedPO.id}`}>
                <Button variant="outline" size="sm" icon={ShoppingBag} className="w-full">
                  View Purchase Order
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" icon={ShoppingBag} disabled>
                PO Unavailable
              </Button>
            )}
            {relatedContract ? (
              <Link to={`/buyer/contracts/${relatedContract.id}`}>
                <Button variant="outline" size="sm" icon={FileText} className="w-full">
                  View Contract
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" icon={FileText} disabled>
                Contract Unavailable
              </Button>
            )}
            {relatedShipments.length > 0 ? (
              relatedShipments.map((shipment) => (
                <Link key={shipment.id} to={`/buyer/shipments/${shipment.id}`}>
                  <Button variant="outline" size="sm" icon={Truck} className="w-full">
                    Track {shipment.shipmentNumber || shipment.id.toUpperCase()}
                  </Button>
                </Link>
              ))
            ) : (
              <Button variant="secondary" size="sm" icon={Truck} disabled>
                Shipment Pending
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={paymentHistoryOpen}
        onClose={() => setPaymentHistoryOpen(false)}
        title={`Payment History: ${invoiceLabel}`}
        size="xl"
      >
        {invoice.payments?.length ? (
          <DataTable columns={paymentColumns} data={invoice.payments} compact />
        ) : (
          <EmptyState
            icon={FileClock}
            title="No payments recorded"
            description="This invoice does not have any frontend payment history entries yet."
          />
        )}
      </Modal>
    </div>
  );
};
