import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Save, ShoppingBag } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  FileUpload,
  Input,
  PageHeader,
  StatusBadge,
  Textarea
} from '../../components/ui';
import { CreditValidationCard, InventoryAllocationSummary, QuoteExpiryNotice } from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { mockBuyerWarehouseAvailability } from '../../data/mockData';
import { QuoteItem } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { getQuoteExpiryState, getQuoteNumber, getQuoteSubtotal, getQuoteTotal, getQuoteUnitPrice } from '../../utils/rfqQuote';
import { buildCreditCheck, buildStockAllocation, isBuyerApprovedForPO } from '../../utils/poContract';

export const BuyerCreatePOPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    quotes,
    currentBuyer,
    savePurchaseOrderDraft,
    createPurchaseOrderFromQuote,
    showToast
  } = useApp();
  const quoteId = searchParams.get('quote') || '';
  const selectedQuote = quotes.find((record) => record.id === quoteId || record.quoteNumber === quoteId);
  const acceptedQuotes = quotes.filter((quote) => quote.status === 'Accepted');

  const [buyerPoReference, setBuyerPoReference] = useState('ABC-PO-INT-2026-001');
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState(
    selectedQuote?.estimatedDelivery || '2026-09-30'
  );
  const [shippingAddress, setShippingAddress] = useState(
    `${currentBuyer.address}, ${currentBuyer.city || 'Phnom Penh'}`
  );
  const [internalBuyerNotes, setInternalBuyerNotes] = useState(
    'Receiving team requires pallet labels and serial-number list before delivery.'
  );
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  const quoteTotal = selectedQuote ? getQuoteTotal(selectedQuote) : 0;
  const quoteSubtotal = selectedQuote ? getQuoteSubtotal(selectedQuote) : 0;
  const quoteExpiry = selectedQuote ? getQuoteExpiryState(selectedQuote) : null;
  const creditCheck = buildCreditCheck(currentBuyer, quoteTotal);
  const inventoryAllocations = useMemo(
    () =>
      selectedQuote
        ? selectedQuote.items.map((item) =>
            buildStockAllocation(
              {
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity
              },
              item.productId ? mockBuyerWarehouseAvailability[item.productId] : []
            )
          )
        : [],
    [selectedQuote]
  );
  const moqFailures =
    selectedQuote?.items.filter((item) => item.moq && item.quantity < item.moq) || [];
  const buyerApproved = isBuyerApprovedForPO(currentBuyer);
  const quoteAccepted = selectedQuote?.status === 'Accepted';
  const isBlocked =
    !selectedQuote || !buyerApproved || !quoteAccepted || !!quoteExpiry?.isExpired || moqFailures.length > 0;

  const itemColumns: Column<QuoteItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (item) => (
        <div className="min-w-[240px]">
          <div className="font-semibold text-slate-900">{item.productName}</div>
          <div className="font-mono text-xs font-bold text-blue-600">{item.sku}</div>
          <div className="mt-1 text-xs text-slate-500">MOQ {item.moq || 'N/A'}</div>
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
      header: 'Final Unit Price',
      align: 'right',
      accessor: (item) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{formatCurrency(getQuoteUnitPrice(item))}</div>
          <div className="text-xs text-slate-500">Negotiated</div>
        </div>
      )
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-extrabold text-blue-700">
          {formatCurrency(item.subtotal || item.quantity * getQuoteUnitPrice(item))}
        </span>
      )
    }
  ];

  const buildPOPayload = () => ({
    buyerPoReference,
    requestedDeliveryDate,
    expectedDeliveryDate: requestedDeliveryDate,
    shippingAddress,
    billingAddress: currentBuyer.address,
    internalBuyerNotes,
    attachments: attachmentNames,
    paymentTerms: selectedQuote?.paymentTerms || currentBuyer.paymentTerms
  });

  const handleSaveDraft = () => {
    if (!selectedQuote) return;
    const po = savePurchaseOrderDraft(selectedQuote.id, buildPOPayload());
    if (po) navigate(`/buyer/purchase-orders/${po.id}`);
  };

  const handleConfirm = () => {
    if (isBlocked || !selectedQuote) {
      showToast('Resolve blocked checks before confirming the purchase order.', 'warning');
      return;
    }
    const po = createPurchaseOrderFromQuote(selectedQuote.id, buildPOPayload());
    if (po) navigate('/buyer/purchase-orders');
  };

  if (!selectedQuote) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Create Purchase Order"
          subtitle="Start from an accepted quote to prefill purchase-order details."
          breadcrumbs={[
            { label: 'Buyer Portal', href: '/buyer/dashboard' },
            { label: 'Purchase Orders', href: '/buyer/purchase-orders' },
            { label: 'Create PO' }
          ]}
          actions={
            <Link to="/buyer/purchase-orders">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
          }
        />

        {acceptedQuotes.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No accepted quotes ready for PO creation"
            description="Accept a valid quote before creating a purchase order."
            actionText="View Quotes"
            actionIcon={FileSpreadsheet}
            onAction={() => navigate('/buyer/quotes')}
          />
        ) : (
          <Card title="Accepted Quotes">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {acceptedQuotes.map((quote) => (
                <Link
                  key={quote.id}
                  to={`/buyer/purchase-orders/new?quote=${quote.id}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs font-bold text-blue-700">{getQuoteNumber(quote)}</div>
                      <div className="mt-1 font-semibold text-slate-900">{formatCurrency(getQuoteTotal(quote))}</div>
                      <div className="text-xs text-slate-500">Valid until {quote.validUntil || quote.expiryDate}</div>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Create Purchase Order"
        subtitle={`Prefilled from accepted quote ${getQuoteNumber(selectedQuote)}.`}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Purchase Orders', href: '/buyer/purchase-orders' },
          { label: 'Create PO' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/buyer/quotes/${selectedQuote.id}`}>
              <Button variant="outline" size="sm" icon={FileSpreadsheet}>
                View Quote
              </Button>
            </Link>
            <Link to="/buyer/purchase-orders">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Cancel
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card title="Accepted Quote Reference">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Quote</div>
                <div className="mt-2 font-mono font-extrabold text-blue-700">{getQuoteNumber(selectedQuote)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Buyer</div>
                <div className="mt-2 font-bold text-slate-900">{currentBuyer.companyName}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</div>
                <div className="mt-2"><StatusBadge status={selectedQuote.status} /></div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Grand Total</div>
                <div className="mt-2 font-mono font-extrabold text-slate-900">{formatCurrency(quoteTotal)}</div>
              </div>
            </div>
          </Card>

          <Card title="Products & Final Pricing">
            <DataTable columns={itemColumns} data={selectedQuote.items} compact />
            <div className="mt-5 flex justify-end">
              <div className="w-full max-w-sm space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">{formatCurrency(quoteSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="font-mono font-semibold">{formatCurrency(selectedQuote.tax || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="font-mono font-semibold">-{formatCurrency(selectedQuote.discount || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-mono font-semibold">{formatCurrency(selectedQuote.shipping || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                  <span>Grand Total</span>
                  <span className="font-mono text-blue-700">{formatCurrency(quoteTotal)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Purchase Order Details">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Buyer PO reference"
                value={buyerPoReference}
                onChange={(event) => setBuyerPoReference(event.target.value)}
                placeholder="Internal PO number"
              />
              <Input
                label="Requested delivery date"
                type="date"
                value={requestedDeliveryDate}
                onChange={(event) => setRequestedDeliveryDate(event.target.value)}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Shipping address"
                  rows={2}
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Internal buyer notes"
                  rows={3}
                  value={internalBuyerNotes}
                  onChange={(event) => setInternalBuyerNotes(event.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <FileUpload
                  label="Attachment upload"
                  multiple
                  helperText="Attach buyer PO, approval memo, or delivery schedule."
                  onFilesSelected={(files) => setAttachmentNames(files.map((file) => file.name))}
                />
              </div>
            </div>
          </Card>

          <InventoryAllocationSummary allocations={inventoryAllocations} />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card title="Validation Checks">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Buyer Status</div>
                  <div className="text-sm font-semibold text-slate-900">{currentBuyer.status}</div>
                </div>
                <StatusBadge status={buyerApproved ? 'Passed' : 'Exceeded'} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Quote Status</div>
                  <div className="text-sm font-semibold text-slate-900">{selectedQuote.status}</div>
                </div>
                <StatusBadge status={quoteAccepted ? 'Passed' : 'Exceeded'} />
              </div>
              <QuoteExpiryNotice quote={selectedQuote} compact />
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">MOQ Check</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {moqFailures.length === 0 ? 'All quantities valid' : `${moqFailures.length} issue(s)`}
                  </div>
                </div>
                <StatusBadge status={moqFailures.length === 0 ? 'Passed' : 'Exceeded'} />
              </div>
            </div>
          </Card>

          <CreditValidationCard creditCheck={creditCheck} />

          {creditCheck.status === 'Approval Required' && (
            <Alert type="warning" title="Manager approval may be required">
              Credit shortfall: {formatCurrency(creditCheck.shortfall)}. The PO can be submitted
              into pending approval.
            </Alert>
          )}

          {isBlocked && (
            <Alert type="error" title="PO confirmation blocked">
              Buyer approval, accepted quote status, quote validity, and MOQ compliance are required
              before confirmation.
            </Alert>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="md" icon={Save} onClick={handleSaveDraft} disabled={!quoteAccepted}>
                Save Draft
              </Button>
              <Button variant="primary" size="md" icon={CheckCircle2} onClick={handleConfirm} disabled={isBlocked}>
                Confirm Purchase Order
              </Button>
              <Link to="/buyer/purchase-orders">
                <Button variant="ghost" size="md" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
