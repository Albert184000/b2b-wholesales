import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  History,
  Receipt,
  ShieldAlert,
  ShoppingBag,
  Truck,
  UserCheck
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Column,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Tabs,
  Textarea,
  Timeline
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BusinessDocument, Contract, Invoice, PurchaseOrder, Quote, RFQ, Shipment } from '../../types';
import { getCreditUtilization, getInvoiceBalance } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

export const AdminBuyerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    buyers,
    rfqs,
    quotes,
    purchaseOrders,
    contracts,
    invoices,
    shipments,
    buyerApplications,
    updateBuyerCredit,
    updateBuyerPaymentTerms,
    updateBuyerAccountStatus,
    showToast
  } = useApp();
  const buyer = buyers.find((record) => record.id === id);
  const [activeTab, setActiveTab] = useState('overview');
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [holdConfirmOpen, setHoldConfirmOpen] = useState(false);
  const [newCreditLimit, setNewCreditLimit] = useState(buyer?.creditLimit || 0);
  const [newPaymentTerms, setNewPaymentTerms] = useState(buyer?.paymentTerms || 'Net 30');
  const [creditNote, setCreditNote] = useState('');

  if (!buyer) {
    return (
      <EmptyState
        icon={Building2}
        title="Buyer not found"
        description="The requested buyer account is not available in the current workspace."
        actionText="Back to Buyers"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/admin/buyers')}
      />
    );
  }

  const relatedRfqs = rfqs.filter((rfq) => rfq.buyerId === buyer.id || rfq.companyName === buyer.companyName);
  const relatedQuotes = quotes.filter((quote) => quote.buyerId === buyer.id || quote.companyName === buyer.companyName);
  const relatedPOs = purchaseOrders.filter((po) => po.buyerId === buyer.id || po.companyName === buyer.companyName);
  const relatedContracts = contracts.filter((contract) => contract.buyerId === buyer.id || contract.companyName === buyer.companyName);
  const relatedInvoices = invoices.filter((invoice) => invoice.buyerId === buyer.id || invoice.companyName === buyer.companyName);
  const relatedShipments = shipments.filter((shipment) => shipment.buyerId === buyer.id || shipment.companyName === buyer.companyName);
  const relatedApplication = buyerApplications.find((application) => application.buyerId === buyer.id);
  const outstandingBalance = relatedInvoices
    .filter((invoice) => !['Paid', 'Cancelled', 'Draft'].includes(invoice.status))
    .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const overdueBalance = relatedInvoices
    .filter((invoice) => invoice.status === 'Overdue')
    .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const activePOs = relatedPOs.filter((po) => !['Completed', 'Cancelled', 'Draft'].includes(po.status)).length;
  const creditUtilization = getCreditUtilization(buyer.creditLimit, buyer.usedCredit);

  const documentRows: BusinessDocument[] =
    buyer.businessDocuments ||
    buyer.documents.map((document, index) => ({
      id: `legacy-doc-${index}`,
      document: document.name,
      documentNumber: document.name.split('.')[0],
      uploadedDate: document.uploadedDate || document.uploadedAt || buyer.joinedDate,
      expiry: 'N/A',
      verificationStatus: document.status || (document.verified ? 'Verified' : 'Pending'),
      fileName: document.name,
      fileSize: document.size
    }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'documents', label: 'Documents', icon: FileCheck, count: documentRows.length },
    { id: 'credit', label: 'Credit', icon: CreditCard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: relatedPOs.length },
    { id: 'invoices', label: 'Invoices', icon: Receipt, count: relatedInvoices.length },
    { id: 'contracts', label: 'Contracts', icon: FileText, count: relatedContracts.length },
    { id: 'activity', label: 'Activity', icon: History }
  ];

  const documentColumns: Column<BusinessDocument>[] = [
    {
      key: 'document',
      header: 'Document Name',
      accessor: (document) => (
        <div className="min-w-[220px]">
          <div className="font-semibold text-slate-900">{document.document}</div>
          <div className="font-mono text-xs text-blue-700">{document.documentNumber}</div>
        </div>
      )
    },
    { key: 'uploaded', header: 'Uploaded', accessor: (document) => <span>{document.uploadedDate}</span> },
    { key: 'expiry', header: 'Expiry', accessor: (document) => <span>{document.expiry || 'N/A'}</span> },
    { key: 'status', header: 'Verification Status', accessor: (document) => <StatusBadge status={document.verificationStatus} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (document) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="xs" onClick={() => showToast(`${document.fileName || document.document} opened for review.`, 'info')}>
            View
          </Button>
          <Button variant="success" size="xs" onClick={() => showToast(`${document.document} marked verified.`, 'success')}>
            Verify
          </Button>
          <Button variant="danger" size="xs" onClick={() => showToast(`${document.document} marked for re-upload.`, 'warning')}>
            Reject
          </Button>
          <Button variant="outline" size="xs" onClick={() => showToast(`Replacement requested for ${document.document}.`, 'info')}>
            Request Replacement
          </Button>
        </div>
      )
    }
  ];

  const rfqColumns: Column<RFQ>[] = [
    { key: 'rfq', header: 'RFQ', accessor: (rfq) => <span className="font-mono font-bold text-blue-700">{rfq.rfqNumber || rfq.id}</span> },
    { key: 'title', header: 'Project', accessor: (rfq) => <span className="font-semibold text-slate-800">{rfq.projectTitle || 'Wholesale RFQ'}</span> },
    { key: 'target', header: 'Target', align: 'right', accessor: (rfq) => <span className="font-mono font-bold">{formatCurrency(rfq.targetBudget || rfq.targetValue || 0)}</span> },
    { key: 'status', header: 'Status', accessor: (rfq) => <StatusBadge status={rfq.status} size="sm" /> }
  ];

  const quoteColumns: Column<Quote>[] = [
    { key: 'quote', header: 'Quote', accessor: (quote) => <Link to={`/admin/quotes/${quote.id}`} className="font-mono font-bold text-blue-700">{quote.quoteNumber || quote.id}</Link> },
    { key: 'rfq', header: 'RFQ', accessor: (quote) => <span className="font-mono text-xs">{quote.rfqNumber || quote.rfqId}</span> },
    { key: 'total', header: 'Total', align: 'right', accessor: (quote) => <span className="font-mono font-bold">{formatCurrency(quote.totalAmount || quote.total || 0)}</span> },
    { key: 'status', header: 'Status', accessor: (quote) => <StatusBadge status={quote.status} size="sm" /> }
  ];

  const poColumns: Column<PurchaseOrder>[] = [
    { key: 'po', header: 'PO', accessor: (po) => <Link to={`/admin/purchase-orders/${po.id}`} className="font-mono font-bold text-blue-700">{po.poNumber || po.id}</Link> },
    { key: 'date', header: 'Order Date', accessor: (po) => <span>{po.orderDate}</span> },
    { key: 'total', header: 'Total', align: 'right', accessor: (po) => <span className="font-mono font-bold">{formatCurrency(po.grandTotal || po.totalAmount || 0)}</span> },
    { key: 'status', header: 'Status', accessor: (po) => <StatusBadge status={po.status} size="sm" /> }
  ];

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'invoice', header: 'Invoice', accessor: (invoice) => <Link to={`/admin/invoices/${invoice.id}`} className="font-mono font-bold text-blue-700">{invoice.invoiceNumber || invoice.id}</Link> },
    { key: 'due', header: 'Due Date', accessor: (invoice) => <span>{invoice.dueDate}</span> },
    { key: 'balance', header: 'Balance', align: 'right', accessor: (invoice) => <span className="font-mono font-bold">{formatCurrency(getInvoiceBalance(invoice))}</span> },
    { key: 'status', header: 'Status', accessor: (invoice) => <StatusBadge status={invoice.status} size="sm" /> }
  ];

  const contractColumns: Column<Contract>[] = [
    { key: 'contract', header: 'Contract', accessor: (contract) => <Link to={`/admin/contracts/${contract.id}`} className="font-mono font-bold text-blue-700">{contract.contractNumber || contract.id}</Link> },
    { key: 'title', header: 'Title', accessor: (contract) => <span className="font-semibold text-slate-800">{contract.title}</span> },
    { key: 'value', header: 'Value', align: 'right', accessor: (contract) => <span className="font-mono font-bold">{formatCurrency(contract.contractValue || 0)}</span> },
    { key: 'status', header: 'Status', accessor: (contract) => <StatusBadge status={contract.status} size="sm" /> }
  ];

  const shipmentColumns: Column<Shipment>[] = [
    { key: 'shipment', header: 'Shipment', accessor: (shipment) => <Link to={`/admin/shipments/${shipment.id}`} className="font-mono font-bold text-blue-700">{shipment.shipmentNumber || shipment.id}</Link> },
    { key: 'po', header: 'PO', accessor: (shipment) => <span className="font-mono text-xs">{shipment.poNumber || shipment.poId}</span> },
    { key: 'eta', header: 'ETA', accessor: (shipment) => <span>{shipment.estimatedDelivery}</span> },
    { key: 'status', header: 'Status', accessor: (shipment) => <StatusBadge status={shipment.status} size="sm" /> }
  ];

  const buyerActivity = [
    { title: 'Account Created', date: buyer.joinedDate, description: `${buyer.companyName} buyer account created.`, completed: true },
    { title: 'Documents Submitted', date: relatedApplication?.submittedDate || buyer.joinedDate, description: 'Business registration and tax documents received.', completed: true },
    { title: 'Buyer Approved', date: buyer.status === 'Approved' ? buyer.joinedDate : 'Pending', description: buyer.status === 'Approved' ? 'Buyer verification completed.' : 'Approval is not complete.', completed: buyer.status === 'Approved' },
    { title: 'Credit Limit Assigned', date: buyer.creditReviewDate || buyer.joinedDate, description: `${formatCurrency(buyer.creditLimit)} credit facility assigned.`, completed: buyer.creditLimit > 0 },
    { title: 'RFQ Submitted', date: relatedRfqs[0]?.createdDate || 'Pending', description: `${relatedRfqs.length} RFQ record(s) linked.`, completed: relatedRfqs.length > 0 },
    { title: 'Quote Accepted', date: relatedQuotes.find((quote) => quote.status === 'Accepted' || quote.status === 'Converted')?.createdDate || 'Pending', description: `${relatedQuotes.length} quote record(s) linked.`, completed: relatedQuotes.length > 0 },
    { title: 'PO Created', date: relatedPOs[0]?.orderDate || 'Pending', description: `${relatedPOs.length} PO record(s) linked.`, completed: relatedPOs.length > 0 },
    { title: 'Invoice Issued', date: relatedInvoices[0]?.issueDate || 'Pending', description: `${relatedInvoices.length} invoice record(s) linked.`, completed: relatedInvoices.length > 0 },
    { title: 'Payment Received', date: relatedInvoices.flatMap((invoice) => invoice.payments || [])[0]?.date || 'Pending', description: 'Latest payment activity displayed in invoices.', completed: relatedInvoices.some((invoice) => (invoice.payments || []).length > 0) }
  ];

  const saveCreditLimit = () => {
    updateBuyerCredit(buyer.id, newCreditLimit);
    setCreditModalOpen(false);
  };

  const savePaymentTerms = () => {
    updateBuyerPaymentTerms(buyer.id, newPaymentTerms);
    setTermsModalOpen(false);
  };

  const placeCreditHold = () => {
    updateBuyerAccountStatus(buyer.id, 'Credit Hold');
    setHoldConfirmOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={buyer.companyName}
        subtitle={`${buyer.buyerGroup} buyer / ${buyer.assignedRep.name} / Joined ${buyer.joinedDate}`}
        badge={<StatusBadge status={buyer.status} />}
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Buyers', href: '/admin/buyers' },
          { label: buyer.companyName }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/buyers">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            {relatedApplication && (
              <Link to={`/admin/approvals/${relatedApplication.id}`}>
                <Button variant="outline" size="sm" icon={UserCheck}>
                  Approval File
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" icon={CreditCard} onClick={() => setCreditModalOpen(true)}>
              Adjust Credit
            </Button>
          </div>
        }
      />

      {buyer.status === 'Suspended' || buyer.status === 'Credit Hold' ? (
        <Alert type="error" title="Account restricted">
          This buyer account is restricted. Ordering and credit-backed purchasing should remain paused for account review.
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card className="border-slate-200 md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Lifetime Purchases</div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">{formatCurrency(buyer.totalPurchases || 0)}</div>
        </Card>
        <Card className="border-slate-200 md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active POs</div>
          <div className="mt-2 text-xl font-extrabold text-blue-700">{activePOs}</div>
        </Card>
        <Card className="border-slate-200 md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding</div>
          <div className="mt-2 text-xl font-extrabold text-rose-700">{formatCurrency(outstandingBalance)}</div>
        </Card>
        <Card className="border-slate-200 md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Credit</div>
          <div className="mt-2 text-xl font-extrabold text-emerald-700">{formatCurrency(buyer.availableCredit)}</div>
        </Card>
        <Card className="border-slate-200 md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Open RFQs</div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">{relatedRfqs.filter((rfq) => !['Accepted', 'Rejected', 'Expired'].includes(rfq.status)).length}</div>
        </Card>
      </div>

      <Card noPadding className="border-slate-200">
        <div className="px-5 pt-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
        </div>

        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card title="Company Information" className="border-slate-200">
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {[
                    ['Registration Number', buyer.registrationNumber],
                    ['Tax ID', buyer.taxId],
                    ['Industry', buyer.industry || 'Not specified'],
                    ['Business Type', buyer.businessType || 'Not specified'],
                    ['Country', buyer.country || 'Cambodia'],
                    ['Buyer Group', buyer.buyerGroup],
                    ['Account Executive', buyer.assignedRep.name],
                    ['Account Status', buyer.status]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
                      <div className="mt-1 font-semibold text-slate-900">{value}</div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Address</div>
                    <div className="mt-1 font-semibold text-slate-900">{buyer.address}</div>
                  </div>
                </div>
              </Card>

              <Card title="Primary Contact" className="border-slate-200">
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">{buyer.contactPerson}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Phone</div>
                      <div className="font-semibold text-slate-900">{buyer.phone}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Email</div>
                      <div className="break-words font-semibold text-slate-900">{buyer.businessEmail || buyer.email}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                      <div className="text-xs text-slate-500">Website</div>
                      <div className="break-words font-semibold text-blue-700">{buyer.website || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'documents' && (
            <DataTable columns={documentColumns} data={documentRows} compact emptyMessage="No buyer documents available." />
          )}

          {activeTab === 'credit' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-slate-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Credit Limit</div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(buyer.creditLimit)}</div>
                </Card>
                <Card className="border-slate-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Used Credit</div>
                  <div className="mt-2 text-2xl font-extrabold text-rose-700">{formatCurrency(buyer.usedCredit)}</div>
                </Card>
                <Card className="border-slate-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Credit</div>
                  <div className="mt-2 text-2xl font-extrabold text-emerald-700">{formatCurrency(buyer.availableCredit)}</div>
                </Card>
              </div>

              <Card title="Credit Profile" className="border-slate-200">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Utilization</span>
                      <span>{creditUtilization}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, creditUtilization)}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <span className="text-xs text-slate-500">Outstanding Balance</span>
                      <strong className="mt-1 block text-slate-900">{formatCurrency(outstandingBalance)}</strong>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <span className="text-xs text-slate-500">Overdue Balance</span>
                      <strong className="mt-1 block text-rose-700">{formatCurrency(overdueBalance)}</strong>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <span className="text-xs text-slate-500">Payment Terms</span>
                      <strong className="mt-1 block text-slate-900">{buyer.paymentTerms}</strong>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <span className="text-xs text-slate-500">Account Standing</span>
                      <span className="mt-1 block"><StatusBadge status={buyer.accountStanding || 'Good Standing'} size="sm" /></span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" icon={CreditCard} onClick={() => setCreditModalOpen(true)}>
                      Adjust Credit Limit
                    </Button>
                    <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => setTermsModalOpen(true)}>
                      Change Payment Terms
                    </Button>
                    <Button variant="danger" size="sm" icon={ShieldAlert} onClick={() => setHoldConfirmOpen(true)}>
                      Place Credit Hold
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card title="RFQs" className="border-slate-200">
                <DataTable columns={rfqColumns} data={relatedRfqs} compact emptyMessage="No RFQs linked to this buyer." />
              </Card>
              <Card title="Quotes" className="border-slate-200">
                <DataTable columns={quoteColumns} data={relatedQuotes} compact emptyMessage="No quotes linked to this buyer." />
              </Card>
              <Card title="Purchase Orders" className="border-slate-200">
                <DataTable columns={poColumns} data={relatedPOs} compact emptyMessage="No purchase orders linked to this buyer." />
              </Card>
              <Card title="Shipments" className="border-slate-200">
                <DataTable columns={shipmentColumns} data={relatedShipments} compact emptyMessage="No shipments linked to this buyer." />
              </Card>
            </div>
          )}

          {activeTab === 'invoices' && (
            <DataTable columns={invoiceColumns} data={relatedInvoices} compact emptyMessage="No invoices linked to this buyer." />
          )}

          {activeTab === 'contracts' && (
            <DataTable columns={contractColumns} data={relatedContracts} compact emptyMessage="No contracts linked to this buyer." />
          )}

          {activeTab === 'activity' && (
            <Timeline items={buyerActivity} />
          )}
        </div>
      </Card>

      <Modal isOpen={creditModalOpen} onClose={() => setCreditModalOpen(false)} title={`Adjust Credit Limit: ${buyer.companyName}`}>
        <div className="space-y-4">
          <Input
            label="New Credit Limit"
            type="number"
            step="5000"
            value={newCreditLimit}
            onChange={(event) => setNewCreditLimit(Number(event.target.value))}
          />
          <Textarea
            label="Internal Note"
            value={creditNote}
            rows={3}
            onChange={(event) => setCreditNote(event.target.value)}
            placeholder="Reason for credit change..."
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setCreditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={saveCreditLimit}>
              Save Credit Limit
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} title={`Change Payment Terms: ${buyer.companyName}`}>
        <div className="space-y-4">
          <Select
            label="Payment Terms"
            value={newPaymentTerms}
            onChange={(event) => setNewPaymentTerms(event.target.value)}
            options={[
              { label: 'Net 30', value: 'Net 30' },
              { label: 'Net 60', value: 'Net 60' },
              { label: 'Advance Wire', value: 'Advance Wire' }
            ]}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setTermsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={savePaymentTerms}>
              Save Terms
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={holdConfirmOpen}
        onClose={() => setHoldConfirmOpen(false)}
        onConfirm={placeCreditHold}
        title="Place Credit Hold"
        message={`Place a frontend-only credit hold on ${buyer.companyName}?`}
        confirmText="Place Hold"
        variant="danger"
      />
    </div>
  );
};
