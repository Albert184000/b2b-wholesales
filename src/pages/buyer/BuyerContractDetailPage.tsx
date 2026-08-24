import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Printer, RefreshCw, ShoppingBag } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
  Timeline
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { ContractDocument, ContractMilestone } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { getContractNumber, getContractRenewalState } from '../../utils/poContract';

const renewalReasons = [
  { label: 'Extend existing project coverage', value: 'Extend existing project coverage' },
  { label: 'Add follow-on procurement phase', value: 'Add follow-on procurement phase' },
  { label: 'Maintain pricing protection', value: 'Maintain pricing protection' }
];

export const BuyerContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contracts, purchaseOrders, quotes, currentBuyer, requestContractRenewal, showToast } = useApp();
  const contract = contracts.find((record) => record.id === id || record.contractNumber === id);

  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [requestedNewEndDate, setRequestedNewEndDate] = useState('2027-12-31');
  const [renewalReason, setRenewalReason] = useState(renewalReasons[0].value);
  const [renewalMessage, setRenewalMessage] = useState(
    'Please extend the contract for the next procurement phase while preserving current buyer-group terms.'
  );

  if (!contract) {
    return (
      <EmptyState
        icon={FileText}
        title="Contract not found"
        description="The requested contract is not available in the current workspace."
        actionText="Back to Contracts"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/buyer/contracts')}
      />
    );
  }

  const renewal = getContractRenewalState(contract);
  const relatedPO = purchaseOrders.find((po) => po.id === contract.poId || po.poNumber === contract.poNumber);
  const relatedQuote = quotes.find((quote) => quote.id === contract.quoteId || quote.quoteNumber === contract.quoteNumber);
  const canRequestRenewal =
    (contract.status === 'Near Expiry' || renewal.isNearExpiry || contract.renewalStatus === 'Reminder Sent') &&
    contract.status !== 'Renewal Requested';

  const milestoneColumns: Column<ContractMilestone>[] = [
    {
      key: 'milestone',
      header: 'Milestone',
      accessor: (milestone) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-slate-900">{milestone.title}</div>
          {milestone.notes && <div className="mt-1 text-xs text-slate-500">{milestone.notes}</div>}
        </div>
      )
    },
    {
      key: 'due',
      header: 'Due Date',
      accessor: (milestone) => <span className="font-semibold text-slate-700">{milestone.dueDate}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      accessor: (milestone) => (
        <span className="font-mono font-bold text-slate-900">
          {typeof milestone.amount === 'number' ? formatCurrency(milestone.amount, contract.currency || 'USD') : 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (milestone) => <StatusBadge status={milestone.status} />
    },
    {
      key: 'completed',
      header: 'Completed Date',
      accessor: (milestone) => <span className="text-sm text-slate-600">{milestone.completedDate || 'Pending'}</span>
    }
  ];

  const documentColumns: Column<ContractDocument>[] = [
    {
      key: 'document',
      header: 'Document Name',
      accessor: (document) => (
        <div>
          <div className="font-semibold text-slate-900">{document.name || document.title}</div>
          <div className="text-xs text-slate-500">{document.type || 'Document'} / {document.version || 'v1'}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (document) => <span className="text-sm font-semibold text-slate-700">{document.type || document.title}</span>
    },
    {
      key: 'uploaded',
      header: 'Uploaded',
      accessor: (document) => <span className="text-sm text-slate-600">{document.uploadedDate}</span>
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (document) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="xs" onClick={() => showToast(`${document.title} opened for review.`, 'info')}>
            View
          </Button>
          <Button variant="outline" size="xs" icon={Download} onClick={() => showToast(`${document.title} download queued.`, 'info')}>
            Download
          </Button>
        </div>
      )
    }
  ];

  const handleRenewalSubmit = () => {
    requestContractRenewal(contract.id, {
      requestedNewEndDate,
      reason: renewalReason,
      message: renewalMessage
    });
    setRenewalModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={getContractNumber(contract)}
        subtitle={contract.title}
        badge={<StatusBadge status={contract.status} />}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Contracts', href: '/buyer/contracts' },
          { label: getContractNumber(contract) }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/buyer/contracts">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={Download} onClick={() => showToast('Contract download queued.', 'info')}>
              Download Contract
            </Button>
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            {relatedPO && (
              <Link to={`/buyer/purchase-orders/${relatedPO.id}`}>
                <Button variant="outline" size="sm" icon={ShoppingBag}>
                  View PO
                </Button>
              </Link>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => setRenewalModalOpen(true)}
              disabled={!canRequestRenewal}
            >
              Request Renewal
            </Button>
          </div>
        }
      />

      {contract.status === 'Renewal Requested' && contract.renewalRequest && (
        <Alert type="success" title="Renewal request submitted">
          Requested new end date {contract.renewalRequest.requestedNewEndDate}. Reason: {contract.renewalRequest.reason}.
        </Alert>
      )}

      {renewal.isNearExpiry && contract.status !== 'Renewal Requested' && (
        <Alert type="warning" title={renewal.label}>
          Review the contract renewal date and request an extension if the covered procurement program continues.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Contract Overview">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Buyer</div>
                <div className="mt-2 font-semibold text-slate-900">{contract.companyName || currentBuyer.companyName}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract Value</div>
                <div className="mt-2 font-mono text-xl font-extrabold text-blue-700">
                  {formatCurrency(contract.contractValue || 0, contract.currency || 'USD')}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Renewal</div>
                <div className="mt-2 font-semibold text-slate-900">{renewal.label}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Commercial Terms</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{contract.terms || 'Fixed-price supply terms.'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Terms</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{contract.paymentTerms || 'Net account terms.'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Terms</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{contract.deliveryTerms || 'Scheduled buyer receiving dock delivery.'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract Period</div>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {contract.startDate} to {contract.endDate}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Products Covered">
            <div className="flex flex-wrap gap-2">
              {(contract.productsCovered || ['Products defined by related PO']).map((product) => (
                <span key={product} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  {product}
                </span>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card title="Buyer Responsibilities">
              <ul className="space-y-2 text-sm text-slate-700">
                {(contract.buyerResponsibilities || ['Confirm receiving appointment', 'Inspect delivered goods']).map((item) => (
                  <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">{item}</li>
                ))}
              </ul>
            </Card>
            <Card title="Supplier Responsibilities">
              <ul className="space-y-2 text-sm text-slate-700">
                {(contract.supplierResponsibilities || ['Reserve stock', 'Coordinate fulfillment']).map((item) => (
                  <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">{item}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card title="Contract Milestones">
            <DataTable columns={milestoneColumns} data={contract.milestones || []} compact emptyMessage="No milestones recorded." />
          </Card>

          <Card title="Contract Documents">
            <DataTable columns={documentColumns} data={contract.documents || []} compact emptyMessage="No contract documents attached." />
          </Card>

          <Card title="Activity Timeline">
            <Timeline
              items={(contract.activityTimeline || []).map((event, index, events) => ({
                title: event.stage,
                date: event.date,
                actor: event.actor,
                description: event.description,
                completed: index < events.length - 1 || ['Active', 'Renewed', 'Renewal Requested'].includes(contract.status),
                active: index === events.length - 1 && !['Expired', 'Renewed'].includes(contract.status)
              }))}
            />
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Contract Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">PO Reference</span>
                <span className="font-mono font-bold text-slate-900">{contract.poNumber || 'Framework'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quote Reference</span>
                <span className="font-mono font-bold text-slate-900">{contract.quoteNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date</span>
                <span className="font-semibold text-slate-900">{contract.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">End Date</span>
                <span className="font-semibold text-slate-900">{contract.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Renewal Date</span>
                <span className="font-semibold text-slate-900">{contract.renewalDate || 'Not set'}</span>
              </div>
            </div>
          </Card>

          <Card title="Assigned Account Executive">
            <div className="space-y-2 text-sm">
              <div className="font-bold text-slate-900">{contract.assignedRep?.name || currentBuyer.assignedRep.name}</div>
              <div className="text-slate-600">{contract.assignedRep?.title || currentBuyer.assignedRep.title}</div>
              <div className="text-slate-600">{contract.assignedRep?.email || currentBuyer.assignedRep.email}</div>
            </div>
          </Card>

          <Card title="Related Records">
            <div className="flex flex-col gap-2">
              {relatedQuote ? (
                <Link to={`/buyer/quotes/${relatedQuote.id}`}>
                  <Button variant="outline" size="sm" icon={FileText} className="w-full">
                    View Quote
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={FileText} disabled>
                  Quote Unavailable
                </Button>
              )}
              {relatedPO ? (
                <Link to={`/buyer/purchase-orders/${relatedPO.id}`}>
                  <Button variant="outline" size="sm" icon={ShoppingBag} className="w-full">
                    View PO
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="sm" icon={ShoppingBag} disabled>
                  PO Unavailable
                </Button>
              )}
            </div>
          </Card>
        </aside>
      </div>

      <Modal
        isOpen={renewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        title={`Request renewal for ${getContractNumber(contract)}`}
        subtitle="Renewal request for buyer-visible tracking."
      >
        <div className="space-y-4">
          <Input
            label="Requested new end date"
            type="date"
            value={requestedNewEndDate}
            onChange={(event) => setRequestedNewEndDate(event.target.value)}
          />
          <Select
            label="Reason"
            value={renewalReason}
            onChange={(event) => setRenewalReason(event.target.value)}
            options={renewalReasons}
          />
          <Textarea
            label="Message"
            rows={4}
            value={renewalMessage}
            onChange={(event) => setRenewalMessage(event.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setRenewalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={handleRenewalSubmit}>
              Submit Renewal Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
