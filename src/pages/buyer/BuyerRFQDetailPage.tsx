import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  ClipboardList,
  FileQuestion,
  FileSpreadsheet,
  Paperclip,
  Repeat2,
  Send,
  UserRound
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
  Timeline
} from '../../components/ui';
import { QuoteExpiryNotice } from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { RFQItem } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import {
  getQuoteExpiryState,
  getQuoteNumber,
  getQuoteTotal,
  getRfqNumber,
  getRfqTargetBudget,
  getRfqTotalQuantity
} from '../../utils/rfqQuote';

export const BuyerRFQDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rfqs, quotes, showToast } = useApp();

  const rfq = rfqs.find((record) => record.id === id || record.rfqNumber === id);

  if (!rfq) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="RFQ not found"
        description="The requested quotation record is not available in the current workspace."
        actionText="Back to RFQs"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/buyer/rfqs')}
      />
    );
  }

  const associatedQuote = quotes.find((quote) => quote.rfqId === rfq.id);
  const targetBudget = getRfqTargetBudget(rfq);
  const expiryDays = rfq.expiryDate ? new Date(`${rfq.expiryDate}T00:00:00`).getTime() : null;
  const isFinal = ['Accepted', 'Rejected', 'Expired'].includes(rfq.status);

  const itemColumns: Column<RFQItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[240px]">
          <div className="font-semibold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs font-bold text-blue-600">{item.sku}</div>
          {item.notes && <div className="mt-1 text-xs text-slate-500">{item.notes}</div>}
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Qty / MOQ',
      accessor: (item) => (
        <div className="text-sm">
          <div className="font-bold text-slate-900">{item.quantity.toLocaleString()} {item.unit || 'units'}</div>
          <div className="text-xs text-slate-500">MOQ {item.moq?.toLocaleString() || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'target',
      header: 'Target Price',
      align: 'right',
      accessor: (item) => (
        <div className="font-mono font-bold text-slate-900">{formatCurrency(item.targetPrice)}</div>
      )
    },
    {
      key: 'estimate',
      header: 'Tier Estimate',
      align: 'right',
      accessor: (item) => (
        <div>
          <div className="font-mono font-semibold text-slate-900">
            {formatCurrency(item.unitPriceEstimate || 0)}
          </div>
          <div className="text-xs text-slate-500">{item.currentTierLabel || 'Buyer tier'}</div>
        </div>
      )
    },
    {
      key: 'lineTotal',
      header: 'Line Target',
      align: 'right',
      accessor: (item) => (
        <div className="font-mono font-extrabold text-blue-700">
          {formatCurrency(item.quantity * item.targetPrice)}
        </div>
      )
    }
  ];

  const lifecycleItems = (rfq.timeline || []).map((item, index) => ({
    title: item.stage,
    date: item.date,
    actor: item.actor,
    description: item.note || item.description,
    completed: index < (rfq.timeline || []).length - 1 || isFinal,
    active: index === (rfq.timeline || []).length - 1 && !isFinal
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={getRfqNumber(rfq)}
        subtitle={rfq.projectTitle || 'Wholesale procurement request'}
        badge={<StatusBadge status={rfq.status} />}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'My RFQs', href: '/buyer/rfqs' },
          { label: getRfqNumber(rfq) }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/buyer/rfqs">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={Repeat2}
              onClick={() => showToast('RFQ duplicated for buyer review.', 'info')}
            >
              Duplicate
            </Button>
            {associatedQuote && (
              <Link to={`/buyer/quotes/${associatedQuote.id}`}>
                <Button variant="primary" size="sm" icon={FileSpreadsheet}>
                  View Quote
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {rfq.status === 'Draft' && (
        <Alert type="warning" title="Draft RFQ">
          This request has not been submitted to your account executive yet. Open the create RFQ
          screen to prepare a new submitted request from the same product data.
        </Alert>
      )}

      {associatedQuote && (
        <Alert type={associatedQuote.status === 'Expired' ? 'warning' : 'success'} title="Related quote available">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {getQuoteNumber(associatedQuote)} is {associatedQuote.status.toLowerCase()} for{' '}
              <strong>{formatCurrency(getQuoteTotal(associatedQuote))}</strong>.
            </span>
            <Link to={`/buyer/quotes/${associatedQuote.id}`}>
              <Button variant="primary" size="xs" icon={ArrowRight} iconPosition="right">
                Review Quote
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Requested Line Items" subtitle="MOQ, target pricing, and buyer tier estimates.">
            <DataTable columns={itemColumns} data={rfq.items} compact />
          </Card>

          <Card title="Delivery & Commercial Requirements">
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Required Delivery
                </div>
                <div className="mt-2 font-semibold text-slate-900">{rfq.requiredDeliveryDate || 'TBD'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Building2 className="h-4 w-4" />
                  Destination
                </div>
                <div className="mt-2 font-semibold text-slate-900">{rfq.shippingAddress || 'Not specified'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes</div>
                <p className="mt-2 text-slate-700">{rfq.notes || 'No additional procurement notes.'}</p>
              </div>
            </div>
          </Card>

          <Card title="Attachments">
            {rfq.attachments && rfq.attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {rfq.attachments.map((attachment) => (
                  <div key={attachment} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                    <Paperclip className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="truncate font-semibold text-slate-800">{attachment}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                No supporting files attached.
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="RFQ Summary">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target budget</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(targetBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total quantity</span>
                <span className="font-bold text-slate-900">{getRfqTotalQuantity(rfq).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-semibold text-slate-900">{rfq.createdAt || rfq.createdDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expires</span>
                <span className="font-semibold text-slate-900">{rfq.expiryDate || 'TBD'}</span>
              </div>
            </div>
          </Card>

          {associatedQuote && <QuoteExpiryNotice quote={associatedQuote} />}

          <Card title="Assigned Rep">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{rfq.assignedRep?.name || 'Account Executive'}</div>
                <div className="text-xs text-slate-500">{rfq.assignedRep?.title || 'Wholesale account team'}</div>
                <Button
                  variant="outline"
                  size="xs"
                  className="mt-3"
                  icon={Send}
                  onClick={() => showToast('Message sent to account executive.', 'success')}
                >
                  Message Rep
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Lifecycle">
            {lifecycleItems.length > 0 ? (
              <Timeline items={lifecycleItems} />
            ) : (
              <div className="text-sm text-slate-500">No lifecycle events recorded.</div>
            )}
          </Card>

          {associatedQuote && getQuoteExpiryState(associatedQuote).isExpired && (
            <Button
              variant="outline"
              size="md"
              icon={ClipboardList}
              className="w-full"
              onClick={() => showToast('Renew quote request captured for RFQ review.', 'info')}
            >
              Request Renewal
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
};
