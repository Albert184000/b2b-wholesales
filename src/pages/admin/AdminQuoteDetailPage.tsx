import React, { useState } from 'react';
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

const getWorkspaceStage = (actionTaken: string | undefined, senderRole: string, index: number) => {
  if (actionTaken === 'ACCEPT_QUOTE') return 'Final Price';
  if (actionTaken === 'REJECT_QUOTE') return 'Rejected Offer';
  if (actionTaken === 'REQUEST_MANAGER_APPROVAL' || actionTaken === 'MANAGER_APPROVED') return 'Manager Approval';
  if (senderRole === 'BUYER' && index === 0) return 'Buyer Offer';
  if (senderRole === 'BUYER') return 'Counter Offer';
  if (senderRole === 'SALES_REP') return 'Sales Offer';
  return 'System Update';
};

const getWorkspaceState = (actionTaken: string | undefined, fallbackStatus: string) => {
  if (actionTaken === 'MANAGER_APPROVED') return 'Approved';
  if (actionTaken === 'REQUEST_MANAGER_APPROVAL') return 'Pending Approval';
  if (actionTaken === 'ACCEPT_QUOTE') return 'Accepted';
  if (actionTaken === 'REJECT_QUOTE') return 'Rejected';
  if (actionTaken === 'QUOTE_EXPIRED') return 'Expired';
  return fallbackStatus;
};

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
  const totalQuantity = quote.items.reduce((sum, item) => sum + item.quantity, 0);
  const offerRows =
    quote.negotiationHistory && quote.negotiationHistory.length > 0
      ? quote.negotiationHistory.map((entry, index) => ({
          id: entry.id,
          stage: getWorkspaceStage(entry.actionTaken, entry.senderRole, index),
          actor: entry.senderName,
          role: entry.senderRole.replace(/_/g, ' '),
          price: entry.proposedPrice || quoteTotal,
          quantity: entry.quantity || totalQuantity,
          comments: entry.message,
          timestamp: entry.timestamp,
          state: getWorkspaceState(entry.actionTaken, entry.status || quote.status),
          expiry: quote.validUntil || quote.expiryDate || 'TBD'
        }))
      : [
          {
            id: `${quote.id}-initial-offer`,
            stage: 'Sales Offer',
            actor: quote.salesRep?.name || 'Account Executive',
            role: 'SALES REP',
            price: quoteTotal,
            quantity: totalQuantity,
            comments: quote.notes || 'Initial wholesale quotation prepared for buyer review.',
            timestamp: quote.createdAt || quote.createdDate || '2026-08-24',
            state: quote.status,
            expiry: quote.validUntil || quote.expiryDate || 'TBD'
          }
        ];

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

  const offerColumns: Column<(typeof offerRows)[number]>[] = [
    {
      key: 'stage',
      header: 'Stage',
      accessor: (row) => (
        <div className="min-w-[170px]">
          <div className="font-bold text-slate-900">{row.stage}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{row.role}</div>
        </div>
      )
    },
    {
      key: 'actor',
      header: 'Actor / Time',
      accessor: (row) => (
        <div className="min-w-[180px]">
          <div className="font-semibold text-slate-900">{row.actor}</div>
          <div className="text-xs text-slate-500">{row.timestamp}</div>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Offer',
      align: 'right',
      accessor: (row) => (
        <div className="min-w-[130px]">
          <div className="font-mono font-extrabold text-blue-700">{formatCurrency(row.price, quote.currency || 'USD')}</div>
          <div className="text-xs text-slate-500">{row.quantity.toLocaleString()} units</div>
        </div>
      )
    },
    {
      key: 'comment',
      header: 'Comment',
      accessor: (row) => <div className="line-clamp-2 min-w-[260px] text-sm text-slate-600">{row.comments}</div>
    },
    {
      key: 'approval',
      header: 'Approval / Expiry',
      accessor: (row) => (
        <div className="min-w-[150px] space-y-1">
          <StatusBadge status={row.state} size="sm" />
          <div className="text-[11px] text-slate-500">Expires {row.expiry}</div>
        </div>
      )
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

      <Card title="Negotiation Workspace" subtitle="Buyer offer, sales offer, counter offer, manager approval, and final-price states.">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-5">
          {['Buyer Offer', 'Sales Offer', 'Counter Offer', 'Manager Approval', 'Final Price'].map((stage, index) => (
            <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-xs font-black text-white">
                {index + 1}
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900">{stage}</div>
              {index < 4 && <div className="mt-1 text-xs font-bold text-slate-400">Review</div>}
            </div>
          ))}
        </div>
        <DataTable columns={offerColumns} data={offerRows} enablePagination pageSize={5} className="[&_table]:min-w-[980px]" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={MessageSquare} onClick={() => setDecisionModal('message')}>
            Counter / Note
          </Button>
          <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => setDecisionModal('approve')}>
            Accept / Approve
          </Button>
          <Button variant="outline" size="sm" icon={XCircle} onClick={() => setDecisionModal('reject')}>
            Reject
          </Button>
          <Button variant="ghost" size="sm" onClick={() => showToast(`${quoteNumber} expiry review queued for staff follow-up.`, 'info')}>
            Mark Expiry Review
          </Button>
        </div>
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
