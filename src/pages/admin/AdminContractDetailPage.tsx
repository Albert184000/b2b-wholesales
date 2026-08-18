import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, FileText, RefreshCw, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  KPICard,
  PageHeader,
  StatusBadge,
  Timeline
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { ContractDocument, ContractMilestone } from '../../types';
import { formatCurrency } from '../../utils/pricing';

export const AdminContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { contracts, purchaseOrders, updateContractStatus, showToast } = useApp();
  const contract = contracts.find((record) => record.id === id || record.contractNumber === id);

  if (!contract) {
    return (
      <EmptyState
        icon={FileText}
        title="Contract not found"
        description="The requested contract record is not available in the current admin workspace."
        actionText="Back to Contracts"
        actionIcon={ArrowLeft}
        onAction={() => window.history.back()}
      />
    );
  }

  const relatedPO = purchaseOrders.find((po) => po.id === contract.poId || po.poNumber === contract.poNumber);

  const documentColumns: Column<ContractDocument>[] = [
    {
      key: 'name',
      header: 'Document',
      accessor: (document) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{document.title}</div>
          <div className="text-xs text-slate-500">{document.name || document.type}</div>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Uploaded',
      accessor: (document) => <span className="font-semibold text-slate-700">{document.uploadedDate}</span>
    },
    {
      key: 'version',
      header: 'Version',
      accessor: (document) => <StatusBadge status={document.version || 'v1'} size="sm" showDot={false} />
    },
    {
      key: 'action',
      header: 'Action',
      accessor: (document) => (
        <Button variant="outline" size="xs" icon={Download} onClick={() => showToast(`${document.title} download queued.`, 'info')}>
          Download
        </Button>
      )
    }
  ];

  const milestoneColumns: Column<ContractMilestone>[] = [
    {
      key: 'title',
      header: 'Milestone',
      accessor: (milestone) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{milestone.title}</div>
          {milestone.notes && <div className="text-xs text-slate-500">{milestone.notes}</div>}
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
        <span className="font-mono font-bold text-slate-900">{milestone.amount ? formatCurrency(milestone.amount) : 'N/A'}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (milestone) => <StatusBadge status={milestone.status} size="sm" />
    }
  ];

  const timelineItems = (contract.activityTimeline || []).map((item) => ({
    title: item.stage,
    date: item.date,
    actor: item.actor,
    description: item.description,
    completed: true
  }));

  const setStatus = (status: string) => {
    updateContractStatus(contract.id, status);
    showToast(`${contract.contractNumber || contract.id} moved to ${status}.`, status === 'Terminated' ? 'warning' : 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={contract.contractNumber || contract.id.toUpperCase()}
        subtitle={contract.title}
        breadcrumbs={[
          { label: 'Contracts', href: '/admin/contracts' },
          { label: contract.contractNumber || contract.id }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/contracts">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => setStatus('Renewal Requested')}>
              Renewal Review
            </Button>
            <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => setStatus('Active')}>
              Mark Active
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Contract Value" value={formatCurrency(contract.contractValue || 0, contract.currency || 'USD')} subtext={contract.paymentTerms || contract.terms} icon={FileText} />
        <KPICard title="Buyer" value={contract.companyName || contract.buyerName || contract.buyerId} subtext={contract.buyerGroup || 'Buyer group pending'} icon={Users} />
        <KPICard title="Status" value={contract.status} subtext={contract.renewalStatus || 'Renewal not due'} icon={ShieldCheck} />
        <KPICard title="Related PO" value={relatedPO?.poNumber || contract.poNumber || 'N/A'} subtext={contract.endDate} icon={ShoppingBag} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Agreement Terms" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ['Start Date', contract.startDate],
              ['End Date', contract.endDate],
              ['Delivery Terms', contract.deliveryTerms || 'Standard contracted freight'],
              ['Payment Terms', contract.paymentTerms || contract.terms || 'Per buyer credit agreement']
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
                <div className="mt-1 font-semibold text-slate-900">{value}</div>
              </div>
            ))}
          </div>
          {relatedPO && (
            <Link to={`/admin/purchase-orders/${relatedPO.id}`} className="mt-4 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900">
              Open related purchase order
            </Link>
          )}
        </Card>

        <Card title="Activity Timeline">
          <Timeline items={timelineItems} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Contract Milestones">
          <DataTable columns={milestoneColumns} data={contract.milestones || []} compact emptyMessage="No contract milestones are attached." />
        </Card>
        <Card title="Contract Documents">
          <DataTable columns={documentColumns} data={contract.documents || []} compact emptyMessage="No contract documents are attached." />
        </Card>
      </div>

      <Card title="Responsibilities">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-bold text-slate-900">Buyer Responsibilities</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(contract.buyerResponsibilities || ['Confirm receiving appointment', 'Inspect delivered goods', 'Pay invoices according to assigned terms']).map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-bold text-slate-900">Supplier Responsibilities</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(contract.supplierResponsibilities || ['Reserve contracted stock', 'Coordinate carrier dispatch', 'Provide invoice and warranty documentation']).map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
