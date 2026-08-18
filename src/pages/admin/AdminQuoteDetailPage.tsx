import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileQuestion,
  FileSpreadsheet,
  MessageSquare,
  Send,
  ShoppingBag,
  XCircle
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  KPICard,
  Modal,
  PageHeader,
  StatusBadge,
  Textarea
} from '../../components/ui';
import { NegotiationTimeline } from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { QuoteItem } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import {
  getQuoteNumber,
  getQuoteSubtotal,
  getQuoteTotal,
  getQuoteUnitPrice
} from '../../utils/rfqQuote';

export const AdminQuoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quotes, rfqs, purchaseOrders, submitCounterOffer, showToast } = useApp();
  const quote = quotes.find((record) => record.id === id || record.quoteNumber === id);
  const [decisionModal, setDecisionModal] = useState<'approve' | 'reject' | 'message' | null>(null);
  const [managerNote, setManagerNote] = useState('Approved for account executive follow-up. Pricing remains within authorized commercial margin.');

  if (!quote) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="Quote not found"
        description="The requested quote record is not available in the current admin workspace."
        actionText="Back to Quotes"
        actionIcon={ArrowLeft}
        onAction={() => window.history.back()}
      />
    );
  }

  const quoteNumber = getQuoteNumber(quote);
  const relatedRfq = rfqs.find((rfq) => rfq.id === quote.rfqId);
  const relatedPO = purchaseOrders.find((po) => po.quoteId === quote.id || po.quoteNumber === quote.quoteNumber);
  const quoteTotal = getQuoteTotal(quote);
  const quoteSubtotal = getQuoteSubtotal(quote);
  const totalQuantity = useMemo(
    () => quote.items.reduce((sum, item) => sum + item.quantity, 0),
    [quote.items]
  );

  const recordDecision = () => {
    if (!decisionModal) return;

    const nextStatus =
      decisionModal === 'approve' ? 'Quoted' : decisionModal === 'reject' ? 'Rejected' : quote.status;
    submitCounterOffer(quote.id, {
      senderRole: 'SALES_MANAGER',
      senderName: 'Admin Sales Manager',
      message: managerNote,
      actionTaken: decisionModal === 'approve' ? 'MANAGER_APPROVED' : decisionModal === 'reject' ? 'REJECT_QUOTE' : 'SUBMIT_COUNTER',
      status: nextStatus
    });
    showToast(`${quoteNumber} negotiation updated.`, decisionModal === 'reject' ? 'warning' : 'success');
    setDecisionModal(null);
  };

  const itemColumns: Column<QuoteItem>[] = [
    {
      key: 'product',
      header: 'Quoted Product',
      accessor: (item) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs font-semibold text-blue-700">{item.sku}</div>
          <div className="mt-1 text-xs text-slate-500">MOQ {item.moq || 'N/A'} / ETA {item.estimatedDelivery || quote.estimatedDelivery || 'TBD'}</div>
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
      key: 'target',
      header: 'Buyer Target',
      align: 'right',
      accessor: (item) => <span className="font-mono text-slate-700">{item.buyerTargetPrice ? formatCurrency(item.buyerTargetPrice) : 'N/A'}</span>
    },
    {
      key: 'unit',
      header: 'Quoted Unit',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{formatCurrency(getQuoteUnitPrice(item))}</span>
    },
    {
      key: 'subtotal',
      header: 'Line Total',
      align: 'right',
      accessor: (item) => <span className="font-mono font-extrabold text-blue-700">{formatCurrency(item.subtotal || item.quantity * getQuoteUnitPrice(item))}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={quoteNumber}
        subtitle={`${quote.companyName || quote.buyerName} - ${quote.paymentTerms}`}
        breadcrumbs={[
          { label: 'Quotes', href: '/admin/quotes' },
          { label: quoteNumber }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/quotes">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={MessageSquare} onClick={() => setDecisionModal('message')}>
              Add Note
            </Button>
            {quote.status === 'Pending Manager Approval' && (
              <>
                <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => setDecisionModal('approve')}>
                  Approve Counter
                </Button>
                <Button variant="outline" size="sm" icon={XCircle} onClick={() => setDecisionModal('reject')}>
                  Reject Counter
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Quote Total" value={formatCurrency(quoteTotal, quote.currency || 'USD')} subtext={`${totalQuantity.toLocaleString()} units quoted`} icon={FileSpreadsheet} />
        <KPICard title="Subtotal" value={formatCurrency(quoteSubtotal, quote.currency || 'USD')} subtext={`Tax ${formatCurrency(quote.tax || 0)}`} icon={ShoppingBag} />
        <KPICard title="RFQ Reference" value={relatedRfq?.rfqNumber || quote.rfqNumber || quote.rfqId} subtext={relatedRfq?.status || 'RFQ linked'} icon={FileQuestion} />
        <KPICard title="Quote Status" value={quote.status} subtext={quote.validUntil ? `Valid until ${quote.validUntil}` : 'Validity pending'} icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Commercial Summary" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Buyer</div>
              <div className="mt-1 font-bold text-slate-900">{quote.companyName || quote.buyerName}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Sales Rep</div>
              <div className="mt-1 font-bold text-slate-900">{quote.salesRep?.name || 'Unassigned'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Converted PO</div>
              <div className="mt-1 font-bold text-slate-900">
                {relatedPO ? (
                  <Link to={`/admin/purchase-orders/${relatedPO.id}`} className="text-blue-700 hover:text-blue-900">
                    {relatedPO.poNumber || relatedPO.id}
                  </Link>
                ) : (
                  'Not converted'
                )}
              </div>
            </div>
          </div>
          {quote.notes && <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">{quote.notes}</p>}
        </Card>

        <Card title="Status">
          <div className="space-y-3">
            <StatusBadge status={quote.status} />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Manager approval: <span className="font-bold text-slate-900">{quote.managerApprovalStatus || 'Not Required'}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Quoted Items">
        <DataTable columns={itemColumns} data={quote.items} />
      </Card>

      <Card title="Negotiation Timeline">
        <NegotiationTimeline entries={quote.negotiationHistory || []} />
      </Card>

      <Modal
        isOpen={decisionModal !== null}
        onClose={() => setDecisionModal(null)}
        title={decisionModal === 'approve' ? 'Approve Counter Offer' : decisionModal === 'reject' ? 'Reject Quote Request' : 'Add Negotiation Note'}
      >
        <div className="space-y-4">
          <Textarea label="Manager Note" rows={4} value={managerNote} onChange={(event) => setManagerNote(event.target.value)} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setDecisionModal(null)}>
              Cancel
            </Button>
            <Button variant={decisionModal === 'reject' ? 'danger' : 'primary'} size="sm" icon={Send} onClick={recordDecision}>
              Save Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
