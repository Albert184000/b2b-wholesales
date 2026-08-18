import React, { useState } from 'react';
import { Download, FileCheck, FilePlus, Search, ShieldCheck, UploadCloud } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  KPICard,
  Modal,
  PageHeader,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BuyerDocument, BusinessDocument } from '../../types';

type DocumentRow = {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  size?: string;
  status: string;
};

export const BuyerDocumentsPage: React.FC = () => {
  const { currentBuyer, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const businessDocs: DocumentRow[] = (currentBuyer.businessDocuments || []).map((document: BusinessDocument) => ({
    id: document.id,
    name: document.fileName || document.document,
    type: document.document,
    uploadedDate: document.uploadedDate,
    size: document.fileSize,
    status: document.verificationStatus
  }));

  const legacyDocs: DocumentRow[] = (currentBuyer.documents || []).map((document: BuyerDocument, index) => ({
    id: `doc-${index}`,
    name: document.name,
    type: document.type || 'Business Document',
    uploadedDate: document.uploadedDate || document.uploadedAt || currentBuyer.joinedDate,
    size: document.size,
    status: document.status || (document.verified ? 'Verified' : 'Pending')
  }));

  const documentRows = [...businessDocs, ...legacyDocs].filter(
    (document, index, rows) => rows.findIndex((item) => item.name === document.name) === index
  );

  const filteredDocuments = documentRows.filter((document) => {
    const query = searchTerm.trim().toLowerCase();
    return (
      query === '' ||
      document.name.toLowerCase().includes(query) ||
      document.type.toLowerCase().includes(query) ||
      document.status.toLowerCase().includes(query)
    );
  });

  const verifiedCount = documentRows.filter((document) => document.status === 'Verified').length;

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
    { key: 'size', header: 'Size', accessor: (document) => <span className="text-slate-600">{document.size || 'N/A'}</span> },
    { key: 'status', header: 'Status', accessor: (document) => <StatusBadge status={document.status} size="sm" /> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (document) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="outline" size="xs" onClick={() => showToast(`${document.name} opened for review.`, 'info')}>
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
        <KPICard title="Pending" value={Math.max(0, documentRows.length - verifiedCount)} subtext="Needs review or refresh" icon={FilePlus} />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search documents by name, type, or status..." />
          </div>
          <DataTable columns={columns} data={filteredDocuments} emptyMessage="No documents match the current search." />
        </div>
      </Card>

      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Business Document">
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-blue-700" />
            <div className="mt-3 font-bold text-slate-900">Document upload</div>
            <p className="mt-1 text-sm text-slate-500">Attach registration, tax, credit, or compliance files for account review.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setUploadModalOpen(false);
                showToast('Document upload added to the workspace.', 'success');
              }}
            >
              Submit for Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
