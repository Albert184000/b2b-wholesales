import React, { useState } from 'react';
import { AlertTriangle, Download, Eye, FileCheck, FilePlus, ShieldCheck, UploadCloud } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  FileUpload,
  Input,
  KPICard,
  Modal,
  PageHeader,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BuyerDocument, BusinessDocument } from '../../types';

type DocumentRow = {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  expiryDate?: string;
  size?: string;
  status: string;
  reviewer?: string;
  notes?: string;
};

export const BuyerDocumentsPage: React.FC = () => {
  const { currentBuyer, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRow | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<DocumentRow[]>([]);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('Business Registration');
  const [uploadExpiry, setUploadExpiry] = useState('2027-08-24');
  const [uploadSize, setUploadSize] = useState('');

  const businessDocs: DocumentRow[] = (currentBuyer.businessDocuments || []).map((document: BusinessDocument) => ({
    id: document.id,
    name: document.fileName || document.document,
    type: document.document,
    uploadedDate: document.uploadedDate,
    expiryDate: document.expiry,
    size: document.fileSize,
    status: document.verificationStatus,
    reviewer: 'Compliance Review',
    notes: document.verificationStatus === 'Verified' ? 'Verified for buyer account approval.' : 'Pending compliance review.'
  }));

  const legacyDocs: DocumentRow[] = (currentBuyer.documents || []).map((document: BuyerDocument, index) => ({
    id: `doc-${index}`,
    name: document.name,
    type: document.type || 'Business Document',
    uploadedDate: document.uploadedDate || document.uploadedAt || currentBuyer.joinedDate,
    size: document.size,
    status: document.status || (document.verified ? 'Verified' : 'Pending'),
    reviewer: document.verified ? 'Compliance Review' : 'Document Review Queue',
    notes: document.verified ? 'Legacy document verified.' : 'Awaiting review decision.'
  }));

  const documentRows = [...uploadedDocs, ...businessDocs, ...legacyDocs].filter(
    (document, index, rows) => rows.findIndex((item) => item.name === document.name) === index
  );
  const documentTypes = Array.from(new Set(documentRows.map((document) => document.type))).sort();
  const documentStatuses = Array.from(new Set(documentRows.map((document) => document.status))).sort();

  const filteredDocuments = documentRows.filter((document) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesType = typeFilter === 'ALL' || document.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || document.status === statusFilter;
    const matchesSearch =
      query === '' ||
      document.name.toLowerCase().includes(query) ||
      document.type.toLowerCase().includes(query) ||
      document.status.toLowerCase().includes(query);

    return matchesSearch && matchesType && matchesStatus;
  });

  const verifiedCount = documentRows.filter((document) => document.status === 'Verified').length;
  const pendingCount = documentRows.filter((document) => document.status !== 'Verified').length;
  const expiryAttentionCount = documentRows.filter((document) => {
    if (!document.expiryDate) return false;
    const expiryTime = new Date(`${document.expiryDate}T00:00:00`).getTime();
    const referenceTime = new Date('2026-08-24T00:00:00').getTime();
    const daysUntilExpiry = Math.ceil((expiryTime - referenceTime) / (1000 * 60 * 60 * 24));

    return daysUntilExpiry <= 90;
  }).length;

  const handleUploadSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const documentName = uploadName.trim() || `${uploadType} - Uploaded Document.pdf`;
    const newDocument: DocumentRow = {
      id: `buyer-upload-${Date.now()}`,
      name: documentName,
      type: uploadType,
      uploadedDate: '2026-08-24',
      expiryDate: uploadExpiry,
      size: uploadSize || 'Pending file',
      status: 'Pending',
      reviewer: 'Document Review Queue',
      notes: 'Submitted by buyer and awaiting compliance review.'
    };

    setUploadedDocs((current) => [newDocument, ...current]);
    setUploadName('');
    setUploadType('Business Registration');
    setUploadExpiry('2027-08-24');
    setUploadSize('');
    setUploadModalOpen(false);
    showToast(`${documentName} submitted for review.`, 'success');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  const columns: Column<DocumentRow>[] = [
    {
      key: 'document',
      header: 'Document',
      accessor: (document) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{document.name}</div>
          <div className="text-xs text-slate-500">{document.type}</div>
        </div>
      )
    },
    { key: 'uploaded', header: 'Uploaded', accessor: (document) => <span className="font-semibold text-slate-700">{document.uploadedDate}</span> },
    {
      key: 'expiry',
      header: 'Expiry',
      accessor: (document) => (
        <div className="min-w-[120px]">
          <div className="font-semibold text-slate-700">{document.expiryDate || 'Not required'}</div>
          {document.expiryDate && <div className="text-[11px] text-slate-500">Renew before expiry</div>}
        </div>
      )
    },
    { key: 'size', header: 'Size', accessor: (document) => <span className="text-slate-600">{document.size || 'N/A'}</span> },
    { key: 'status', header: 'Status', accessor: (document) => <StatusBadge status={document.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (document) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="outline" size="xs" icon={Eye} onClick={() => setSelectedDocument(document)}>
            View
          </Button>
          <Button variant="outline" size="xs" icon={Download} onClick={() => showToast(`${document.name} download queued.`, 'info')}>
            Download
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Documents"
        subtitle="Manage business registration, tax, credit, and compliance documents attached to your buyer account."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Documents' }
        ]}
        actions={
          <Button variant="primary" size="sm" icon={UploadCloud} onClick={() => setUploadModalOpen(true)}>
            Upload Document
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Documents" value={documentRows.length} subtext="Stored in workspace" icon={FileCheck} />
        <KPICard title="Verified" value={verifiedCount} subtext="Approved by compliance" icon={ShieldCheck} />
        <KPICard title="Pending" value={pendingCount} subtext="Needs review or refresh" icon={FilePlus} />
        <KPICard title="Expiry Attention" value={expiryAttentionCount} subtext="Expired or within 90 days" icon={AlertTriangle} />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search documents by name, type, or status..." />
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              options={[{ label: 'All document types', value: 'ALL' }, ...documentTypes.map((type) => ({ label: type, value: type }))]}
            />
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={[{ label: 'All statuses', value: 'ALL' }, ...documentStatuses.map((status) => ({ label: status, value: status }))]}
            />
            <Button type="button" variant="outline" size="sm" onClick={resetFilters} disabled={!hasActiveFilters}>
              Clear
            </Button>
          </div>
          <DataTable columns={columns} data={filteredDocuments} emptyMessage="No documents match the current search." />
        </div>
      </Card>

      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Business Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Name"
            value={uploadName}
            onChange={(event) => setUploadName(event.target.value)}
            placeholder="e.g. Updated VAT Certificate.pdf"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Document Type"
              value={uploadType}
              onChange={(event) => setUploadType(event.target.value)}
              options={[
                { label: 'Business Registration', value: 'Business Registration' },
                { label: 'Tax Certificate', value: 'Tax Certificate' },
                { label: 'Credit Application', value: 'Credit Application' },
                { label: 'Authorized Buyer Letter', value: 'Authorized Buyer Letter' },
                { label: 'Compliance Document', value: 'Compliance Document' }
              ]}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={uploadExpiry}
              onChange={(event) => setUploadExpiry(event.target.value)}
              helperText="Leave the default if the document does not expire in this mock flow."
            />
          </div>
          <FileUpload
            label="Attachment"
            helperText="PDF, PNG, JPG, or DOCX up to 10MB"
            onFilesSelected={(files) => {
              const firstFile = files[0];
              if (!firstFile) return;
              setUploadName((current) => current || firstFile.name);
              setUploadSize(`${(firstFile.size / (1024 * 1024)).toFixed(2)} MB`);
            }}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit for Review
            </Button>
          </div>
        </form>
      </Modal>

      {selectedDocument && (
        <Modal
          isOpen={Boolean(selectedDocument)}
          onClose={() => setSelectedDocument(null)}
          title={selectedDocument.name}
          subtitle="Document lifecycle, expiry, and review status."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Type</div>
                <div className="mt-1 font-bold text-slate-900">{selectedDocument.type}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</div>
                <div className="mt-2">
                  <StatusBadge status={selectedDocument.status} size="sm" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Uploaded</div>
                <div className="mt-1 font-semibold text-slate-900">{selectedDocument.uploadedDate}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Expiry</div>
                <div className="mt-1 font-semibold text-slate-900">{selectedDocument.expiryDate || 'Not required'}</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Review Notes</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedDocument.notes}</p>
              <div className="mt-3 text-xs font-semibold text-slate-500">Reviewer: {selectedDocument.reviewer}</div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              {['Submitted', 'Under Review', selectedDocument.status === 'Verified' ? 'Verified' : 'Decision Pending'].map((stage, index) => (
                <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-xs font-black text-white">
                    {index + 1}
                  </div>
                  <div className="mt-2 font-bold text-slate-900">{stage}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
