import { Quote, QuoteItem, RFQ } from '../types';

const MOCK_TODAY = new Date('2026-08-18T00:00:00');

export const getRfqNumber = (rfq: RFQ) => rfq.rfqNumber || rfq.id;

export const getQuoteNumber = (quote: Quote) => quote.quoteNumber || quote.id;

export const getRfqTargetBudget = (rfq: RFQ) =>
  rfq.targetBudget ||
  rfq.targetValue ||
  rfq.items.reduce((sum, item) => sum + item.quantity * item.targetPrice, 0);

export const getRfqTotalQuantity = (rfq: RFQ) =>
  rfq.totalQuantity || rfq.items.reduce((sum, item) => sum + item.quantity, 0);

export const getQuoteSubtotal = (quote: Quote) =>
  quote.subtotal ||
  quote.items.reduce(
    (sum, item) => sum + (item.subtotal || item.quantity * (item.quotedUnitPrice || item.unitPrice || 0)),
    0
  );

export const getQuoteTotal = (quote: Quote) =>
  quote.totalAmount || quote.total || getQuoteSubtotal(quote);

export const getQuoteUnitPrice = (item: QuoteItem) => item.quotedUnitPrice || item.unitPrice || 0;

export const getQuotePriceDelta = (item: QuoteItem) => {
  const target = item.buyerTargetPrice || 0;
  const quoted = getQuoteUnitPrice(item);

  return {
    target,
    quoted,
    delta: quoted - target,
    deltaPercent: target > 0 ? Math.round(((quoted - target) / target) * 100) : 0
  };
};

export const getDaysUntilDate = (dateString?: string, referenceDate = MOCK_TODAY) => {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return Math.ceil((parsed.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const getQuoteExpiryState = (quote: Quote) => {
  const expiryDate = quote.validUntil || quote.expiryDate;
  const daysRemaining = getDaysUntilDate(expiryDate);
  const isExpired = quote.status === 'Expired' || (daysRemaining !== null && daysRemaining < 0);

  if (isExpired) {
    return {
      expiryDate,
      daysRemaining,
      label: 'Expired',
      tone: 'danger' as const,
      isExpired: true,
      isExpiringSoon: false
    };
  }

  if (daysRemaining === 0) {
    return {
      expiryDate,
      daysRemaining,
      label: 'Expires today',
      tone: 'warning' as const,
      isExpired: false,
      isExpiringSoon: true
    };
  }

  if (daysRemaining !== null && daysRemaining <= 3) {
    return {
      expiryDate,
      daysRemaining,
      label: `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
      tone: 'warning' as const,
      isExpired: false,
      isExpiringSoon: true
    };
  }

  return {
    expiryDate,
    daysRemaining,
    label: expiryDate ? `Valid until ${expiryDate}` : 'Validity not set',
    tone: 'neutral' as const,
    isExpired: false,
    isExpiringSoon: false
  };
};

export const isQuoteDecisionOpen = (quote: Quote) => {
  const expiry = getQuoteExpiryState(quote);
  const actionStatuses = ['Sent', 'Quoted', 'Viewed', 'Negotiating'];

  return !expiry.isExpired && actionStatuses.includes(quote.status);
};
