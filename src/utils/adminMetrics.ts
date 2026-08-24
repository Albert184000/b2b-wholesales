import {
  BuyerApplication,
  BuyerCompany,
  Contract,
  InventoryItem,
  Invoice,
  Product,
  PurchaseOrder,
  RFQ,
  Shipment
} from '../types';
import {
  getInvoiceAgingDays,
  getInvoiceBalance,
  getInvoicePaidAmount,
  getInvoiceTotal,
  isInvoiceOverdue
} from './financeLogistics';

export const getPendingBuyerApprovalCount = (applications: BuyerApplication[]) =>
  applications.filter((application) => !['Approved', 'Rejected'].includes(application.status)).length;

export type AdminDashboardDateRange = 'today' | 'last7' | 'last30' | 'quarter' | 'year';

export const ADMIN_DASHBOARD_REFERENCE_DATE = new Date('2026-08-19T00:00:00');

export const adminDashboardDateRangeOptions: { value: AdminDashboardDateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

export interface AdminDashboardSourceData {
  buyers: BuyerCompany[];
  products: Product[];
  rfqs: RFQ[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  buyerApplications: BuyerApplication[];
  contracts: Contract[];
}

export interface AdminDashboardBucket {
  label: string;
  start: Date;
  end: Date;
}

const dayMs = 24 * 60 * 60 * 1000;
const activeBuyerStatuses = new Set(['Approved', 'Active']);
const activeProductStatuses = new Set(['Active', 'Low Stock']);
const openRfqStatuses = new Set(['Submitted', 'Under Review', 'Quoted', 'Negotiating']);
const activePoStatuses = new Set([
  'Pending Approval',
  'Approved',
  'Processing',
  'Stock Allocated',
  'Partially Shipped'
]);
const inTransitShipmentStatuses = new Set(['In Transit', 'Dispatched', 'Out for Delivery', 'Partially Shipped']);
const finalShipmentStatuses = new Set(['Delivered', 'Completed', 'Cancelled']);

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const endOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const parseAdminDate = (value?: string) => {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.split(' ')[0];
  const parsed = new Date(normalized.includes('T') ? normalized : `${normalized}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getAdminDateRangeStart = (
  range: AdminDashboardDateRange,
  referenceDate = ADMIN_DASHBOARD_REFERENCE_DATE
) => {
  const reference = startOfDay(referenceDate);

  if (range === 'today') return reference;
  if (range === 'last7') return new Date(reference.getTime() - 6 * dayMs);
  if (range === 'last30') return new Date(reference.getTime() - 29 * dayMs);
  if (range === 'quarter') {
    const quarterStartMonth = Math.floor(reference.getMonth() / 3) * 3;
    return new Date(reference.getFullYear(), quarterStartMonth, 1);
  }

  return new Date(reference.getFullYear(), 0, 1);
};

export const getAdminDateRangeBounds = (
  range: AdminDashboardDateRange,
  referenceDate = ADMIN_DASHBOARD_REFERENCE_DATE
) => ({
  start: getAdminDateRangeStart(range, referenceDate),
  end: endOfDay(referenceDate)
});

export const isAdminDateInRange = (
  value: string | undefined,
  range: AdminDashboardDateRange,
  referenceDate = ADMIN_DASHBOARD_REFERENCE_DATE
) => {
  const date = parseAdminDate(value);
  if (!date) return false;

  const { start, end } = getAdminDateRangeBounds(range, referenceDate);
  return date >= start && date <= end;
};

const isBetweenDates = (value: string | undefined, start: Date, end: Date) => {
  const date = parseAdminDate(value);
  return Boolean(date && date >= start && date <= end);
};

const formatBucketLabel = (date: Date, range: AdminDashboardDateRange) => {
  if (range === 'today' || range === 'last7') {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
};

const buildDateBuckets = (
  range: AdminDashboardDateRange,
  referenceDate = ADMIN_DASHBOARD_REFERENCE_DATE
): AdminDashboardBucket[] => {
  const { start, end } = getAdminDateRangeBounds(range, referenceDate);

  if (range === 'today') {
    return [{ label: 'Today', start, end }];
  }

  if (range === 'last7') {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(start.getTime() + index * dayMs);
      return {
        label: formatBucketLabel(date, range),
        start: startOfDay(date),
        end: endOfDay(date)
      };
    });
  }

  if (range === 'last30') {
    return Array.from({ length: 5 }).map((_, index) => {
      const bucketStart = new Date(start.getTime() + index * 6 * dayMs);
      const bucketEnd = index === 4 ? end : endOfDay(new Date(bucketStart.getTime() + 5 * dayMs));
      return {
        label: `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(bucketStart)}`,
        start: bucketStart,
        end: bucketEnd
      };
    });
  }

  const buckets: AdminDashboardBucket[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = endOfDay(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
    buckets.push({
      label: formatBucketLabel(cursor, range),
      start: bucketStart,
      end: bucketEnd > end ? end : bucketEnd
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
};

const getPurchaseOrderTotal = (po: PurchaseOrder) =>
  po.grandTotal ??
  po.totalAmount ??
  po.subtotal ??
  po.items.reduce((sum, item) => sum + (item.subtotal ?? item.quantity * item.unitPrice), 0);

const getRfqValue = (rfq: RFQ) =>
  rfq.targetBudget ??
  rfq.targetValue ??
  rfq.items.reduce((sum, item) => sum + (item.totalEstimate ?? item.quantity * item.targetPrice), 0);

const getInvoiceRevenue = (invoice: Invoice) => {
  const paidAmount = getInvoicePaidAmount(invoice);
  if (paidAmount > 0) return paidAmount;
  return invoice.status === 'Paid' ? getInvoiceTotal(invoice) : 0;
};

const getTrend = (current: number, previous: number) => {
  if (previous <= 0 && current <= 0) return '0%';
  if (previous <= 0) return '+100%';

  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? '+' : ''}${change}%`;
};

const getPreviousRangeBounds = (range: AdminDashboardDateRange, referenceDate = ADMIN_DASHBOARD_REFERENCE_DATE) => {
  const { start, end } = getAdminDateRangeBounds(range, referenceDate);
  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return { start: previousStart, end: previousEnd };
};

export const buildAdminDashboardMetrics = (
  source: AdminDashboardSourceData,
  range: AdminDashboardDateRange,
  referenceDate = ADMIN_DASHBOARD_REFERENCE_DATE
) => {
  const { buyers, products, rfqs, purchaseOrders, invoices, shipments, inventory, buyerApplications, contracts } = source;
  const rangeBounds = getAdminDateRangeBounds(range, referenceDate);
  const previousBounds = getPreviousRangeBounds(range, referenceDate);
  const buckets = buildDateBuckets(range, referenceDate);

  const periodPurchaseOrders = purchaseOrders.filter((po) => isBetweenDates(po.orderDate, rangeBounds.start, rangeBounds.end));
  const previousPurchaseOrders = purchaseOrders.filter((po) =>
    isBetweenDates(po.orderDate, previousBounds.start, previousBounds.end)
  );
  const periodInvoices = invoices.filter((invoice) =>
    isBetweenDates(invoice.issueDate, rangeBounds.start, rangeBounds.end)
  );
  const previousInvoices = invoices.filter((invoice) =>
    isBetweenDates(invoice.issueDate, previousBounds.start, previousBounds.end)
  );
  const periodRfqs = rfqs.filter((rfq) =>
    isBetweenDates(rfq.createdDate || rfq.createdAt, rangeBounds.start, rangeBounds.end)
  );
  const periodBuyers = buyers.filter((buyer) => isBetweenDates(buyer.joinedDate, rangeBounds.start, rangeBounds.end));

  const activeBuyers = buyers.filter((buyer) => activeBuyerStatuses.has(buyer.status)).length;
  const activeProducts = products.filter((product) => activeProductStatuses.has(product.status)).length;
  const pendingApprovals = getPendingBuyerApprovalCount(buyerApplications);
  const openRfqs = rfqs.filter((rfq) => openRfqStatuses.has(rfq.status)).length;
  const activePurchaseOrders = periodPurchaseOrders.filter((po) => activePoStatuses.has(po.status)).length;
  const outstandingInvoices = invoices.filter((invoice) => getInvoiceBalance(invoice) > 0 && invoice.status !== 'Draft');
  const overdueInvoices = outstandingInvoices.filter((invoice) => isInvoiceOverdue(invoice, referenceDate));
  const lowStockItems = inventory.filter(
    (item) => item.available <= item.reorderPoint || ['Low Stock', 'Out of Stock'].includes(item.status)
  );
  const shipmentsInTransit = shipments.filter((shipment) => inTransitShipmentStatuses.has(shipment.status));
  const delayedShipments = shipments.filter((shipment) => {
    if (['Delayed', 'Delivery Issue'].includes(shipment.status)) return true;
    if (finalShipmentStatuses.has(shipment.status)) return false;
    const estimatedDelivery = parseAdminDate(shipment.estimatedDelivery);
    return Boolean(estimatedDelivery && estimatedDelivery < startOfDay(referenceDate));
  });
  const contractsNearExpiry = contracts.filter((contract) => {
    if (['Expired', 'Terminated', 'Completed'].includes(contract.status)) return false;
    const endDate = parseAdminDate(contract.endDate);
    if (!endDate) return contract.status === 'Pending Signature';
    const daysRemaining = Math.ceil((endDate.getTime() - startOfDay(referenceDate).getTime()) / dayMs);
    return contract.status === 'Near Expiry' || contract.status === 'Pending Signature' || (daysRemaining >= 0 && daysRemaining <= 45);
  });
  const buyersMissingDocuments = buyerApplications.filter(
    (application) =>
      application.documentStatus === 'Missing' ||
      application.documents.some((document) => ['Pending', 'Expired'].includes(document.verificationStatus))
  );

  const totalRevenue = periodInvoices.reduce((sum, invoice) => sum + getInvoiceRevenue(invoice), 0);
  const previousRevenue = previousInvoices.reduce((sum, invoice) => sum + getInvoiceRevenue(invoice), 0);
  const totalPurchaseOrderAmount = periodPurchaseOrders.reduce((sum, po) => sum + getPurchaseOrderTotal(po), 0);
  const outstandingInvoicesTotal = outstandingInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);

  const revenueTrendData = buckets.map((bucket) => {
    const bucketRevenue = invoices
      .filter((invoice) => isBetweenDates(invoice.issueDate, bucket.start, bucket.end))
      .reduce((sum, invoice) => sum + getInvoiceRevenue(invoice), 0);
    const bucketDuration = bucket.end.getTime() - bucket.start.getTime();
    const previousBucketEnd = new Date(bucket.start.getTime() - 1);
    const previousBucketStart = new Date(previousBucketEnd.getTime() - bucketDuration);
    const previousBucketRevenue = invoices
      .filter((invoice) => isBetweenDates(invoice.issueDate, previousBucketStart, previousBucketEnd))
      .reduce((sum, invoice) => sum + getInvoiceRevenue(invoice), 0);

    return {
      period: bucket.label,
      revenue: bucketRevenue,
      previous: previousBucketRevenue
    };
  });

  const purchaseOrderVolumeData = buckets.map((bucket) => ({
    period: bucket.label,
    orders: purchaseOrders.filter((po) => isBetweenDates(po.orderDate, bucket.start, bucket.end)).length,
    rfqs: rfqs.filter((rfq) => isBetweenDates(rfq.createdDate || rfq.createdAt, bucket.start, bucket.end)).length
  }));

  const buyerGrowthData = buckets.map((bucket) => ({
    period: bucket.label,
    newBuyers: buyers.filter((buyer) => isBetweenDates(buyer.joinedDate, bucket.start, bucket.end)).length,
    activeBuyers: buyers.filter((buyer) => {
      const joinedDate = parseAdminDate(buyer.joinedDate);
      return activeBuyerStatuses.has(buyer.status) && Boolean(joinedDate && joinedDate <= bucket.end);
    }).length
  }));

  const rfqConversionData = [
    { stage: 'Submitted', value: periodRfqs.length },
    { stage: 'Reviewed', value: periodRfqs.filter((rfq) => rfq.status !== 'Submitted' && rfq.status !== 'Draft').length },
    { stage: 'Quoted', value: periodRfqs.filter((rfq) => ['Quoted', 'Negotiating', 'Accepted'].includes(rfq.status)).length },
    { stage: 'Accepted', value: periodRfqs.filter((rfq) => rfq.status === 'Accepted').length },
    { stage: 'Converted to PO', value: periodPurchaseOrders.filter((po) => Boolean(po.rfqNumber)).length }
  ];

  const invoiceStatusData = [
    { name: 'Paid', value: invoices.filter((invoice) => invoice.status === 'Paid').length, color: '#059669' },
    {
      name: 'Outstanding',
      value: outstandingInvoices.filter((invoice) => !isInvoiceOverdue(invoice, referenceDate)).length,
      color: '#2563eb'
    },
    { name: 'Overdue', value: overdueInvoices.length, color: '#ef4444' },
    { name: 'Draft', value: invoices.filter((invoice) => invoice.status === 'Draft').length, color: '#94a3b8' }
  ];

  return {
    rangeBounds,
    periodLabel: adminDashboardDateRangeOptions.find((option) => option.value === range)?.label || 'Selected Period',
    totalRevenue,
    revenueTrend: getTrend(totalRevenue, previousRevenue),
    totalPurchaseOrders: periodPurchaseOrders.length,
    purchaseOrderTrend: getTrend(periodPurchaseOrders.length, previousPurchaseOrders.length),
    totalPurchaseOrderAmount,
    activeBuyers,
    newBuyersInPeriod: periodBuyers.length,
    activeProducts,
    pendingApprovals,
    openRfqs,
    openRfqValue: rfqs.filter((rfq) => openRfqStatuses.has(rfq.status)).reduce((sum, rfq) => sum + getRfqValue(rfq), 0),
    activePurchaseOrders,
    outstandingInvoices,
    outstandingInvoicesTotal,
    overdueInvoices,
    lowStockItems,
    shipmentsInTransit,
    contractsNearExpiry,
    buyersMissingDocuments,
    delayedShipments,
    recentPurchaseOrders: [...purchaseOrders]
      .sort((a, b) => (parseAdminDate(b.orderDate)?.getTime() || 0) - (parseAdminDate(a.orderDate)?.getTime() || 0))
      .slice(0, 6),
    pendingApplications: [...buyerApplications]
      .filter((application) => !['Approved', 'Rejected'].includes(application.status))
      .sort(
        (a, b) =>
          (parseAdminDate(b.submittedDate)?.getTime() || 0) - (parseAdminDate(a.submittedDate)?.getTime() || 0)
      )
      .slice(0, 6),
    revenueTrendData,
    purchaseOrderVolumeData,
    rfqConversionData,
    invoiceStatusData,
    buyerGrowthData
  };
};

export const getDashboardDaysOverdue = (invoice: Invoice, referenceDate = ADMIN_DASHBOARD_REFERENCE_DATE) =>
  Math.max(0, getInvoiceAgingDays(invoice, referenceDate));
