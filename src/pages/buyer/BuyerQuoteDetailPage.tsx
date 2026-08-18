import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  MessageSquare,
  Printer,
  ShoppingBag,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Column,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Textarea
} from '../../components/ui';
import { NegotiationTimeline, QuoteExpiryNotice } from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { QuoteItem } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import {
  getQuoteExpiryState,
  getQuoteNumber,
  getQuotePriceDelta,
  getQuoteSubtotal,
  getQuoteTotal,
  getQuoteUnitPrice,
  isQuoteDecisionOpen
} from '../../utils/rfqQuote';

const rejectionReasons = [
  { label: 'Budget exceeded', value: 'Budget exceeded' },
  { label: 'Delivery date mismatch', value: 'Delivery date mismatch' },
  { label: 'Commercial terms declined', value: 'Commercial terms declined' },
  { label: 'Project cancelled', value: 'Project cancelled' }
];

export const BuyerQuoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, rfqs, acceptQuote, rejectQuote, counterQuote, currentBuyer, showToast } = useApp();

  const quote = quotes.find((record) => record.id === id || record.quoteNumber === id);

  if (!quote) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="Quote not found"
        description="The requested quote is not available in the current workspace."
        actionText="Back to Quotes"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/buyer/quotes')}
      />
    );
  }

  const relatedRfq = rfqs.find((rfq) => rfq.id === quote.rfqId);
  const quoteTotal = getQuoteTotal(quote);
  const quoteSubtotal = getQuoteSubtotal(quote);
  const expiry = getQuoteExpiryState(quote);
  const decisionOpen = isQuoteDecisionOpen(quote);
  const canReject = !expiry.isExpired && !['Accepted', 'Rejected', 'Expired'].includes(quote.status);
  const isPendingApproval = quote.status === 'Pending Manager Approval';

  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [counterTotal, setCounterTotal] = useState(Math.round(quoteTotal * 0.97));
  const [counterNotes, setCounterNotes] = useState(
    'We can approve this week if the final quote meets the revised project budget.'
  );
  const [rejectReason, setRejectReason] = useState(rejectionReasons[0].value);
  const [rejectNotes, setRejectNotes] = useState('');

  const targetTotal = useMemo(
    () => quote.items.reduce((sum, item) => sum + item.quantity * (item.buyerTargetPrice || getQuoteUnitPrice(item)), 0),
    [quote.items]
  );
  const totalDelta = quoteTotal - targetTotal;

  const quoteItemColumns: Column<QuoteItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[240px]">
          <div className="font-semibold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs font-bold text-blue-600">{item.sku}</div>
          <div className="mt-1 text-xs text-slate-500">MOQ {item.moq || 'N/A'} / ETA {item.estimatedDelivery || quote.estimatedDelivery || 'TBD'}</div>
        </div>
      )
    },
    {
      key: 'qty',
      header: 'Qty',
      align: 'right',
      accessor: (item) => <span className="font-bold text-slate-900">{item.quantity.toLocaleString()}</span>
    },
    {
      key: 'target',
      header: 'Buyer Target',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-semibold text-slate-700">
          {item.buyerTargetPrice ? formatCurrency(item.buyerTargetPrice) : 'N/A'}
        </span>
      )
    },
    {
      key: 'tier',
      header: 'Tier Price',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-semibold text-slate-700">
          {item.originalTierPrice ? formatCurrency(item.originalTierPrice) : 'N/A'}
        </span>
      )
    },
    {
      key: 'quoted',
      header: 'Quoted Unit',
      align: 'right',
      accessor: (item) => {
        const delta = getQuotePriceDelta(item);
        return (
          <div>
            <div className="font-mono font-bold text-slate-900">{formatCurrency(delta.quoted)}</div>
            {delta.target > 0 && (
              <div className={delta.delta <= 0 ? 'text-xs text-emerald-700' : 'text-xs text-amber-700'}>
                {delta.delta <= 0 ? 'At/below target' : `+${delta.deltaPercent}% vs target`}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'subtotal',
      header: 'Line Total',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-extrabold text-blue-700">
          {formatCurrency(item.subtotal || item.quantity * getQuoteUnitPrice(item))}
        </span>
      )
    }
  ];

  const handleCounter = (event: React.FormEvent) => {
    event.preventDefault();
    counterQuote(quote.id, counterTotal, counterNotes);
    setCounterModalOpen(false);
  };

  const handleAccept = () => {
    acceptQuote(quote.id);
    setAcceptModalOpen(false);
  };

  const handleReject = () => {
    const message = `${rejectReason}${rejectNotes ? `: ${rejectNotes}` : ''}`;
    rejectQuote(quote.id, message);
    setRejectModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={getQuoteNumber(quote)}
        subtitle={`Commercial quote for ${relatedRfq?.projectTitle || quote.rfqNumber || quote.rfqId}`}
        badge={<StatusBadge status={quote.status} />}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Quotes', href: '/buyer/quotes' },
          { label: getQuoteNumber(quote) }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/buyer/quotes">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={Download} onClick={() => showToast('Quote PDF download queued.', 'info')}>
              Download
            </Button>
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        }
      />

      {quote.status === 'Accepted' && (
        <Alert type="success" title="Quote accepted">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>The accepted quote is ready for purchase order creation.</span>
            <Link to={`/buyer/purchase-orders/new?quote=${quote.id}`}>
              <Button variant="success" size="xs" icon={ShoppingBag}>
                Create Purchase Order
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {isPendingApproval && (
        <Alert type="warning" title="Pending sales manager approval">
          The latest counter-offer is under approval review. Acceptance will reopen once final pricing is approved.
        </Alert>
      )}

      {expiry.isExpired && (
        <Alert type="error" title="Quote expired">
          This quote is read-only. Request a refreshed quote from the related RFQ detail screen.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {decisionOpen && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-xs">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Quote decision</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Review, counter, accept, or reject this commercial quote before validity expires.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={XCircle}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => setRejectModalOpen(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={MessageSquare}
                    onClick={() => setCounterModalOpen(true)}
                  >
                    Counter
                  </Button>
                  <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => setAcceptModalOpen(true)}>
                    Accept Quote
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!decisionOpen && canReject && (
            <Alert type="info" title="Decision actions limited">
              This quote is not currently open for acceptance or counter-offer. You can reject it or wait for final pricing approval.
              <div className="mt-3">
                <Button variant="outline" size="xs" icon={XCircle} onClick={() => setRejectModalOpen(true)}>
                  Reject Quote
                </Button>
              </div>
            </Alert>
          )}

          <Card title="Commercial Quote" subtitle="Line pricing compares buyer target, current tier, and quoted unit price.">
            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Quote total</div>
                <div className="mt-2 font-mono text-2xl font-extrabold text-slate-900">{formatCurrency(quoteTotal)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Target total</div>
                <div className="mt-2 font-mono text-2xl font-extrabold text-slate-900">{formatCurrency(targetTotal)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Difference</div>
                <div className={`mt-2 font-mono text-2xl font-extrabold ${totalDelta <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {totalDelta <= 0 ? '-' : '+'}
                  {formatCurrency(Math.abs(totalDelta))}
                </div>
              </div>
            </div>

            <DataTable columns={quoteItemColumns} data={quote.items} compact />

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="font-bold text-slate-900">Notes and conditions</div>
                <p className="mt-2 leading-relaxed text-slate-600">
                  {quote.notes ||
                    'Prices include standard warranty support, wholesale account handling, and regional pallet transport.'}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <span className="rounded-lg bg-white px-3 py-2 font-semibold text-slate-700">
                    Payment: {quote.paymentTerms}
                  </span>
                  <span className="rounded-lg bg-white px-3 py-2 font-semibold text-slate-700">
                    ETA: {quote.estimatedDelivery || 'TBD'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(quoteSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT / tax</span>
                  <span className="font-mono font-semibold">{formatCurrency(quote.tax || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="font-mono font-semibold">-{formatCurrency(quote.discount || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Freight</span>
                  <span className="font-mono font-semibold">{formatCurrency(quote.shipping || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                  <span>Grand total</span>
                  <span className="font-mono text-blue-700">{formatCurrency(quoteTotal)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Negotiation Timeline" subtitle="Buyer, sales representative, manager, and system events.">
            <NegotiationTimeline entries={quote.negotiationHistory} />
          </Card>
        </div>

        <aside className="space-y-6">
          <QuoteExpiryNotice quote={quote} />

          <Card title="Quote Summary">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">RFQ</span>
                <Link to={`/buyer/rfqs/${quote.rfqId}`} className="font-mono font-bold text-blue-700 hover:underline">
                  {quote.rfqNumber || quote.rfqId}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Issued</span>
                <span className="font-semibold text-slate-900">{quote.createdAt || quote.createdDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Valid until</span>
                <span className="font-semibold text-slate-900">{quote.validUntil || quote.expiryDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Manager approval</span>
                <StatusBadge status={quote.managerApprovalStatus || 'Not Required'} size="sm" />
              </div>
            </div>
          </Card>

          <Card title="Quoted To">
            <div className="space-y-2 text-sm">
              <div className="font-bold text-slate-900">{currentBuyer.companyName}</div>
              <div className="text-slate-600">{currentBuyer.address}</div>
              <div className="text-xs text-slate-500">Tax ID: {currentBuyer.taxId}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                {currentBuyer.buyerGroup} / {currentBuyer.paymentTerms}
              </div>
            </div>
          </Card>

          <Card title="Sales Contact">
            <div className="space-y-2 text-sm">
              <div className="font-bold text-slate-900">{quote.salesRep?.name || 'Account Executive'}</div>
              <div className="text-slate-600">{quote.salesRep?.email || 'sales@wholesalehub.com'}</div>
              <div className="text-slate-600">{quote.salesRep?.phone || '+855 23 999 101'}</div>
              <Button
                variant="outline"
                size="xs"
                icon={ShieldCheck}
                onClick={() => showToast('Account executive notified.', 'success')}
              >
                Request Clarification
              </Button>
            </div>
          </Card>

          {quote.status === 'Accepted' && (
            <Link to={`/buyer/purchase-orders/new?quote=${quote.id}`} className="block">
              <Button variant="success" size="md" icon={ShoppingBag} className="w-full">
                Create Purchase Order
              </Button>
            </Link>
          )}
        </aside>
      </div>

      <Modal
        isOpen={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        title={`Counter ${getQuoteNumber(quote)}`}
        subtitle="Submit revised commercial terms for approval."
      >
        <form onSubmit={handleCounter} className="space-y-4">
          <Alert type="info">
            Counter-offers move the quote to pending manager approval and keep the negotiation history visible.
          </Alert>
          <Input
            label="Current quote total"
            disabled
            value={formatCurrency(quoteTotal)}
          />
          <Input
            label="Proposed total"
            type="number"
            min={1}
            step="10"
            prefixText="$"
            value={counterTotal}
            helperText={`Suggested 3% concession: ${formatCurrency(Math.round(quoteTotal * 0.97))}`}
            onChange={(event) => setCounterTotal(parseFloat(event.target.value) || 0)}
          />
          <Textarea
            label="Counter-offer justification"
            required
            rows={4}
            value={counterNotes}
            onChange={(event) => setCounterNotes(event.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setCounterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={MessageSquare}>
              Submit Counter
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject ${getQuoteNumber(quote)}`}
        subtitle="Record a reason for the account executive."
      >
        <div className="space-y-4">
          <Select
            label="Reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            options={rejectionReasons}
          />
          <Textarea
            label="Notes"
            rows={4}
            value={rejectNotes}
            onChange={(event) => setRejectNotes(event.target.value)}
            placeholder="Optional detail for the account executive..."
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" size="sm" icon={XCircle} onClick={handleReject}>
              Reject Quote
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        onConfirm={handleAccept}
        title="Accept Quote"
        message={`Accept ${getQuoteNumber(quote)} for ${formatCurrency(quoteTotal)}. The quote status will move to Accepted and purchase order creation will be available as the next step.`}
        confirmText="Accept Quote"
        variant="success"
      />
    </div>
  );
};
