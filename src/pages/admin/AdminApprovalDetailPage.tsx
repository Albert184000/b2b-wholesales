import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  FileText,
  MessageSquareWarning,
  Send,
  UserCheck,
  Users,
  XCircle
} from 'lucide-react';
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
import { BusinessDocument, BuyerGroup } from '../../types';
import { formatCurrency } from '../../utils/pricing';

const rejectionReasons = [
  'Invalid documents',
  'Unable to verify business',
  'Duplicate registration',
  'Incomplete application',
  'Compliance issue',
  'Other'
];

const requiredDocumentOptions = [
  'Business License',
  'Tax Certificate',
  'Company Registration',
  'Proof of Address',
  'Other'
];

export const AdminApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    buyerApplications,
    approveBuyerApplication,
    rejectBuyerApplication,
    requestBuyerApplicationDocuments,
    assignBuyerApplicationReviewer,
    updateBuyerApplicationAssignment,
    showToast
  } = useApp();
  const application = buyerApplications.find((record) => record.id === id || record.applicationNumber === id || record.buyerId === id);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [reviewerModalOpen, setReviewerModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [buyerGroup, setBuyerGroup] = useState<BuyerGroup>('Corporate');
  const [creditLimit, setCreditLimit] = useState(50000);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [accountExecutive, setAccountExecutive] = useState('David Chen');
  const [internalNote, setInternalNote] = useState('Approved after business registration, tax ID, and document review.');
  const [rejectionReason, setRejectionReason] = useState(rejectionReasons[0]);
  const [rejectInternalNote, setRejectInternalNote] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('We could not approve your application based on the documents provided.');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(['Tax Certificate']);
  const [docsMessage, setDocsMessage] = useState('Please upload the requested documents so compliance review can continue.');
  const [assignedReviewer, setAssignedReviewer] = useState('Un Somnang');

  const completion = useMemo(() => {
    if (!application) return { completed: 0, total: 0, percentage: 0 };
    const completed = application.verificationChecklist.filter((item) => item.completed).length;
    const total = application.verificationChecklist.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [application]);

  if (!application) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Application not found"
        description="The requested buyer approval application is not available in the current workspace."
        actionText="Back to Approvals"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/admin/approvals')}
      />
    );
  }

  const canApprove = !['Approved', 'Rejected'].includes(application.status);
  const documentColumns: Column<BusinessDocument>[] = [
    {
      key: 'document',
      header: 'Document',
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
        </div>
      )
    }
  ];

  const toggleRequiredDocument = (document: string) => {
    setRequiredDocuments((prev) =>
      prev.includes(document) ? prev.filter((item) => item !== document) : [...prev, document]
    );
  };

  const submitApproval = () => {
    approveBuyerApplication(application.id, {
      buyerGroup,
      creditLimit,
      paymentTerms,
      accountExecutive,
      internalNote
    });
    setApproveModalOpen(false);
  };

  const submitRejection = () => {
    rejectBuyerApplication(application.id, rejectionReason, rejectInternalNote, buyerMessage);
    setRejectModalOpen(false);
  };

  const submitDocsRequest = () => {
    requestBuyerApplicationDocuments(application.id, requiredDocuments, docsMessage);
    setDocsModalOpen(false);
  };

  const submitReviewer = () => {
    assignBuyerApplicationReviewer(application.id, assignedReviewer);
    setReviewerModalOpen(false);
  };

  const submitAssignment = () => {
    updateBuyerApplicationAssignment(application.id, { buyerGroup, accountExecutive });
    setAssignmentModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={application.applicationNumber}
        subtitle={`${application.companyName} / Submitted ${application.submittedDate} / Reviewer ${application.assignedReviewer}`}
        badge={<StatusBadge status={application.status} />}
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Approvals', href: '/admin/approvals' },
          { label: application.applicationNumber }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/approvals">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={UserCheck} onClick={() => setReviewerModalOpen(true)}>
              Assign Reviewer
            </Button>
            <Button variant="outline" size="sm" icon={Users} onClick={() => setAssignmentModalOpen(true)}>
              Assign AE / Group
            </Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={() => setDocsModalOpen(true)} disabled={!canApprove}>
              Request Documents
            </Button>
            <Button variant="danger" size="sm" icon={XCircle} onClick={() => setRejectModalOpen(true)} disabled={!canApprove}>
              Reject
            </Button>
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => setApproveModalOpen(true)} disabled={!canApprove}>
              Approve Buyer
            </Button>
          </div>
        }
      />

      {application.status === 'Additional Documents Required' && (
        <Alert type="warning" title="Additional documents required">
          This application is waiting for buyer document replacement before approval can continue.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Company Information" className="border-slate-200">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                ['Company', application.companyName],
                ['Industry', application.industry],
                ['Business Type', application.businessType],
                ['Registration Number', application.registrationNumber],
                ['Tax ID', application.taxId],
                ['Website', application.website || 'Not provided']
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
                  <div className="mt-2 font-semibold text-slate-900 break-words">{value}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Primary Contact" className="border-slate-200">
              <div className="space-y-3 text-sm">
                <div className="font-extrabold text-slate-900">{application.contactName}</div>
                <div className="text-slate-600">{application.contactEmail}</div>
                <div className="text-slate-600">{application.contactPhone}</div>
              </div>
            </Card>

            <Card title="Business Address" className="border-slate-200">
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-slate-900">{application.address}</div>
                <div className="text-slate-600">{application.city}, {application.country}</div>
              </div>
            </Card>
          </div>

          <Card title="Documents" className="border-slate-200">
            <DataTable columns={documentColumns} data={application.documents} compact />
          </Card>

          <Card title="Verification Checklist" className="border-slate-200">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>{completion.completed} / {completion.total} checks completed</span>
                <span>{completion.percentage}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${completion.percentage}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {application.verificationChecklist.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {item.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                    {item.note && <div className="mt-1 text-xs text-slate-500">{item.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Internal Notes" className="border-slate-200">
              <div className="space-y-3">
                {(application.internalNotes || []).map((note) => (
                  <div key={note} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {note}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Approval History" className="border-slate-200">
              <Timeline
                items={application.approvalHistory.map((entry, index) => ({
                  title: entry.action,
                  date: entry.timestamp,
                  actor: entry.actor,
                  description: entry.note,
                  completed: index < application.approvalHistory.length - 1 || ['Approved', 'Rejected'].includes(application.status),
                  active: index === application.approvalHistory.length - 1 && !['Approved', 'Rejected'].includes(application.status)
                }))}
              />
            </Card>
          </div>
        </div>

        <aside className="space-y-6">
          <Card title="Review Summary" className="border-slate-200">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Document Status</span>
                <StatusBadge status={application.documentStatus} size="sm" />
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Risk Status</span>
                <StatusBadge status={application.riskStatus} size="sm" />
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Buyer Group</span>
                <span className="font-bold text-slate-900">{application.buyerGroup || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Account Executive</span>
                <span className="font-bold text-slate-900">{application.assignedAccountExecutive || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Proposed Credit</span>
                <span className="font-mono font-bold text-blue-700">
                  {formatCurrency(application.creditProfile?.creditLimit || creditLimit)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Quick Actions" className="border-slate-200">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" icon={UserCheck} onClick={() => setReviewerModalOpen(true)}>
                Assign Reviewer
              </Button>
              <Button variant="outline" size="sm" icon={Users} onClick={() => setAssignmentModalOpen(true)}>
                Change Group / AE
              </Button>
              <Button variant="outline" size="sm" icon={Send} onClick={() => setDocsModalOpen(true)} disabled={!canApprove}>
                Request More Documents
              </Button>
              <Button variant="danger" size="sm" icon={XCircle} onClick={() => setRejectModalOpen(true)} disabled={!canApprove}>
                Reject Application
              </Button>
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => setApproveModalOpen(true)} disabled={!canApprove}>
                Approve Buyer
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title={`Approve ${application.companyName}`} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Buyer Group"
              value={buyerGroup}
              onChange={(event) => setBuyerGroup(event.target.value as BuyerGroup)}
              options={[
                { label: 'Standard', value: 'Standard' },
                { label: 'Corporate', value: 'Corporate' },
                { label: 'VIP', value: 'VIP' },
                { label: 'Distributor', value: 'Distributor' }
              ]}
            />
            <Input label="Credit Limit" type="number" step="5000" value={creditLimit} onChange={(event) => setCreditLimit(Number(event.target.value))} />
            <Select
              label="Payment Terms"
              value={paymentTerms}
              onChange={(event) => setPaymentTerms(event.target.value)}
              options={[
                { label: 'Net-30', value: 'Net 30' },
                { label: 'Net-60', value: 'Net 60' },
                { label: 'Advance Wire', value: 'Advance Wire' }
              ]}
            />
            <Select
              label="Account Executive"
              value={accountExecutive}
              onChange={(event) => setAccountExecutive(event.target.value)}
              options={[
                { label: 'David Chen', value: 'David Chen' },
                { label: 'Sophea Chan', value: 'Sophea Chan' },
                { label: 'Dara Sok', value: 'Dara Sok' },
                { label: 'Sarah Jenkins', value: 'Sarah Jenkins' }
              ]}
            />
          </div>
          <Textarea label="Internal Note" rows={3} value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={submitApproval}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title={`Reject ${application.companyName}`} size="lg">
        <div className="space-y-4">
          <Select
            label="Reason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            options={rejectionReasons.map((reason) => ({ label: reason, value: reason }))}
          />
          <Textarea label="Internal Note" rows={3} value={rejectInternalNote} onChange={(event) => setRejectInternalNote(event.target.value)} />
          <Textarea label="Buyer-Facing Message" rows={3} value={buyerMessage} onChange={(event) => setBuyerMessage(event.target.value)} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" icon={MessageSquareWarning} onClick={submitRejection}>
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={docsModalOpen} onClose={() => setDocsModalOpen(false)} title="Request More Documents">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {requiredDocumentOptions.map((document) => (
              <label key={document} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={requiredDocuments.includes(document)}
                  onChange={() => toggleRequiredDocument(document)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{document}</span>
              </label>
            ))}
          </div>
          <Textarea label="Message" rows={4} value={docsMessage} onChange={(event) => setDocsMessage(event.target.value)} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setDocsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={FileCheck} onClick={submitDocsRequest} disabled={requiredDocuments.length === 0}>
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={reviewerModalOpen} onClose={() => setReviewerModalOpen(false)} title="Assign Reviewer">
        <div className="space-y-4">
          <Select
            label="Reviewer"
            value={assignedReviewer}
            onChange={(event) => setAssignedReviewer(event.target.value)}
            options={[
              { label: 'Un Somnang', value: 'Un Somnang' },
              { label: 'Finance Support', value: 'Finance Support' },
              { label: 'Compliance Desk', value: 'Compliance Desk' }
            ]}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setReviewerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={UserCheck} onClick={submitReviewer}>
              Assign Reviewer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={assignmentModalOpen} onClose={() => setAssignmentModalOpen(false)} title="Assign Account Executive & Buyer Group">
        <div className="space-y-4">
          <Select
            label="Buyer Group"
            value={buyerGroup}
            onChange={(event) => setBuyerGroup(event.target.value as BuyerGroup)}
            options={[
              { label: 'Standard', value: 'Standard' },
              { label: 'Corporate', value: 'Corporate' },
              { label: 'VIP', value: 'VIP' },
              { label: 'Distributor', value: 'Distributor' }
            ]}
          />
          <Select
            label="Account Executive"
            value={accountExecutive}
            onChange={(event) => setAccountExecutive(event.target.value)}
            options={[
              { label: 'David Chen', value: 'David Chen' },
              { label: 'Sophea Chan', value: 'Sophea Chan' },
              { label: 'Dara Sok', value: 'Dara Sok' },
              { label: 'Sarah Jenkins', value: 'Sarah Jenkins' }
            ]}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Users} onClick={submitAssignment}>
              Save Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
