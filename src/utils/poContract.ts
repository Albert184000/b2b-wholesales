import {
  BuyerCompany,
  Contract,
  CreditCheck,
  PurchaseOrder,
  PurchaseOrderItem,
  Quote,
  StockAllocation
} from '../types';

const MOCK_TODAY = new Date('2026-08-18T00:00:00');

export const getPONumber = (po: PurchaseOrder) => po.poNumber || po.id;

export const getContractNumber = (contract: Contract) => contract.contractNumber || contract.id;

export const getPOItemSubtotal = (item: PurchaseOrderItem) =>
  item.subtotal || item.quantity * item.unitPrice;

export const getPOSubtotal = (po: PurchaseOrder) =>
  po.subtotal || po.items.reduce((sum, item) => sum + getPOItemSubtotal(item), 0);

export const getPOTotal = (po: PurchaseOrder) =>
  po.grandTotal || po.totalAmount || getPOSubtotal(po);

export const getQuoteConversionTotal = (quote: Quote) =>
  quote.totalAmount || quote.total || quote.items.reduce(
    (sum, item) => sum + item.quantity * (item.quotedUnitPrice || item.unitPrice || 0),
    0
  );

export const isBuyerApprovedForPO = (buyer: BuyerCompany) =>
  ['Approved', 'Verified', 'Active'].includes(buyer.status);

export const buildCreditCheck = (
  buyer: BuyerCompany,
  poAmount: number,
  buyerStatus = buyer.status
): CreditCheck => {
  const remainingCreditAfterPO = buyer.availableCredit - poAmount;
  const shortfall = Math.max(0, poAmount - buyer.availableCredit);
  const status =
    !isBuyerApprovedForPO({ ...buyer, status: buyerStatus })
      ? 'Exceeded'
      : remainingCreditAfterPO >= 0
      ? 'Passed'
      : poAmount <= buyer.creditLimit
      ? 'Approval Required'
      : 'Exceeded';

  return {
    buyerStatus,
    creditLimit: buyer.creditLimit,
    usedCredit: buyer.usedCredit,
    availableCredit: buyer.availableCredit,
    poAmount,
    remainingCreditAfterPO,
    shortfall,
    status,
    message:
      status === 'Passed'
        ? 'Credit check passed.'
        : status === 'Approval Required'
        ? `Manager approval may be required. Credit shortfall: $${shortfall.toLocaleString()}.`
        : 'Credit limit exceeded or buyer account is not approved for purchase-order creation.'
  };
};

export const buildStockAllocation = (
  item: Pick<PurchaseOrderItem, 'productId' | 'productName' | 'sku' | 'quantity'>,
  availability: {
    warehouseId: string;
    warehouseName: string;
    city: string;
    available: number;
    reserved: number;
  }[] = []
): StockAllocation => {
  let remaining = item.quantity;
  const warehouses = availability.map((warehouse) => {
    const allocated = Math.min(remaining, warehouse.available);
    remaining -= allocated;

    return {
      warehouseId: warehouse.warehouseId,
      warehouseName: warehouse.warehouseName,
      city: warehouse.city,
      available: warehouse.available,
      allocated
    };
  });

  const totalAvailable = availability.reduce((sum, warehouse) => sum + warehouse.available, 0);
  const allocatedQty = item.quantity - Math.max(0, remaining);
  const backorderQty = Math.max(0, remaining);

  return {
    productId: item.productId,
    sku: item.sku,
    productName: item.productName,
    requestedQty: item.quantity,
    totalAvailable,
    allocatedQty,
    backorderQty,
    result:
      backorderQty === 0
        ? 'Fully Available'
        : allocatedQty > 0
        ? 'Partial Availability'
        : 'Backorder',
    warehouses
  };
};

export const getDaysUntil = (dateString?: string, referenceDate = MOCK_TODAY) => {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.ceil((parsed.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const getContractRenewalState = (contract: Contract) => {
  const daysUntilEnd = getDaysUntil(contract.endDate);
  const isNearExpiry = daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 45;
  const isExpired = contract.status === 'Expired' || (daysUntilEnd !== null && daysUntilEnd < 0);

  return {
    daysUntilEnd,
    isNearExpiry,
    isExpired,
    label: isExpired
      ? 'Expired'
      : isNearExpiry
      ? `Expires in ${daysUntilEnd} day${daysUntilEnd === 1 ? '' : 's'}`
      : contract.renewalDate
      ? `Renewal review ${contract.renewalDate}`
      : 'Renewal not due'
  };
};
