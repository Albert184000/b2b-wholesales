import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, FileQuestion, FileSpreadsheet, Package, Send, Target } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Input,
  KPICard,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
  Timeline
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { PaymentTerms, RFQItem } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { getRfqNumber, getRfqTargetBudget, getRfqTotalQuantity } from '../../utils/rfqQuote';

export const AdminRFQDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { rfqs, quotes, generateQuote, showToast } = useApp();
  const rfq = rfqs.find((record) => record.id === id || record.rfqNumber === id);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [validUntil, setValidUntil] = useState('2026-09-15');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('Net 30');
  const [notes, setNotes] = useState('Commercial quote includes pallet packaging, enterprise warranty, and scheduled freight coordination.');
  const [linePrices, setLinePrices] = useState<Record<string, number>>({});

  if (!rfq) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="RFQ not found"
        description="The requested RFQ record is not available in the current admin workspace."
        actionText="Back to RFQs"
        actionIcon={ArrowLeft}
        onAction={() => window.history.back()}
      />
    );
  }

  const rfqNumber = getRfqNumber(rfq);
  const targetBudget = getRfqTargetBudget(rfq);
  const totalQuantity = getRfqTotalQuantity(rfq);
  const associatedQuote = quotes.find((quote) => quote.rfqId === rfq.id);

  const openQuoteModal = () => {
    const initialPrices: Record<string, number> = {};
    rfq.items.forEach((item) => {
      initialPrices[item.sku] = item.unitPriceEstimate || item.targetPrice;
    });
    setLinePrices(initialPrices);
    setQuoteModalOpen(true);
  };

  const handleGenerateQuote = (event: React.FormEvent) => {
    event.preventDefault();
    generateQuote(rfq.id, {
      validUntil,
      paymentTerms,
      notes,
      items: rfq.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        quantity: item.quantity,
        moq: item.moq,
        quotedUnitPrice: linePrices[item.sku] || item.targetPrice,
        originalTierPrice: item.unitPriceEstimate,
        buyerTargetPrice: item.targetPrice,
        estimatedDelivery: item.requiredDeliveryDate
      }))
    });
    setQuoteModalOpen(false);
    showToast(`${rfqNumber} quote generated from admin detail.`, 'success');
  };

  const itemColumns: Column<RFQItem>[] = [
    {
      key: 'product',
      header: 'Requested Product',
      accessor: (item) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs font-semibold text-blue-700">{item.sku}</div>
          {item.notes && <div className="mt-1 text-xs text-slate-500">{item.notes}</div>}
        </div>
      )
    },
    {
      key: 'qty',
      header: 'Quantity / MOQ',
      accessor: (item) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{item.quantity.toLocaleString()}</div>
          <div className="text-xs text-slate-500">MOQ {item.moq?.toLocaleString() || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'target',
      header: 'Buyer Target',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{formatCurrency(item.targetPrice)}</span>
    },
    {
      key: 'estimate',
      header: 'Tier Estimate',
      align: 'right',
      accessor: (item) => (
        <div>
          <div className="font-mono font-bold text-blue-700">{formatCurrency(item.unitPriceEstimate || item.targetPrice)}</div>
          <div className="text-xs text-slate-500">{item.currentTierLabel || 'Wholesale tier'}</div>
        </div>
      )
    },
    {
      key: 'line',
      header: 'Line Target',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-extrabold text-slate-900">
          {formatCurrency(item.quantity * item.targetPrice)}
        </span>
      )
    }
  ];

  const timelineItems = (rfq.timeline || []).map((item, index) => ({
    title: item.stage,
    date: item.date,
    actor: item.actor,
    description: item.note || item.description,
    completed: index < (rfq.timeline || []).length - 1 || ['Accepted', 'Rejected', 'Expired'].includes(rfq.status),
    active: index === (rfq.timeline || []).length - 1 && !['Accepted', 'Rejected', 'Expired'].includes(rfq.status)
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={rfqNumber}
        subtitle={rfq.projectTitle || 'Wholesale pricing request'}
        breadcrumbs={[
          { label: 'RFQs', href: '/admin/rfqs' },
          { label: rfqNumber }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/rfqs">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            {associatedQuote ? (
              <Link to={`/admin/quotes/${associatedQuote.id}`}>
                <Button variant="primary" size="sm" icon={FileSpreadsheet}>
                  View Quote
                </Button>
              </Link>
            ) : (
              <Button variant="primary" size="sm" icon={FileSpreadsheet} onClick={openQuoteModal}>
                Issue Quote
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Target Budget" value={formatCurrency(targetBudget)} subtext="Buyer requested spend" icon={Target} />
        <KPICard title="Total Quantity" value={totalQuantity.toLocaleString()} subtext={`${rfq.items.length} requested SKUs`} icon={Package} />
        <KPICard title="Buyer" value={rfq.companyName || rfq.buyerName} subtext={rfq.buyerId} icon={Building2} />
        <KPICard title="RFQ Status" value={rfq.status} subtext={rfq.expiryDate ? `Expires ${rfq.expiryDate}` : 'No expiry date'} icon={FileQuestion} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Buyer Request" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Buyer Organization</div>
              <div className="mt-1 font-bold text-slate-900">{rfq.companyName || rfq.buyerName}</div>
              <div className="mt-1 text-sm text-slate-600">{rfq.shippingAddress}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Commercial Preference</div>
              <div className="mt-1 font-bold text-slate-900">{rfq.paymentTermsPreference || 'Net terms requested'}</div>
              <div className="mt-1 text-sm text-slate-600">Required delivery: {rfq.requiredDeliveryDate || 'TBD'}</div>
            </div>
          </div>
          {rfq.notes && <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">{rfq.notes}</p>}
        </Card>

        <Card title="Lifecycle">
          <Timeline items={timelineItems} />
        </Card>
      </div>

      <Card title="Requested Items">
        <DataTable columns={itemColumns} data={rfq.items} />
      </Card>

      <Modal isOpen={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} title={`Issue Quote for ${rfqNumber}`} size="lg">
        <form onSubmit={handleGenerateQuote} className="space-y-4">
          <div className="space-y-3">
            {rfq.items.map((item) => (
              <div key={item.sku} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_160px]">
                <div>
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="font-mono text-xs text-blue-700">{item.sku} / Qty {item.quantity.toLocaleString()}</div>
                </div>
                <Input
                  label="Quoted Unit"
                  type="number"
                  min={0}
                  step="0.01"
                  prefixText="$"
                  value={linePrices[item.sku] || item.targetPrice}
                  onChange={(event) =>
                    setLinePrices((current) => ({
                      ...current,
                      [item.sku]: parseFloat(event.target.value) || 0
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Valid Until" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
            <Select
              label="Payment Terms"
              value={paymentTerms}
              onChange={(event) => setPaymentTerms(event.target.value as PaymentTerms)}
              options={[
                { label: 'Net 30 Days', value: 'Net 30' },
                { label: 'Net 60 Days', value: 'Net 60' },
                { label: 'Advance Wire', value: 'Advance Wire' }
              ]}
            />
          </div>
          <Textarea label="Commercial Notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setQuoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Send}>
              Dispatch Quote
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
