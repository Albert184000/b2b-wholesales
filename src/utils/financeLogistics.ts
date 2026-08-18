import { CreditActivity, Invoice, Shipment } from '../types';

export const BUYER_PORTAL_REFERENCE_DATE = new Date('2026-08-18T00:00:00');

export const getInvoiceNumber = (invoice: Invoice) => invoice.invoiceNumber || invoice.id.toUpperCase();

export const getInvoiceTotal = (invoice: Invoice) => invoice.totalAmount ?? invoice.total ?? 0;

export const getInvoicePaidAmount = (invoice: Invoice) =>
  invoice.paidAmount ??
  (invoice.payments || [])
    .filter((payment) => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

export const getInvoiceBalance = (invoice: Invoice) =>
  Math.max(0, invoice.balanceDue ?? getInvoiceTotal(invoice) - getInvoicePaidAmount(invoice));

export const getInvoiceAgingDays = (
  invoice: Invoice,
  referenceDate: Date = BUYER_PORTAL_REFERENCE_DATE
) => {
  const dueDate = new Date(`${invoice.dueDate}T00:00:00`);
  return Math.ceil((referenceDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const isInvoiceDueSoon = (
  invoice: Invoice,
  referenceDate: Date = BUYER_PORTAL_REFERENCE_DATE,
  days = 7
) => {
  const dueDate = new Date(`${invoice.dueDate}T00:00:00`);
  const daysUntilDue = Math.ceil((dueDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  return getInvoiceBalance(invoice) > 0 && daysUntilDue >= 0 && daysUntilDue <= days;
};

export const isInvoiceOverdue = (
  invoice: Invoice,
  referenceDate: Date = BUYER_PORTAL_REFERENCE_DATE
) => getInvoiceBalance(invoice) > 0 && getInvoiceAgingDays(invoice, referenceDate) > 0;

export const getCreditAvailable = (creditLimit: number, usedCredit: number) =>
  Math.max(0, creditLimit - usedCredit);

export const getCreditUtilization = (creditLimit: number, usedCredit: number) =>
  creditLimit > 0 ? Math.round((usedCredit / creditLimit) * 100) : 0;

export const getCreditActivityAmount = (activity: CreditActivity) =>
  (activity.credit || 0) - (activity.debit || 0);

export const getShipmentTotals = (shipment: Shipment) => {
  const ordered =
    shipment.totalOrdered ??
    (shipment.items || []).reduce((sum, item) => sum + (item.orderedQty || item.quantity || 0), 0);
  const shipped =
    shipment.totalShipped ??
    (shipment.items || []).reduce((sum, item) => sum + (item.shippedQty || 0), 0);
  const delivered =
    shipment.totalDelivered ??
    (shipment.items || []).reduce((sum, item) => sum + (item.deliveredQty || 0), 0);

  return {
    ordered,
    shipped,
    delivered,
    remaining: Math.max(0, ordered - delivered)
  };
};

export const getShipmentRemaining = (shipment: Shipment) => getShipmentTotals(shipment).remaining;

export const getShipmentProgress = (shipment: Shipment) => {
  const { ordered, delivered } = getShipmentTotals(shipment);
  return ordered > 0 ? Math.round((delivered / ordered) * 100) : 0;
};
