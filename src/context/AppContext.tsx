import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  UserRole,
  UserAccount,
  BuyerCompany,
  BuyerGroup,
  PaymentTerms,
  Product,
  RFQ,
  Quote,
  PurchaseOrder,
  Contract,
  Invoice,
  CreditActivity,
  Shipment,
  BuyerApplication,
  BuyerGroupConfig,
  InventoryItem,
  NotificationItem,
  NegotiationEntry
} from '../types';
import {
  mockUsers,
  mockBuyers,
  mockProducts,
  mockRFQs,
  mockQuotes,
  mockPurchaseOrders,
  mockContracts,
  mockInvoices,
  mockCreditActivity,
  mockShipments,
  mockInventory,
  mockBuyerApplications,
  mockBuyerGroups,
  mockAdminDashboardStats,
  mockRecentAdminActivity,
  mockAdminNotifications,
  mockNotifications,
  mockBuyerWarehouseAvailability
} from '../data/mockData';
import { getQuoteExpiryState } from '../utils/rfqQuote';
import { buildCreditCheck, buildStockAllocation, getQuoteConversionTotal } from '../utils/poContract';
import { RoleDefinition, getRoleDisplayName, roleDefinitions } from '../utils/rbac';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  currentUser: UserAccount;
  setCurrentRole: (role: UserRole) => void;
  roles: RoleDefinition[];
  setRoles: React.Dispatch<React.SetStateAction<RoleDefinition[]>>;
  currentBuyer: BuyerCompany;
  products: Product[];
  buyers: BuyerCompany[];
  rfqs: RFQ[];
  quotes: Quote[];
  purchaseOrders: PurchaseOrder[];
  contracts: Contract[];
  invoices: Invoice[];
  creditActivity: CreditActivity[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  buyerApplications: BuyerApplication[];
  buyerGroups: BuyerGroupConfig[];
  adminDashboardStats: typeof mockAdminDashboardStats;
  recentAdminActivity: typeof mockRecentAdminActivity;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Business logic actions
  saveRFQDraft: (rfqData: Partial<RFQ>) => RFQ;
  submitRFQ: (rfqData: Partial<RFQ>) => RFQ;
  generateQuote: (rfqId: string, quoteDetails: { validUntil: string; paymentTerms: PaymentTerms; notes: string; items: any[] }) => Quote;
  counterQuote: (quoteId: string, counterPrice: number, notes: string) => void;
  submitCounterOffer: (quoteId: string, entry: Omit<NegotiationEntry, 'id' | 'timestamp'>) => void;
  acceptQuote: (quoteId: string) => void;
  rejectQuote: (quoteId: string, reason?: string) => void;
  savePurchaseOrderDraft: (quoteId: string, poData: Partial<PurchaseOrder>) => PurchaseOrder | null;
  createPurchaseOrderFromQuote: (quoteId: string, poData: Partial<PurchaseOrder>) => PurchaseOrder | null;
  requestContractRenewal: (contractId: string, request: { requestedNewEndDate: string; reason: string; message: string }) => void;
  approveBuyerRegistration: (buyerId: string, tier?: BuyerGroup, creditLimit?: number, terms?: PaymentTerms) => void;
  rejectBuyerRegistration: (buyerId: string, reason: string) => void;
  updateBuyerCredit: (buyerId: string, newLimit: number) => void;
  updateBuyerAccountStatus: (buyerId: string, status: string) => void;
  updateBuyerPaymentTerms: (buyerId: string, terms: PaymentTerms) => void;
  updateBuyerGroupAssignment: (buyerId: string, buyerGroup: BuyerGroup) => void;
  approveBuyerApplication: (
    applicationId: string,
    config: {
      buyerGroup: BuyerGroup;
      creditLimit: number;
      paymentTerms: PaymentTerms;
      accountExecutive: string;
      internalNote: string;
    }
  ) => void;
  rejectBuyerApplication: (
    applicationId: string,
    reason: string,
    internalNote: string,
    buyerMessage: string
  ) => void;
  requestBuyerApplicationDocuments: (
    applicationId: string,
    requiredDocuments: string[],
    message: string
  ) => void;
  assignBuyerApplicationReviewer: (applicationId: string, reviewer: string) => void;
  updateBuyerApplicationAssignment: (
    applicationId: string,
    assignment: { accountExecutive?: string; buyerGroup?: BuyerGroup }
  ) => void;
  saveBuyerGroup: (group: BuyerGroupConfig) => void;
  deactivateBuyerGroup: (groupId: string) => void;
  saveProduct: (
    product: Product,
    inventoryDetails?: {
      warehouseId: string;
      warehouseName: string;
      locationBin?: string;
      onHand: number;
    }
  ) => void;
  updateProductStatus: (productId: string, status: string) => void;
  updatePOStatus: (poId: string, status: string) => void;
  updateInvoiceStatus: (invoiceId: string, status: string, paidAmount?: number) => void;
  updateShipmentStatus: (shipmentId: string, status: string) => void;
  updateContractStatus: (contractId: string, status: string) => void;
  updateStock: (productId: string, warehouseId: string, newOnHand: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount>(mockUsers[3]); // Default: Sovannarith Keo (Buyer)
  const [currentBuyer, setCurrentBuyer] = useState<BuyerCompany>(mockBuyers[0]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [buyers, setBuyers] = useState<BuyerCompany[]>(mockBuyers);
  const [rfqs, setRfqs] = useState<RFQ[]>(mockRFQs);
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [creditActivity] = useState<CreditActivity[]>(mockCreditActivity);
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [buyerApplications, setBuyerApplications] = useState<BuyerApplication[]>(mockBuyerApplications);
  const [buyerGroups, setBuyerGroups] = useState<BuyerGroupConfig[]>(mockBuyerGroups);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    ...mockAdminNotifications,
    ...mockNotifications
  ]);
  const [roles, setRoles] = useState<RoleDefinition[]>(() =>
    roleDefinitions.map((role) => ({
      ...role,
      permissions: [...role.permissions],
      dashboardFocus: [...role.dashboardFocus]
    }))
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrentRole = (role: UserRole) => {
    const found = mockUsers.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast(`Switched active perspective to ${found.name} (${getRoleDisplayName(found.role, roles)})`, 'info');
    } else {
      // Guest or fallback
      setCurrentUser({
        id: 'usr-guest',
        name: 'Guest Business Visitor',
        email: 'guest@wholesalehub.com',
        role: 'GUEST',
        status: 'Active',
        lastActive: 'Now'
      });
      showToast('Switched to Public Guest perspective', 'info');
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const addNotification = (
    notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const buildRFQRecord = (rfqData: Partial<RFQ>, status: RFQ['status']): RFQ => {
    const count = rfqs.length + 90;
    const dateToday = new Date().toISOString().split('T')[0];
    const itemTotal = (rfqData.items || []).reduce(
      (acc, item) => acc + item.quantity * item.targetPrice,
      0
    );

    return {
      id: `rfq-2026-${count}`,
      rfqNumber: `RFQ-2026-${count}`,
      projectTitle: rfqData.projectTitle || 'Wholesale Volume Procurement',
      buyerId: currentBuyer.id,
      buyerName: currentBuyer.companyName,
      companyName: currentBuyer.companyName,
      createdDate: dateToday,
      createdAt: dateToday,
      expiryDate:
        rfqData.expiryDate ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      requiredDeliveryDate: rfqData.requiredDeliveryDate || '2026-09-30',
      shippingAddress: rfqData.shippingAddress || currentBuyer.address,
      currency: 'USD',
      items: rfqData.items || [],
      totalQuantity: (rfqData.items || []).reduce((acc, i) => acc + i.quantity, 0),
      targetValue: rfqData.targetBudget || itemTotal,
      targetBudget: rfqData.targetBudget || itemTotal,
      paymentTermsPreference: rfqData.paymentTermsPreference || currentBuyer.paymentTerms,
      notes: rfqData.notes || '',
      attachments: rfqData.attachments || [],
      assignedRep: {
        id: currentBuyer.assignedRep.id,
        name: currentBuyer.assignedRep.name,
        title: currentBuyer.assignedRep.title
      },
      status,
      timeline: [
        {
          stage: status === 'Draft' ? 'Draft Saved' : 'RFQ Submitted',
          date: new Date().toLocaleString(),
          actor: `${currentBuyer.contactPerson} (${currentBuyer.companyName})`,
          note:
            status === 'Draft'
              ? 'RFQ draft saved for later submission'
              : 'Request for wholesale quote submitted successfully'
        }
      ]
    };
  };

  const saveRFQDraft = (rfqData: Partial<RFQ>): RFQ => {
    const newRFQ = buildRFQRecord(rfqData, 'Draft');
    setRfqs((prev) => [newRFQ, ...prev]);
    addNotification({
      title: `${newRFQ.rfqNumber} saved as draft`,
      message: 'Your RFQ draft is available in My RFQs and has not been sent to sales.',
      type: 'INFO',
      link: `/buyer/rfqs/${newRFQ.id}`
    });
    showToast(`Draft ${newRFQ.rfqNumber} saved`, 'info');
    return newRFQ;
  };

  const submitRFQ = (rfqData: Partial<RFQ>): RFQ => {
    const newRFQ = buildRFQRecord(rfqData, 'Submitted');
    setRfqs((prev) => [newRFQ, ...prev]);
    addNotification({
      title: `${newRFQ.rfqNumber} submitted`,
      message: 'Your account executive has received the RFQ for wholesale quote review.',
      type: 'SUCCESS',
      link: `/buyer/rfqs/${newRFQ.id}`
    });
    showToast(`RFQ ${newRFQ.rfqNumber} successfully submitted to your account executive`, 'success');
    return newRFQ;
  };

  const generateQuote = (
    rfqId: string,
    quoteDetails: { validUntil: string; paymentTerms: PaymentTerms; notes: string; items: any[] }
  ): Quote => {
    const rfq = rfqs.find((r) => r.id === rfqId);
    const count = quotes.length + 100;
    const totalAmount = quoteDetails.items.reduce(
      (sum, item) => sum + item.quantity * (item.quotedUnitPrice || item.unitPrice || 0),
      0
    );

    const newQuote: Quote = {
      id: `QT-2026-${count}`,
      quoteNumber: `QT-2026-${count}`,
      rfqId,
      rfqNumber: rfq?.rfqNumber || rfqId,
      buyerId: rfq?.buyerId || currentBuyer.id,
      buyerName: rfq?.buyerName || currentBuyer.companyName,
      companyName: rfq?.companyName || currentBuyer.companyName,
      items: quoteDetails.items.map((item, idx) => ({
        id: `qti-${idx}`,
        productId: item.productId || 'prod-001',
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        quotedUnitPrice: item.quotedUnitPrice || item.unitPrice,
        unitPrice: item.quotedUnitPrice || item.unitPrice,
        originalTierPrice: item.originalTierPrice,
        buyerTargetPrice: item.buyerTargetPrice,
        moq: item.moq,
        subtotal: item.quantity * (item.quotedUnitPrice || item.unitPrice),
        estimatedDelivery: item.estimatedDelivery
      })),
      totalAmount,
      total: totalAmount,
      subtotal: totalAmount,
      tax: Math.round(totalAmount * 0.1),
      currency: 'USD',
      paymentTerms: quoteDetails.paymentTerms,
      createdAt: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: quoteDetails.validUntil,
      expiryDate: quoteDetails.validUntil,
      status: 'Quoted',
      notes: quoteDetails.notes,
      salesRep: {
        id: 'usr-rep-01',
        name: 'David Chen',
        email: 'david.chen@wholesalehub.com',
        phone: '+855 12 888 123'
      },
      negotiationHistory: [
        {
          id: `neg-${Date.now()}`,
          senderRole: 'SALES_REP',
          senderName: 'David Chen (Sales Rep)',
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          proposedPrice: totalAmount,
          quantity: quoteDetails.items.reduce((sum, item) => sum + item.quantity, 0),
          message: quoteDetails.notes || 'Formal quote issued for buyer review.',
          actionTaken: 'QUOTE_SENT'
        }
      ]
    };

    setQuotes((prev) => [newQuote, ...prev]);
    setRfqs((prev) =>
      prev.map((r) =>
        r.id === rfqId
          ? {
              ...r,
              status: 'Quoted',
              timeline: [
                ...(r.timeline || []),
                {
                  stage: 'Quote Sent',
                  date: new Date().toLocaleString(),
                  actor: 'David Chen (Account Executive)',
                  note: `Formal quote ${newQuote.quoteNumber} issued`
                }
              ]
            }
          : r
      )
    );
    addNotification({
      title: `${newQuote.quoteNumber} received`,
      message: 'A formal quote is ready for buyer review, counter-offer, acceptance, or rejection.',
      type: 'SUCCESS',
      link: `/buyer/quotes/${newQuote.id}`
    });
    showToast(`Commercial Quote ${newQuote.id} issued and dispatched to buyer`, 'success');
    return newQuote;
  };

  const counterQuote = (quoteId: string, counterPrice: number, notes: string) => {
    const newEntry: NegotiationEntry = {
      id: `neg-${Date.now()}`,
      senderRole: 'BUYER',
      senderName: `${currentBuyer.contactPerson} (Buyer)`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      proposedPrice: counterPrice,
      message: notes || 'Buyer submitted a revised counter-offer.',
      actionTaken: 'SUBMIT_COUNTER',
      status: 'Pending Manager Approval'
    };

    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          return {
            ...q,
            status: 'Pending Manager Approval',
            managerApprovalStatus: 'Pending',
            totalAmount: counterPrice,
            total: counterPrice,
            negotiationHistory: [...(q.negotiationHistory || []), newEntry]
          };
        }
        return q;
      })
    );
    addNotification({
      title: `Counter-offer submitted for ${quoteId}`,
      message: 'Your revised pricing request is pending Sales Manager approval.',
      type: 'WARNING',
      link: `/buyer/quotes/${quoteId}`
    });
    showToast('Counter-offer submitted to Sales Manager for review', 'info');
  };

  const submitCounterOffer = (quoteId: string, entry: Omit<NegotiationEntry, 'id' | 'timestamp'>) => {
    const newEntry: NegotiationEntry = {
      ...entry,
      id: `neg-${Date.now()}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };

    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          return {
            ...q,
            status: entry.status || 'Negotiating',
            negotiationHistory: [...(q.negotiationHistory || []), newEntry]
          };
        }
        return q;
      })
    );
    addNotification({
      title: `Counter-offer added to ${quoteId}`,
      message: entry.message,
      type: 'INFO',
      link: `/buyer/quotes/${quoteId}`
    });
    showToast('Counter offer submitted to sales management', 'success');
  };

  const acceptQuote = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    const acceptanceEntry: NegotiationEntry = {
      id: `neg-${Date.now()}`,
      senderRole: 'BUYER',
      senderName: `${currentBuyer.contactPerson} (Buyer)`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      proposedPrice: quote.totalAmount || quote.total,
      quantity: quote.items.reduce((sum, item) => sum + item.quantity, 0),
      message: 'Quote accepted. Purchase Order creation is available as the next workflow step.',
      actionTaken: 'ACCEPT_QUOTE',
      status: 'Accepted'
    };

    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status: 'Accepted',
              negotiationHistory: [...(q.negotiationHistory || []), acceptanceEntry]
            }
          : q
      )
    );
    setRfqs((prev) =>
      prev.map((r) =>
        r.id === quote.rfqId
          ? {
              ...r,
              status: 'Accepted',
              timeline: [
                ...(r.timeline || []),
                {
                  stage: 'Quote Accepted',
                  date: new Date().toLocaleString(),
                  actor: `${currentBuyer.contactPerson} (Buyer)`,
                  note: `${quote.quoteNumber || quote.id} accepted. Ready for PO creation.`
                }
              ]
            }
          : r
      )
    );
    addNotification({
      title: `${quote.quoteNumber || quote.id} accepted`,
      message: 'The quote is accepted and ready for Purchase Order creation in the next workflow.',
      type: 'SUCCESS',
      link: `/buyer/quotes/${quoteId}`
    });
    showToast('Quote accepted. Purchase Order creation is ready.', 'success');
  };

  const rejectQuote = (quoteId: string, reason?: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    const rejectionEntry: NegotiationEntry = {
      id: `neg-${Date.now()}`,
      senderRole: 'BUYER',
      senderName: `${currentBuyer.contactPerson} (Buyer)`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      proposedPrice: quote?.totalAmount || quote?.total,
      quantity: quote?.items.reduce((sum, item) => sum + item.quantity, 0),
      message: reason || 'Quote declined by buyer.',
      actionTaken: 'REJECT_QUOTE',
      status: 'Rejected'
    };

    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status: 'Rejected',
              negotiationHistory: [...(q.negotiationHistory || []), rejectionEntry]
            }
          : q
      )
    );
    if (quote?.rfqId) {
      setRfqs((prev) =>
        prev.map((r) =>
          r.id === quote.rfqId
            ? {
                ...r,
                status: 'Rejected',
                timeline: [
                  ...(r.timeline || []),
                  {
                    stage: 'Quote Rejected',
                    date: new Date().toLocaleString(),
                    actor: `${currentBuyer.contactPerson} (Buyer)`,
                    note: reason || 'Quote declined by buyer.'
                  }
                ]
              }
            : r
        )
      );
    }
    addNotification({
      title: `${quote?.quoteNumber || quoteId} rejected`,
      message: reason || 'The quote was declined and the account executive has been notified.',
      type: 'ALERT',
      link: `/buyer/quotes/${quoteId}`
    });
    showToast('Quote marked as declined', 'warning');
  };

  const buildPurchaseOrderFromQuote = (
    quoteId: string,
    poData: Partial<PurchaseOrder>,
    mode: 'draft' | 'confirm'
  ): PurchaseOrder | null => {
    const quote = quotes.find((q) => q.id === quoteId || q.quoteNumber === quoteId);
    if (!quote) {
      showToast('Accepted quote could not be found', 'error');
      return null;
    }

    if (quote.status !== 'Accepted') {
      showToast('Only accepted quotes can be converted into purchase orders', 'warning');
      return null;
    }

    if (getQuoteExpiryState(quote).isExpired) {
      showToast('This accepted quote is expired and cannot be converted', 'warning');
      return null;
    }

    const count = purchaseOrders.length + 60;
    const poNumber = `PO-2026-${count.toString().padStart(4, '0')}`;
    const dateToday = new Date().toISOString().split('T')[0];
    const allocations = quote.items.map((item) =>
      buildStockAllocation(
        {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity
        },
        item.productId ? mockBuyerWarehouseAvailability[item.productId] : []
      )
    );
    const items = quote.items.map((item, index) => ({
      id: `poi-${count}-${index + 1}`,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.quotedUnitPrice || item.unitPrice || 0,
      subtotal: item.subtotal || item.quantity * (item.quotedUnitPrice || item.unitPrice || 0),
      fulfilledQuantity: 0,
      remainingQuantity: item.quantity,
      allocationStatus: allocations[index].result,
      warehouseAllocation: allocations[index].warehouses
    }));

    const subtotal = quote.subtotal || items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalAmount = getQuoteConversionTotal(quote);
    const creditCheck = buildCreditCheck(currentBuyer, totalAmount);
    const confirmedStatus = creditCheck.status === 'Passed' ? 'Approved' : 'Pending Approval';
    const status = mode === 'draft' ? 'Draft' : confirmedStatus;
    const requiresApproval = mode === 'confirm' && creditCheck.status !== 'Passed';
    const shouldGenerateContract = mode === 'confirm' && confirmedStatus === 'Approved';
    const contractNumber = shouldGenerateContract
      ? `CTR-2026-${count.toString().padStart(4, '0')}`
      : undefined;

    const newPO: PurchaseOrder = {
      id: poNumber.toLowerCase(),
      poNumber,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber || quote.id,
      rfqNumber: quote.rfqNumber || quote.rfqId,
      buyerId: currentBuyer.id,
      buyerName: currentBuyer.contactPerson,
      companyName: currentBuyer.companyName,
      contactPerson: currentBuyer.contactPerson,
      orderDate: dateToday,
      expectedDeliveryDate: poData.expectedDeliveryDate || poData.requestedDeliveryDate || quote.estimatedDelivery || '2026-09-30',
      requestedDeliveryDate: poData.requestedDeliveryDate || poData.expectedDeliveryDate || quote.estimatedDelivery || '2026-09-30',
      currency: quote.currency || 'USD',
      items,
      subtotal,
      tax: quote.tax || Math.round(subtotal * 0.1),
      discount: quote.discount || 0,
      shippingFee: quote.shipping || 0,
      grandTotal: totalAmount,
      totalAmount,
      paymentTerms: poData.paymentTerms || quote.paymentTerms,
      shippingAddress: poData.shippingAddress || currentBuyer.address,
      billingAddress: poData.billingAddress || currentBuyer.address,
      buyerPoReference: poData.buyerPoReference || `BUYER-${poNumber}`,
      internalBuyerNotes: poData.internalBuyerNotes || '',
      attachments: poData.attachments || [],
      status,
      stockStatus:
        allocations.every((allocation) => allocation.backorderQty === 0) && mode === 'confirm'
          ? 'Allocated'
          : 'Pending',
      shipmentStatus: 'Pending',
      contractId: shouldGenerateContract ? contractNumber?.toLowerCase() : undefined,
      assignedRep: {
        id: quote.salesRep?.id || currentBuyer.assignedRep.id,
        name: quote.salesRep?.name || currentBuyer.assignedRep.name,
        email: quote.salesRep?.email || currentBuyer.assignedRep.email,
        title: currentBuyer.assignedRep.title
      },
      approval: {
        required: requiresApproval,
        reason: requiresApproval ? 'Order exceeds available account credit.' : undefined,
        status: mode === 'draft' ? 'Not Required' : requiresApproval ? 'Under Review' : 'Approved',
        submittedAt: mode === 'confirm' ? new Date().toLocaleString() : undefined,
        reviewedAt: mode === 'confirm' && !requiresApproval ? new Date().toLocaleString() : undefined
      },
      creditCheck,
      inventoryAllocations: allocations,
      documents: [
        {
          id: `pod-${count}-quote`,
          name: `${quote.quoteNumber || quote.id}.pdf`,
          type: 'Quote',
          uploadedDate: dateToday,
          version: 'v1'
        },
        ...(poData.attachments || []).map((name, index) => ({
          id: `pod-${count}-att-${index}`,
          name,
          type: 'Buyer Attachment',
          uploadedDate: dateToday,
          version: 'v1'
        }))
      ],
      timeline: [
        {
          stage: mode === 'draft' ? 'Draft Saved' : 'PO Created',
          date: new Date().toLocaleString(),
          description:
            mode === 'draft'
              ? `Draft saved from accepted quote ${quote.quoteNumber || quote.id}`
              : `Purchase order created from accepted quote ${quote.quoteNumber || quote.id}`,
          completed: true,
          active: mode === 'draft'
        },
        {
          stage: 'Pending Approval',
          date: mode === 'confirm' && requiresApproval ? new Date().toLocaleString() : mode === 'draft' ? 'Not submitted' : new Date().toLocaleString(),
          description: requiresApproval
            ? creditCheck.message
            : mode === 'draft'
            ? 'Submit PO to begin approval simulation'
            : 'No manager approval required',
          completed: mode === 'confirm',
          active: mode === 'confirm' && requiresApproval
        },
        {
          stage: 'Approved',
          date: mode === 'confirm' && !requiresApproval ? new Date().toLocaleString() : 'Pending',
          description: mode === 'confirm' && !requiresApproval ? 'Credit check passed' : 'Awaiting approval outcome',
          completed: mode === 'confirm' && !requiresApproval
        },
        {
          stage: 'Stock Allocated',
          date: mode === 'confirm' && !requiresApproval ? new Date().toLocaleString() : 'Pending',
          description: allocations.every((allocation) => allocation.backorderQty === 0)
            ? 'Allocation proposal covers all requested quantities'
            : 'Partial availability requires backorder planning',
          completed: mode === 'confirm' && !requiresApproval
        },
        {
          stage: 'Contract Generated',
          date: shouldGenerateContract ? new Date().toLocaleString() : 'Pending',
          description: shouldGenerateContract ? `${contractNumber} available for buyer review` : 'Available after approval',
          completed: shouldGenerateContract
        }
      ],
      activity: [
        {
          id: `po-act-${count}-1`,
          title: mode === 'draft' ? 'Draft saved' : 'PO created',
          timestamp: new Date().toLocaleString(),
          actor: currentBuyer.contactPerson,
          description: `${poNumber} ${mode === 'draft' ? 'saved as draft' : 'submitted for processing'}.`
        }
      ]
    };

    const generatedContract: Contract | null = shouldGenerateContract
      ? {
          id: contractNumber!.toLowerCase(),
          contractNumber,
          title: `${quote.companyName || currentBuyer.companyName} Supply Contract`,
          buyerId: currentBuyer.id,
          buyerName: currentBuyer.contactPerson,
          companyName: currentBuyer.companyName,
          buyerGroup: currentBuyer.buyerGroup,
          poId: newPO.id,
          poNumber,
          quoteId: quote.id,
          quoteNumber: quote.quoteNumber || quote.id,
          startDate: dateToday,
          endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          renewalDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contractValue: totalAmount,
          currency: quote.currency || 'USD',
          terms: 'Accepted quote converted to fixed-price supply contract',
          paymentTerms: quote.paymentTerms,
          deliveryTerms: 'DDP buyer receiving dock with scheduled appointment',
          productsCovered: quote.items.map((item) => item.productName),
          buyerResponsibilities: ['Confirm receiving appointment', 'Inspect delivery on arrival', 'Submit acceptance confirmation'],
          supplierResponsibilities: ['Reserve approved stock', 'Provide serial list and warranty documents', 'Coordinate freight release'],
          assignedRep: newPO.assignedRep,
          status: 'Active',
          renewalStatus: 'Not Due',
          milestones: [
            { id: `mil-${count}-1`, title: 'Contract Signed', dueDate: dateToday, status: 'Completed', completedDate: dateToday },
            { id: `mil-${count}-2`, title: 'Initial Payment', dueDate: newPO.expectedDeliveryDate, amount: totalAmount, status: 'Pending' },
            { id: `mil-${count}-3`, title: 'First Shipment', dueDate: newPO.expectedDeliveryDate, status: 'Pending' },
            { id: `mil-${count}-4`, title: 'Final Delivery', dueDate: newPO.expectedDeliveryDate, status: 'Pending' },
            { id: `mil-${count}-5`, title: 'Final Payment', dueDate: newPO.expectedDeliveryDate, amount: totalAmount, status: 'Pending' }
          ],
          documents: [
            { id: `doc-${count}-contract`, title: 'Master Contract PDF', name: `${contractNumber}_Master_Contract.pdf`, type: 'Contract', uploadedDate: dateToday, version: 'v1' },
            { id: `doc-${count}-po`, title: 'Purchase Order', name: `${poNumber}.pdf`, type: 'PO', uploadedDate: dateToday, version: 'v1' },
            { id: `doc-${count}-quote`, title: 'Quotation', name: `${quote.quoteNumber || quote.id}.pdf`, type: 'Quote', uploadedDate: dateToday, version: 'v1' }
          ],
          activityTimeline: [
            { stage: 'Contract Generated', date: new Date().toLocaleString(), actor: 'WholesaleHub System', description: `Generated after ${poNumber} approval.` },
            { stage: 'Contract Activated', date: new Date().toLocaleString(), actor: quote.salesRep?.name || currentBuyer.assignedRep.name, description: 'Contract available for buyer review.' }
          ]
        }
      : null;

    setPurchaseOrders((prev) => [newPO, ...prev]);

    if (generatedContract) {
      setContracts((prev) => [generatedContract, ...prev]);
    }

    if (mode === 'confirm') {
      setQuotes((prev) =>
        prev.map((q) => (q.id === quote.id ? { ...q, status: 'Converted' } : q))
      );
    }

    addNotification({
      title: `${poNumber} ${mode === 'draft' ? 'saved' : 'created'}`,
      message:
        mode === 'draft'
          ? 'Purchase order draft saved for later confirmation.'
          : requiresApproval
          ? 'Purchase order submitted and pending approval review.'
          : 'Purchase order created successfully.',
      type: requiresApproval ? 'WARNING' : 'SUCCESS',
      link: `/buyer/purchase-orders/${newPO.id}`
    });

    showToast(
      mode === 'draft'
        ? 'Purchase order draft saved.'
        : 'Purchase Order created successfully.',
      mode === 'draft' ? 'info' : 'success'
    );

    return newPO;
  };

  const savePurchaseOrderDraft = (quoteId: string, poData: Partial<PurchaseOrder>) =>
    buildPurchaseOrderFromQuote(quoteId, poData, 'draft');

  const createPurchaseOrderFromQuote = (quoteId: string, poData: Partial<PurchaseOrder>) =>
    buildPurchaseOrderFromQuote(quoteId, poData, 'confirm');

  const requestContractRenewal = (
    contractId: string,
    request: { requestedNewEndDate: string; reason: string; message: string }
  ) => {
    const requestedAt = new Date().toLocaleString();

    setContracts((prev) =>
      prev.map((contract) =>
        contract.id === contractId || contract.contractNumber === contractId
          ? {
              ...contract,
              status: 'Renewal Requested',
              renewalStatus: 'Renewal Requested',
              renewalRequest: {
                ...request,
                requestedAt
              },
              activityTimeline: [
                ...(contract.activityTimeline || []),
                {
                  stage: 'Renewal Requested',
                  date: requestedAt,
                  actor: currentBuyer.contactPerson,
                  description: request.message || request.reason
                }
              ]
            }
          : contract
      )
    );

    addNotification({
      title: 'Contract renewal requested',
      message: `Renewal request submitted for ${contractId}.`,
      type: 'INFO',
      link: `/buyer/contracts/${contractId}`
    });
    showToast('Contract renewal request submitted.', 'success');
  };

  const approveBuyerRegistration = (
    buyerId: string,
    tier: BuyerGroup = 'Tier-1 Gold',
    creditLimit: number = 75000,
    terms: PaymentTerms = 'Net 30'
  ) => {
    setBuyers((prev) =>
      prev.map((b) =>
        b.id === buyerId
          ? {
              ...b,
              status: 'Approved',
              buyerGroup: tier,
              creditLimit,
              availableCredit: creditLimit - b.usedCredit,
              paymentTerms: terms
            }
          : b
      )
    );
    showToast('Buyer account application approved and credit line activated', 'success');
  };

  const rejectBuyerRegistration = (buyerId: string, reason: string) => {
    setBuyers((prev) =>
      prev.map((b) => (b.id === buyerId ? { ...b, status: 'Rejected' } : b))
    );
    showToast(`Buyer application rejected: ${reason}`, 'warning');
  };

  const updateBuyerCredit = (buyerId: string, newLimit: number) => {
    setBuyers((prev) =>
      prev.map((b) =>
        b.id === buyerId
          ? {
              ...b,
              creditLimit: newLimit,
              availableCredit: Math.max(0, newLimit - b.usedCredit)
            }
          : b
      )
    );
    if (currentBuyer.id === buyerId) {
      setCurrentBuyer((prev) => ({
        ...prev,
        creditLimit: newLimit,
        availableCredit: Math.max(0, newLimit - prev.usedCredit)
      }));
    }
  };

  const updateBuyerAccountStatus = (buyerId: string, status: string) => {
    setBuyers((prev) => prev.map((b) => (b.id === buyerId ? { ...b, status } : b)));
    if (currentBuyer.id === buyerId) {
      setCurrentBuyer((prev) => ({ ...prev, status }));
    }
    showToast(`${buyerId} status updated to ${status}`, status === 'Suspended' ? 'warning' : 'success');
  };

  const updateBuyerPaymentTerms = (buyerId: string, terms: PaymentTerms) => {
    setBuyers((prev) => prev.map((b) => (b.id === buyerId ? { ...b, paymentTerms: terms } : b)));
    if (currentBuyer.id === buyerId) {
      setCurrentBuyer((prev) => ({ ...prev, paymentTerms: terms }));
    }
    showToast(`Payment terms updated to ${terms}`, 'success');
  };

  const updateBuyerGroupAssignment = (buyerId: string, buyerGroup: BuyerGroup) => {
    setBuyers((prev) => prev.map((b) => (b.id === buyerId ? { ...b, buyerGroup } : b)));
    if (currentBuyer.id === buyerId) {
      setCurrentBuyer((prev) => ({ ...prev, buyerGroup }));
    }
    showToast(`Buyer group updated to ${buyerGroup}`, 'success');
  };

  const approveBuyerApplication = (
    applicationId: string,
    config: {
      buyerGroup: BuyerGroup;
      creditLimit: number;
      paymentTerms: PaymentTerms;
      accountExecutive: string;
      internalNote: string;
    }
  ) => {
    const application = buyerApplications.find((app) => app.id === applicationId);
    if (!application) return;

    const approvedAt = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const accountExecutive =
      mockUsers.find((user) => user.name === config.accountExecutive) ||
      mockUsers.find((user) => user.role === 'ACCOUNT_EXECUTIVE') ||
      currentUser;
    const buyerId = application.buyerId || `buyer-${Date.now()}`;

    setBuyerApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              buyerId,
              status: 'Approved',
              buyerGroup: config.buyerGroup,
              assignedAccountExecutive: config.accountExecutive,
              creditProfile: {
                creditLimit: config.creditLimit,
                usedCredit: 0,
                availableCredit: config.creditLimit,
                paymentTerms: config.paymentTerms,
                accountStanding: 'Good Standing'
              },
              verificationChecklist: app.verificationChecklist.map((item) => ({ ...item, completed: true })),
              internalNotes: [...(app.internalNotes || []), config.internalNote],
              approvalHistory: [
                ...app.approvalHistory,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: approvedAt,
                  actor: currentUser.name,
                  action: 'Application approved',
                  note: config.internalNote || 'Buyer account approved.'
                }
              ]
            }
          : app
      )
    );

    setBuyers((prev) => {
      const existingBuyer = prev.find((buyer) => buyer.id === buyerId);
      if (existingBuyer) {
        return prev.map((buyer) =>
          buyer.id === buyerId
            ? {
                ...buyer,
                status: 'Approved',
                buyerGroup: config.buyerGroup,
                creditLimit: config.creditLimit,
                usedCredit: 0,
                availableCredit: config.creditLimit,
                paymentTerms: config.paymentTerms,
                assignedRep: {
                  id: accountExecutive.id,
                  name: accountExecutive.name,
                  email: accountExecutive.email,
                  title: accountExecutive.department || 'Account Executive'
                }
              }
            : buyer
        );
      }

      const newBuyer: BuyerCompany = {
        id: buyerId,
        companyName: application.companyName,
        businessType: application.businessType,
        taxId: application.taxId,
        registrationNumber: application.registrationNumber,
        contactPerson: application.contactName,
        businessEmail: application.contactEmail,
        phone: application.contactPhone,
        website: application.website,
        industry: application.industry,
        country: application.country,
        city: application.city,
        address: application.address,
        buyerGroup: config.buyerGroup,
        status: 'Approved',
        creditLimit: config.creditLimit,
        usedCredit: 0,
        availableCredit: config.creditLimit,
        accountStanding: 'Good Standing',
        paymentTerms: config.paymentTerms,
        assignedRep: {
          id: accountExecutive.id,
          name: accountExecutive.name,
          email: accountExecutive.email,
          title: accountExecutive.department || 'Account Executive'
        },
        joinedDate: new Date().toISOString().split('T')[0],
        totalPurchases: 0,
        documents: application.documents.map((document) => ({
          name: document.fileName || document.document,
          type: 'PDF',
          size: document.fileSize,
          uploadedDate: document.uploadedDate,
          verified: document.verificationStatus === 'Verified',
          status: document.verificationStatus
        })),
        businessDocuments: application.documents
      };

      return [newBuyer, ...prev];
    });

    addNotification({
      title: `${application.applicationNumber} approved`,
      message: `${application.companyName} was approved as a ${config.buyerGroup} buyer.`,
      type: 'SUCCESS',
      link: `/admin/approvals/${applicationId}`
    });
    showToast(`${application.companyName} approved and activated.`, 'success');
  };

  const rejectBuyerApplication = (
    applicationId: string,
    reason: string,
    internalNote: string,
    buyerMessage: string
  ) => {
    const rejectedAt = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    setBuyerApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: 'Rejected',
              internalNotes: [...(app.internalNotes || []), internalNote],
              approvalHistory: [
                ...app.approvalHistory,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: rejectedAt,
                  actor: currentUser.name,
                  action: `Rejected: ${reason}`,
                  note: buyerMessage
                }
              ]
            }
          : app
      )
    );

    addNotification({
      title: 'Buyer application rejected',
      message: `${applicationId} was rejected for ${reason}.`,
      type: 'ALERT',
      link: `/admin/approvals/${applicationId}`
    });
    showToast('Buyer application rejected.', 'warning');
  };

  const requestBuyerApplicationDocuments = (
    applicationId: string,
    requiredDocuments: string[],
    message: string
  ) => {
    const requestedAt = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    setBuyerApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: 'Additional Documents Required',
              documentStatus: 'Missing',
              internalNotes: [...(app.internalNotes || []), `Requested: ${requiredDocuments.join(', ')}`],
              approvalHistory: [
                ...app.approvalHistory,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: requestedAt,
                  actor: currentUser.name,
                  action: 'Requested more documents',
                  note: message
                }
              ]
            }
          : app
      )
    );

    showToast('Document request recorded.', 'success');
  };

  const assignBuyerApplicationReviewer = (applicationId: string, reviewer: string) => {
    setBuyerApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              assignedReviewer: reviewer,
              status: app.status === 'Pending' ? 'Verification In Progress' : app.status,
              approvalHistory: [
                ...app.approvalHistory,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
                  actor: currentUser.name,
                  action: 'Reviewer assigned',
                  note: reviewer
                }
              ]
            }
          : app
      )
    );
    showToast(`${reviewer} assigned as reviewer.`, 'success');
  };

  const updateBuyerApplicationAssignment = (
    applicationId: string,
    assignment: { accountExecutive?: string; buyerGroup?: BuyerGroup }
  ) => {
    setBuyerApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              assignedAccountExecutive: assignment.accountExecutive || app.assignedAccountExecutive,
              buyerGroup: assignment.buyerGroup || app.buyerGroup,
              approvalHistory: [
                ...app.approvalHistory,
                {
                  id: `hist-${Date.now()}`,
                  timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
                  actor: currentUser.name,
                  action: 'Assignment updated',
                  note: [
                    assignment.accountExecutive ? `AE: ${assignment.accountExecutive}` : '',
                    assignment.buyerGroup ? `Group: ${assignment.buyerGroup}` : ''
                  ]
                    .filter(Boolean)
                    .join(' / ')
                }
              ]
            }
          : app
      )
    );
    showToast('Application assignment updated.', 'success');
  };

  const saveBuyerGroup = (group: BuyerGroupConfig) => {
    setBuyerGroups((prev) => {
      const exists = prev.some((item) => item.id === group.id);
      return exists ? prev.map((item) => (item.id === group.id ? group : item)) : [group, ...prev];
    });
    showToast(`${group.name} buyer group saved.`, 'success');
  };

  const deactivateBuyerGroup = (groupId: string) => {
    setBuyerGroups((prev) =>
      prev.map((group) => (group.id === groupId ? { ...group, status: 'Inactive' } : group))
    );
    showToast('Buyer group deactivated.', 'warning');
  };

  const getInventoryStatus = (available: number, reorderPoint: number) => {
    if (available <= 0) return 'Out of Stock';
    if (available <= reorderPoint) return 'Low Stock';
    return 'Active';
  };

  const saveProduct = (
    product: Product,
    inventoryDetails?: {
      warehouseId: string;
      warehouseName: string;
      locationBin?: string;
      onHand: number;
    }
  ) => {
    setProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      return exists ? prev.map((item) => (item.id === product.id ? product : item)) : [product, ...prev];
    });

    if (inventoryDetails) {
      setInventory((prev) => {
        const existingItem = prev.find(
          (item) => item.productId === product.id && item.warehouseId === inventoryDetails.warehouseId
        );
        const reserved = existingItem?.reserved || product.reservedStock || 0;
        const available = Math.max(0, inventoryDetails.onHand - reserved);
        const updatedItem: InventoryItem = {
          id: existingItem?.id || `inv-item-${product.id}-${inventoryDetails.warehouseId}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          warehouseId: inventoryDetails.warehouseId,
          warehouseName: inventoryDetails.warehouseName,
          locationBin: inventoryDetails.locationBin || existingItem?.locationBin || 'UNASSIGNED',
          onHand: inventoryDetails.onHand,
          reserved,
          available,
          reorderPoint: product.reorderPoint,
          unitCost: product.costPrice,
          status: product.status === 'Archived' ? 'Inactive' : getInventoryStatus(available, product.reorderPoint)
        };

        return existingItem
          ? prev.map((item) => (item.id === existingItem.id ? updatedItem : item))
          : [updatedItem, ...prev];
      });
    }
  };

  const updateProductStatus = (productId: string, status: string) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, status } : product))
    );
    setInventory((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              status: status === 'Archived' ? 'Inactive' : getInventoryStatus(item.available, item.reorderPoint)
            }
          : item
      )
    );
  };

  const updatePOStatus = (poId: string, status: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status } : po))
    );
  };

  const updateInvoiceStatus = (invoiceId: string, status: string, paidAmount?: number) => {
    setInvoices((prev) =>
      prev.map((invoice) => {
        if (invoice.id !== invoiceId) return invoice;

        const total = invoice.totalAmount ?? invoice.total ?? 0;
        const nextPaidAmount = typeof paidAmount === 'number' ? paidAmount : status === 'Paid' ? total : invoice.paidAmount;

        return {
          ...invoice,
          status,
          paidAmount: nextPaidAmount,
          balanceDue: Math.max(0, total - (nextPaidAmount || 0)),
          payments:
            status === 'Paid' && (invoice.payments || []).length === 0
              ? [
                  {
                    id: `pay-${Date.now()}`,
                    paymentId: `PAY-${Date.now()}`,
                    invoiceId: invoice.id,
                    date: new Date().toISOString().split('T')[0],
                    method: 'Bank Transfer',
                    amount: total,
                    reference: `AUTO-${invoice.invoiceNumber || invoice.id}`,
                    status: 'Completed'
                  }
                ]
              : invoice.payments
        };
      })
    );
  };

  const updateShipmentStatus = (shipmentId: string, status: string) => {
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === shipmentId
          ? {
              ...shipment,
              status,
              actualDelivery: status === 'Delivered' ? new Date().toISOString().split('T')[0] : shipment.actualDelivery
            }
          : shipment
      )
    );
  };

  const updateContractStatus = (contractId: string, status: string) => {
    setContracts((prev) =>
      prev.map((contract) => (contract.id === contractId ? { ...contract, status } : contract))
    );
  };

  const updateStock = (productId: string, warehouseId: string, newOnHand: number) => {
    const nextInventory = inventory.map((item) => {
      if (item.productId === productId && item.warehouseId === warehouseId) {
        const reserved = item.reserved || 0;
        const available = Math.max(0, newOnHand - reserved);
        return {
          ...item,
          onHand: newOnHand,
          available,
          status: getInventoryStatus(available, item.reorderPoint)
        };
      }
      return item;
    });

    setInventory(nextInventory);

    const relatedInventory = nextInventory.filter((item) => item.productId === productId);
    if (relatedInventory.length > 0) {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) return product;

          return {
            ...product,
            inStock: relatedInventory.reduce((sum, item) => sum + item.onHand, 0),
            reservedStock: relatedInventory.reduce((sum, item) => sum + item.reserved, 0),
            availableStock: relatedInventory.reduce((sum, item) => sum + item.available, 0)
          };
        })
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentRole,
        roles,
        setRoles,
        currentBuyer,
        products,
        buyers,
        rfqs,
        quotes,
        purchaseOrders,
        contracts,
        invoices,
        creditActivity,
        shipments,
        inventory,
        buyerApplications,
        buyerGroups,
        adminDashboardStats: mockAdminDashboardStats,
        recentAdminActivity: mockRecentAdminActivity,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        showToast,
        removeToast,
        saveRFQDraft,
        submitRFQ,
        generateQuote,
        counterQuote,
        submitCounterOffer,
        acceptQuote,
        rejectQuote,
        savePurchaseOrderDraft,
        createPurchaseOrderFromQuote,
        requestContractRenewal,
        approveBuyerRegistration,
        rejectBuyerRegistration,
        updateBuyerCredit,
        updateBuyerAccountStatus,
        updateBuyerPaymentTerms,
        updateBuyerGroupAssignment,
        approveBuyerApplication,
        rejectBuyerApplication,
        requestBuyerApplicationDocuments,
        assignBuyerApplicationReviewer,
        updateBuyerApplicationAssignment,
        saveBuyerGroup,
        deactivateBuyerGroup,
        saveProduct,
        updateProductStatus,
        updatePOStatus,
        updateInvoiceStatus,
        updateShipmentStatus,
        updateContractStatus,
        updateStock
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-amber-100 border-amber-700'
                : 'bg-slate-900 text-blue-300 border-blue-600/30'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs font-bold ml-2"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
