import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileWarning,
  Search,
  ShieldQuestion,
  UserCheck,
  XCircle
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  FilterBar,
  KPICard,
  PageHeader,
  Pagination,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BuyerApplication } from '../../types';

const pageSize = 8;

export const AdminApprovalsPage: React.FC = () => {
  const { buyerApplications } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [submittedFrom, setSubmittedFrom] = useState('');
  const [submittedTo, setSubmittedTo] = useState('');
  const [reviewerFilter, setReviewerFilter] = useState('ALL');
  const [documentFilter, setDocumentFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const summary = useMemo(
    () => ({
      pending: buyerApplications.filter((application) => application.status === 'Pending').length,
      missing: buyerApplications.filter((application) => application.documentStatus === 'Missing').length,
      underVerification: buyerApplications.filter((application) =>
        ['Under Review', 'Verification In Progress'].includes(application.status)
      ).length,
      approvedToday: buyerApplications.filter((application) =>
        application.status === 'Approved' &&
        application.approvalHistory.some((entry) => entry.timestamp.includes('2026-08-18'))
      ).length,
      rejected: buyerApplications.filter((application) => application.status === 'Rejected').length
    }),
    [buyerApplications]
  );

  const countries = Array.from(new Set(buyerApplications.map((application) => application.country)));
  const reviewers = Array.from(new Set(buyerApplications.map((application) => application.assignedReviewer)));
  const documentStatuses = Array.from(new Set(buyerApplications.map((application) => application.documentStatus)));

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return buyerApplications.filter((application) => {
      const searchable = [
        application.applicationNumber,
        application.companyName,
        application.contactName,
        application.contactEmail,
        application.registrationNumber,
        application.taxId
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || application.status === statusFilter;
      const matchesCountry = countryFilter === 'ALL' || application.country === countryFilter;
      const matchesDateFrom = !submittedFrom || application.submittedDate >= submittedFrom;
      const matchesDateTo = !submittedTo || application.submittedDate <= submittedTo;
      const matchesReviewer = reviewerFilter === 'ALL' || application.assignedReviewer === reviewerFilter;
      const matchesDocuments = documentFilter === 'ALL' || application.documentStatus === documentFilter;

      return matchesSearch && matchesStatus && matchesCountry && matchesDateFrom && matchesDateTo && matchesReviewer && matchesDocuments;
    });
  }, [buyerApplications, countryFilter, documentFilter, reviewerFilter, searchTerm, statusFilter, submittedFrom, submittedTo]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedApplications = filteredApplications.slice(
    (currentPageSafe - 1) * pageSize,
    currentPageSafe * pageSize
  );
  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    countryFilter !== 'ALL' ||
    submittedFrom !== '' ||
    submittedTo !== '' ||
    reviewerFilter !== 'ALL' ||
    documentFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCountryFilter('ALL');
    setSubmittedFrom('');
    setSubmittedTo('');
    setReviewerFilter('ALL');
    setDocumentFilter('ALL');
    setCurrentPage(1);
  };

  const columns: Column<BuyerApplication>[] = [
    {
      key: 'application',
      header: 'Application ID',
      accessor: (application) => (
        <div className="min-w-[180px]">
          <Link to={`/admin/approvals/${application.id}`} className="font-mono font-bold text-blue-700 hover:text-blue-900">
            {application.applicationNumber}
          </Link>
          <div className="text-xs text-slate-500">{application.submittedDate}</div>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      accessor: (application) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{application.companyName}</div>
          <div className="text-xs text-slate-500">{application.businessType}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      accessor: (application) => (
        <div className="min-w-[180px]">
          <div className="font-semibold text-slate-800">{application.contactName}</div>
          <div className="text-xs text-slate-500">{application.contactEmail}</div>
        </div>
      )
    },
    { key: 'country', header: 'Country', accessor: (application) => <span>{application.country}</span> },
    {
      key: 'documents',
      header: 'Documents',
      accessor: (application) => (
        <div>
          <div className="font-bold text-slate-900">{application.documents.length} file(s)</div>
          <div className="mt-1"><StatusBadge status={application.documentStatus} size="sm" /></div>
        </div>
      )
    },
    {
      key: 'risk',
      header: 'Risk / Verification',
      accessor: (application) => <StatusBadge status={application.riskStatus} size="sm" />
    },
    {
      key: 'reviewer',
      header: 'Assigned Reviewer',
      accessor: (application) => <span className="font-semibold text-slate-700">{application.assignedReviewer}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (application) => <StatusBadge status={application.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (application) => (
        <Link to={`/admin/approvals/${application.id}`}>
          <Button variant="outline" size="xs" icon={Eye}>
            Review
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Approval Queue"
        subtitle="Review buyer onboarding applications, document status, reviewer assignment, and verification risk."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Approvals' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard title="Pending Review" value={summary.pending} icon={UserCheck} subtext="Awaiting first action" />
        <KPICard title="Documents Missing" value={summary.missing} icon={FileWarning} subtext="Needs buyer follow-up" badge="Docs" badgeVariant="amber" />
        <KPICard title="Under Verification" value={summary.underVerification} icon={ShieldQuestion} subtext="Compliance in progress" />
        <KPICard title="Approved Today" value={summary.approvedToday} icon={CheckCircle2} subtext="Activated accounts" badge="Today" badgeVariant="success" />
        <KPICard title="Rejected" value={summary.rejected} icon={XCircle} subtext="Declined applications" badge="Closed" badgeVariant="danger" />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="approval-toolbar grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(320px,2fr)_minmax(170px,1fr)_minmax(170px,1fr)_auto] xl:items-end">
            <div className="search-field min-w-0">
              <label htmlFor="approval-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Search applications
              </label>
              <SearchBar
                id="approval-search"
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                placeholder="Search application, company, contact, registration, or tax ID..."
                className="w-full"
              />
            </div>
            <div className="date-field min-w-0">
              <label htmlFor="approval-date-from" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Date From
              </label>
              <input
                id="approval-date-from"
                type="date"
                value={submittedFrom}
                onChange={(event) => {
                  setSubmittedFrom(event.target.value);
                  setCurrentPage(1);
                }}
                className="block h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="date-field min-w-0">
              <label htmlFor="approval-date-to" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Date To
              </label>
              <input
                id="approval-date-to"
                type="date"
                value={submittedTo}
                onChange={(event) => {
                  setSubmittedTo(event.target.value);
                  setCurrentPage(1);
                }}
                className="block h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
              disabled={!hasActiveFilters}
            >
              Clear
            </button>
          </div>

          <FilterBar
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: (value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                },
                options: [
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Under Review', value: 'Under Review' },
                  { label: 'Verification In Progress', value: 'Verification In Progress' },
                  { label: 'Additional Documents Required', value: 'Additional Documents Required' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Rejected', value: 'Rejected' }
                ]
              },
              {
                id: 'country',
                label: 'Country',
                value: countryFilter,
                onChange: (value) => {
                  setCountryFilter(value);
                  setCurrentPage(1);
                },
                options: countries.map((country) => ({ label: country, value: country }))
              },
              {
                id: 'reviewer',
                label: 'Reviewer',
                value: reviewerFilter,
                onChange: (value) => {
                  setReviewerFilter(value);
                  setCurrentPage(1);
                },
                options: reviewers.map((reviewer) => ({ label: reviewer, value: reviewer }))
              },
              {
                id: 'documents',
                label: 'Document Status',
                value: documentFilter,
                onChange: (value) => {
                  setDocumentFilter(value);
                  setCurrentPage(1);
                },
                options: documentStatuses.map((status) => ({ label: status, value: status }))
              }
            ]}
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          />
        </div>

        {filteredApplications.length === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState
              icon={Search}
              title="No applications found"
              description="Try changing the reviewer, status, document, country, date, or search filters."
              actionText="Reset Filters"
              actionIcon={ClipboardCheck}
              onAction={resetFilters}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4 pt-0">
            <DataTable columns={columns} data={paginatedApplications} compact />
            <Pagination
              currentPage={currentPageSafe}
              totalPages={totalPages}
              totalItems={filteredApplications.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
