export type UserRole =
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'ACCOUNT_EXECUTIVE'
  | 'VERIFIED_BUYER'
  | 'GUEST'
  | 'Super Admin'
  | 'Sales Manager'
  | 'Warehouse Manager'
  | 'Finance Officer';

export type BuyerGroup = 'Standard' | 'Corporate' | 'VIP' | 'Distributor' | 'Tier-1 Gold' | 'Tier-2 Silver' | 'Standard Wholesale';

export type PaymentTerms =
  | 'Net 30'
  | 'Net 60'
  | 'Advance Wire'
  | 'Net 30 Days'
  | 'Net 60 Days'
  | 'Net 30 Days Credit'
  | '100% Advance Wire Transfer'
  | string;

export type SemanticStatus =
  | 'Approved'
  | 'Paid'
  | 'Completed'
  | 'Delivered'
  | 'Verified'
  | 'Good Standing'
  | 'Active'
  | 'Accepted'
  | 'Converted'
  | 'Default'
  | 'Stock Allocated'
  | 'Fully Shipped'
  | 'Renewed'
  | 'Passed'
  | 'In Stock'
  | 'SUCCESS'
  | 'Pending'
  | 'Under Review'
  | 'Additional Documents Required'
  | 'Awaiting Approval'
  | 'Pending Approval'
  | 'Pending Manager Approval'
  | 'Pending Signature'
  | 'Approval Required'
  | 'Renewal Requested'
  | 'Processing'
  | 'Assigned'
  | 'Verification In Progress'
  | 'Issued'
  | 'In Transit'
  | 'Submitted'
  | 'Sent'
  | 'Viewed'
  | 'Quoted'
  | 'Rejected'
  | 'Overdue'
  | 'Cancelled'
  | 'Suspended'
  | 'Credit Hold'
  | 'Draft'
  | 'Archived'
  | 'Inactive'
  | 'Negotiating'
  | 'Partially Shipped'
  | 'Partially Paid'
  | 'Partially Delivered'
  | 'Delayed'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Ready'
  | 'Fulfilled'
  | 'Expired'
  | 'Near Expiry'
  | 'Terminated'
  | 'Exceeded'
  | 'In Progress'
  | 'Pending Dispatch'
  | 'Dispatched'
  | 'INFO'
  | 'Unread'
  | 'Unpaid'
  | 'Due Soon'
  | 'Below MOQ'
  | 'WARNING'
  | 'ALERT'
  | 'Delivery Issue';

export type InvoiceStatus =
  | 'Draft'
  | 'Issued'
  | 'Partially Paid'
  | 'Paid'
  | 'Due Soon'
  | 'Overdue'
  | 'Cancelled'
  | 'Unpaid'
  | string;

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Reversed' | string;

export type ShipmentStatus =
  | 'Preparing'
  | 'Ready'
  | 'Dispatched'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Partially Delivered'
  | 'Delivered'
  | 'Delayed'
  | 'Cancelled'
  | 'Pending Dispatch'
  | string;

export type BuyerApprovalStatus =
  | 'Pending'
  | 'Under Review'
  | 'Verification In Progress'
  | 'Additional Documents Required'
  | 'Approved'
  | 'Rejected'
  | string;

export interface TierPrice {
  minQty: number;
  maxQty: number | null; // null means "and above" / "No limit"
  unitPrice: number;
  label?: string;
  effectiveDate?: string;
  status?: 'Active' | 'Inactive' | 'Scheduled' | string;
}

export interface BuyerGroupPricing {
  groupId: string;
  groupName: 'Standard' | 'Corporate' | 'VIP' | 'Distributor';
  discountPercentage: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  specifications: Record<string, string>;
  moq: number;
  unit: string;
  currency: string;
  costPrice: number;
  basePrice: number;
  tierPricing: TierPrice[];
  buyerGroupPricing?: BuyerGroupPricing[];
  inStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  warehouseLocation: string;
  status: 'Active' | 'Draft' | 'Low Stock' | 'Out of Stock' | 'Archived' | string;
  images: string[];
  featured?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  itemCount: number;
  description: string;
}

export interface BuyerDocument {
  name: string;
  type?: string;
  size?: string;
  uploadedDate?: string;
  uploadedAt?: string;
  verified?: boolean;
  status?: string;
  url?: string;
}

export interface CompanyAddress {
  id: string;
  type: 'Registered' | 'Billing' | 'Shipping' | string;
  label: string;
  contactName?: string;
  phone?: string;
  street: string;
  city: string;
  province?: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface BusinessDocument {
  id: string;
  document: string;
  documentNumber: string;
  uploadedDate: string;
  expiry?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Expired' | string;
  fileName?: string;
  fileSize?: string;
}

export interface AccountTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface VerificationItem {
  id: string;
  label: string;
  completed: boolean;
  note?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

export interface CreditProfile {
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  paymentTerms: PaymentTerms;
  accountStanding: 'Good Standing' | 'Credit Hold' | 'Watchlist' | string;
}

export interface BuyerApplication {
  id: string;
  applicationNumber: string;
  buyerId?: string;
  companyName: string;
  businessType: string;
  industry: string;
  registrationNumber: string;
  taxId: string;
  country: string;
  city: string;
  address: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  submittedDate: string;
  documents: BusinessDocument[];
  documentStatus: 'Complete' | 'Missing' | 'Pending Review' | string;
  riskStatus: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Verification Pending' | string;
  assignedReviewer: string;
  assignedAccountExecutive?: string;
  buyerGroup?: BuyerGroup;
  creditProfile?: CreditProfile;
  verificationChecklist: VerificationItem[];
  internalNotes?: string[];
  approvalHistory: ApprovalHistoryEntry[];
  status: BuyerApprovalStatus;
}

export interface BuyerGroupConfig {
  id: string;
  name: BuyerGroup | string;
  description: string;
  buyersCount: number;
  defaultDiscount: number;
  defaultPaymentTerms: PaymentTerms;
  defaultCreditLimit: number;
  pricingRule: string;
  pricingPriority: number;
  status: 'Active' | 'Inactive' | string;
}

export type AdminNotification = NotificationItem;

export interface BuyerCompany {
  id: string;
  companyName: string;
  businessType?: string;
  taxId: string;
  registrationNumber: string;
  contactPerson: string;
  businessEmail?: string;
  email?: string;
  phone: string;
  website?: string;
  industry?: string;
  country?: string;
  city?: string;
  address: string;
  postalCode?: string;
  buyerGroup: BuyerGroup;
  status: 'Approved' | 'Pending' | 'Under Review' | 'Suspended' | 'Rejected' | 'Active' | string;
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  creditReviewDate?: string;
  accountStanding?: 'Good' | 'Good Standing' | 'Watchlist' | 'Hold' | string;
  paymentTerms: PaymentTerms;
  assignedRep: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    title: string;
  };
  joinedDate: string;
  totalPurchases?: number;
  documents: BuyerDocument[];
  addresses?: CompanyAddress[];
  businessDocuments?: BusinessDocument[];
  accountTeam?: AccountTeamMember[];
}

export type Buyer = BuyerCompany;

export interface RFQItem {
  id?: string;
  productId?: string;
  productName: string;
  sku: string;
  moq?: number;
  quantity: number;
  targetPrice: number;
  unitPriceEstimate?: number;
  totalEstimate?: number;
  unit?: string;
  notes?: string;
  requiredDeliveryDate?: string;
  warehouseSummary?: string;
  currentTierLabel?: string;
}

export interface RFQ {
  id: string;
  rfqNumber?: string;
  buyerId: string;
  buyerName: string;
  companyName?: string;
  projectTitle?: string;
  createdDate?: string;
  createdAt?: string;
  expiryDate?: string;
  requiredDeliveryDate?: string;
  shippingAddress?: string;
  currency?: string;
  items: RFQItem[];
  totalQuantity?: number;
  targetValue?: number;
  targetBudget?: number;
  paymentTermsPreference?: string;
  notes?: string;
  attachments?: string[];
  assignedRep?: {
    id: string;
    name: string;
    title: string;
  };
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Quoted' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Expired' | string;
  timeline?: {
    stage: string;
    date: string;
    actor?: string;
    note?: string;
    description?: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | string;
    status?: string;
  }[];
}

export interface NegotiationEntry {
  id: string;
  senderRole: 'BUYER' | 'SALES_REP' | 'SALES_MANAGER' | 'SYSTEM' | string;
  senderName: string;
  timestamp: string;
  proposedPrice?: number;
  quantity?: number;
  message: string;
  actionTaken?: 'SUBMIT_COUNTER' | 'ACCEPT_QUOTE' | 'REJECT_QUOTE' | 'REQUEST_MANAGER_APPROVAL' | 'MANAGER_APPROVED' | string;
  quoteId?: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | string;
  status?: string;
  attachmentName?: string;
}

export interface QuoteItem {
  id?: string;
  productId?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice?: number;
  quotedUnitPrice?: number;
  originalTierPrice?: number;
  buyerTargetPrice?: number;
  subtotal?: number;
  moq?: number;
  estimatedDelivery?: string;
}

export interface Quote {
  id: string;
  quoteNumber?: string;
  rfqId: string;
  rfqNumber?: string;
  buyerId?: string;
  buyerName?: string;
  companyName?: string;
  salesRep?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: QuoteItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  shipping?: number;
  total?: number;
  totalAmount?: number;
  currency?: string;
  paymentTerms: string;
  createdDate?: string;
  createdAt?: string;
  expiryDate?: string;
  validUntil?: string;
  status: 'Draft' | 'Quoted' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Expired' | string;
  negotiationHistory?: NegotiationEntry[];
  estimatedDelivery?: string;
  managerApprovalStatus?: 'Pending' | 'Approved' | 'Rejected' | string;
  notes?: string;
}

export interface PurchaseOrderItem {
  id?: string;
  productId?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  fulfilledQuantity?: number;
  remainingQuantity?: number;
  allocationStatus?: 'Fully Available' | 'Partial Availability' | 'Backorder' | string;
  warehouseAllocation?: StockAllocationWarehouse[];
}

export interface StockAllocationWarehouse {
  warehouseId: string;
  warehouseName: string;
  city?: string;
  available: number;
  allocated: number;
}

export interface StockAllocation {
  productId?: string;
  sku: string;
  productName: string;
  requestedQty: number;
  totalAvailable: number;
  allocatedQty: number;
  backorderQty: number;
  result: 'Fully Available' | 'Partial Availability' | 'Backorder' | string;
  warehouses: StockAllocationWarehouse[];
}

export interface CreditCheck {
  buyerStatus: string;
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  poAmount: number;
  remainingCreditAfterPO: number;
  shortfall: number;
  status: 'Passed' | 'Approval Required' | 'Exceeded' | string;
  message: string;
}

export interface POApproval {
  required: boolean;
  reason?: string;
  status: 'Not Required' | 'Under Review' | 'Approved' | 'Rejected' | string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface PODocument {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  version?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber?: string;
  quoteId?: string;
  quoteNumber?: string;
  rfqNumber?: string;
  buyerId: string;
  buyerName?: string;
  companyName?: string;
  contactPerson?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  requestedDeliveryDate?: string;
  currency?: string;
  items: PurchaseOrderItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  shippingFee?: number;
  grandTotal?: number;
  totalAmount?: number;
  paymentTerms: string;
  shippingAddress: string;
  billingAddress?: string;
  buyerPoReference?: string;
  internalBuyerNotes?: string;
  attachments?: string[];
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Processing' | 'Stock Allocated' | 'Partially Shipped' | 'Fully Shipped' | 'Completed' | 'Cancelled' | 'Fulfilled' | string;
  stockStatus?: 'Allocated' | 'Partial' | 'Pending' | 'Backorder' | string;
  shipmentStatus?: 'Preparing' | 'In Transit' | 'Delivered' | 'Pending' | string;
  assignedRep?: {
    id: string;
    name: string;
    email?: string;
    title?: string;
  };
  approval?: POApproval;
  creditCheck?: CreditCheck;
  inventoryAllocations?: StockAllocation[];
  documents?: PODocument[];
  invoiceId?: string;
  contractId?: string;
  timeline?: {
    stage: string;
    date: string;
    description: string;
    completed: boolean;
    active?: boolean;
  }[];
  activity?: {
    id: string;
    title: string;
    timestamp: string;
    actor: string;
    description: string;
  }[];
}

export interface ContractMilestone {
  id?: string;
  title: string;
  dueDate: string;
  amount?: number;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Overdue' | string;
  completedDate?: string;
  notes?: string;
}

export interface ContractDocument {
  id?: string;
  title: string;
  name?: string;
  type?: string;
  fileSize?: string;
  uploadedDate: string;
  version?: string;
}

export interface Contract {
  id: string;
  contractNumber?: string;
  title: string;
  buyerId: string;
  buyerName?: string;
  companyName?: string;
  buyerGroup?: string;
  poId?: string;
  poNumber?: string;
  quoteId?: string;
  quoteNumber?: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  contractValue?: number;
  currency?: string;
  terms?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  productsCovered?: string[];
  buyerResponsibilities?: string[];
  supplierResponsibilities?: string[];
  assignedRep?: {
    id: string;
    name: string;
    email?: string;
    title?: string;
  };
  status: 'Draft' | 'Pending Approval' | 'Pending Signature' | 'Active' | 'Near Expiry' | 'Expired' | 'Renewed' | 'Terminated' | 'Renewal Requested' | 'Under Review' | 'Completed' | 'Suspended' | string;
  renewalStatus?: 'Not Due' | 'Reminder Sent' | 'Renewal Requested' | 'Renewed' | string;
  renewalRequest?: {
    requestedNewEndDate: string;
    reason: string;
    message: string;
    requestedAt: string;
  };
  milestones?: ContractMilestone[];
  documents?: ContractDocument[];
  activityTimeline?: {
    stage: string;
    date: string;
    actor?: string;
    description: string;
  }[];
}

export interface InvoiceItem {
  id?: string;
  productId?: string;
  sku?: string;
  description?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  subtotal?: number;
  amount?: number;
}

export interface Payment {
  id: string;
  paymentId?: string;
  invoiceId: string;
  date: string;
  method: string;
  amount: number;
  reference: string;
  status: PaymentStatus;
}

export interface CreditActivity {
  id: string;
  buyerId: string;
  date: string;
  activity: string;
  reference: string;
  debit?: number;
  credit?: number;
  balance: number;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  poId?: string;
  poNumber?: string;
  quoteId?: string;
  quoteNumber?: string;
  contractId?: string;
  contractNumber?: string;
  shipmentIds?: string[];
  buyerId: string;
  buyerName?: string;
  companyName?: string;
  contactPerson?: string;
  taxId?: string;
  billingAddress?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  currency?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  taxAmount?: number;
  discount?: number;
  shipping?: number;
  total?: number;
  totalAmount?: number;
  paidAmount?: number;
  balanceDue?: number;
  payments?: Payment[];
  activity?: {
    id: string;
    title: string;
    timestamp: string;
    actor: string;
    description: string;
  }[];
  status: InvoiceStatus;
}

export interface TrackingEvent {
  id?: string;
  status: string;
  location?: string;
  timestamp?: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
}

export type ShipmentEvent = TrackingEvent;

export interface ShipmentItem {
  id?: string;
  productId?: string;
  sku: string;
  productName: string;
  orderedQty: number;
  shippedQty: number;
  deliveredQty: number;
  remainingQty?: number;
  quantity?: number;
  unit?: string;
}

export interface Shipment {
  id: string;
  shipmentNumber?: string;
  poId?: string;
  poNumber?: string;
  invoiceId?: string;
  contractId?: string;
  buyerId?: string;
  companyName?: string;
  warehouseId?: string;
  warehouseName?: string;
  originWarehouse?: string;
  originAddress?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  destinationAddress?: string;
  carrier: string;
  trackingNumber: string;
  dispatchDate?: string;
  shipDate?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  packagesCount?: number;
  warehouse?: string;
  serviceLevel?: string;
  deliveryWindow?: string;
  totalOrdered?: number;
  totalShipped?: number;
  totalDelivered?: number;
  relatedShipmentIds?: string[];
  status: ShipmentStatus;
  items?: ShipmentItem[];
  timeline?: TrackingEvent[];
  proofOfDelivery?: {
    receivedBy: string;
    timestamp: string;
    notes?: string;
    status?: 'Available' | 'Pending' | 'Not Required' | string;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  status?: string;
  totalProductsCount?: number;
  stockUnitsTotal?: number;
  reservedUnits?: number;
  lowStockItemsCount?: number;
  capacityUtilization?: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  location?: string;
  locationBin?: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  unitCost: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock' | string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  companyName?: string;
  avatar?: string;
  status?: 'Active' | 'Inactive' | 'Suspended' | string;
  lastActive?: string;
}

export type User = UserAccount;

export interface ActivityLog {
  id: string;
  userId?: string;
  user?: string;
  userName?: string;
  userRole?: string;
  action: string;
  module?: 'AUTH' | 'BUYERS' | 'CATALOG' | 'RFQS' | 'QUOTES' | 'ORDERS' | 'CONTRACTS' | 'INVENTORY' | 'FINANCE' | 'LOGISTICS' | 'SYSTEM' | string;
  recordId?: string;
  recordType?: string;
  details?: string;
  description?: string;
  ipAddress?: string;
  oldValue?: Record<string, string | number | boolean | null>;
  newValue?: Record<string, string | number | boolean | null>;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
}
