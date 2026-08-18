import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock3, FileText, PenLine, RefreshCw, ShieldCheck } from 'lucide-react';
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
import { Contract } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { getContractNumber, getContractRenewalState } from '../../utils/poContract';

const PAGE_SIZE = 6;

const statusOptions = [
  'Draft',
  'Pending Approval',
  'Pending Signature',
  'Active',
  'Near Expiry',
  'Expired',
  'Renewed',
  'Terminated',
  'Renewal Requested'
].map((status) => ({ label: status, value: status }));

const renewalOptions = [
  { label: 'Near expiry', value: 'NEAR_EXPIRY' },
  { label: 'Renewal requested', value: 'RENEWAL_REQUESTED' },
  { label: 'Expired', value: 'EXPIRED' }
];

export const BuyerContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const { contracts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [renewalFilter, setRenewalFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredContracts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return contracts.filter((contract) => {
      const renewal = getContractRenewalState(contract);
      const haystack = [
        contract.id,
        contract.contractNumber,
        contract.title,
        contract.poNumber,
        contract.quoteNumber,
        contract.productsCovered?.join(' ')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchStatus = statusFilter === 'ALL' || contract.status === statusFilter;
      const matchRenewal =
        renewalFilter === 'ALL' ||
        (renewalFilter === 'NEAR_EXPIRY' && renewal.isNearExpiry) ||
        (renewalFilter === 'RENEWAL_REQUESTED' && contract.renewalStatus === 'Renewal Requested') ||
        (renewalFilter === 'EXPIRED' && renewal.isExpired);

      return matchSearch && matchStatus && matchRenewal;
    });
  }, [contracts, renewalFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / PAGE_SIZE));
  const pagedContracts = filteredContracts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeCount = contracts.filter((contract) => contract.status === 'Active').length;
  const nearExpiryCount = contracts.filter((contract) => getContractRenewalState(contract).isNearExpiry).length;
  const pendingSignatureCount = contracts.filter((contract) => contract.status === 'Pending Signature').length;
  const renewedCount = contracts.filter((contract) => contract.status === 'Renewed').length;
  const expiredCount = contracts.filter((contract) => contract.status === 'Expired').length;

  const columns: Column<Contract>[] = [
    {
      key: 'contract',
      header: 'Contract Number',
      accessor: (contract) => (
        <div className="min-w-[240px]">
          <span className="block font-mono text-xs font-bold text-blue-600">{getContractNumber(contract)}</span>
          <span className="block truncate font-semibold text-slate-900">{contract.title}</span>
        </div>
      )
    },
    {
      key: 'po',
      header: 'PO Number',
      accessor: (contract) =>
        contract.poId || contract.poNumber ? (
          <Link to={`/buyer/purchase-orders/${contract.poId || contract.poNumber}`} className="font-mono text-xs font-bold text-blue-700 hover:underline">
            {contract.poNumber || contract.poId}
          </Link>
        ) : (
          <span className="text-xs text-slate-500">Framework</span>
        )
    },
    {
      key: 'period',
      header: 'Start / End',
      accessor: (contract) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{contract.startDate}</div>
          <div className="text-slate-500">to {contract.endDate}</div>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Contract Value',
      align: 'right',
      accessor: (contract) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(contract.contractValue || 0, contract.currency || 'USD')}
        </span>
      )
    },
    {
      key: 'terms',
      header: 'Payment Terms',
      accessor: (contract) => <span className="text-xs font-semibold text-slate-700">{contract.paymentTerms || contract.terms}</span>
    },
    {
      key: 'milestones',
      header: 'Milestones',
      accessor: (contract) => (
        <div className="text-xs">
          <div className="font-bold text-slate-900">{contract.milestones?.length || 0}</div>
          <div className="text-slate-500">
            {(contract.milestones || []).filter((milestone) => milestone.status === 'Completed').length} completed
          </div>
        </div>
      )
    },
    {
      key: 'renewal',
      header: 'Renewal Date',
      accessor: (contract) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{contract.renewalDate || 'Not set'}</div>
          <div className="text-slate-500">{getContractRenewalState(contract).label}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (contract) => <StatusBadge status={contract.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (contract) => (
        <Link to={`/buyer/contracts/${contract.id}`} onClick={(event) => event.stopPropagation()}>
          <Button variant="outline" size="xs" icon={ArrowRight} iconPosition="right">
            Open
          </Button>
        </Link>
      )
    }
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setRenewalFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        subtitle="Review buyer supply contracts, milestones, renewal status, and related documents."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Contracts' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard title="Active Contracts" value={activeCount} icon={ShieldCheck} />
        <KPICard title="Near Expiry" value={nearExpiryCount} icon={Clock3} badge="45 days" badgeVariant="amber" />
        <KPICard title="Pending Signature" value={pendingSignatureCount} icon={PenLine} />
        <KPICard title="Renewed" value={renewedCount} icon={RefreshCw} badge="Closed" badgeVariant="success" />
        <KPICard title="Expired" value={expiredCount} icon={FileText} badgeVariant="danger" />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="min-w-0 flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Search contract, PO, quote, product, or title..."
            />
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
                options: statusOptions
              },
              {
                id: 'renewal',
                label: 'Renewal',
                value: renewalFilter,
                onChange: (value) => {
                  setRenewalFilter(value);
                  setCurrentPage(1);
                },
                options: renewalOptions
              }
            ]}
            hasActiveFilters={statusFilter !== 'ALL' || renewalFilter !== 'ALL' || searchTerm !== ''}
            onReset={resetFilters}
          />
        </div>

        {filteredContracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No contracts found"
            description="Clear filters or open an approved purchase order to review its related contract."
            actionText="View Purchase Orders"
            onAction={() => navigate('/buyer/purchase-orders')}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagedContracts}
              keyExtractor={(contract) => contract.id}
              onRowClick={(contract) => navigate(`/buyer/contracts/${contract.id}`)}
            />
            <Pagination
              currentPage={Math.min(currentPage, totalPages)}
              totalPages={totalPages}
              totalItems={filteredContracts.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>
    </div>
  );
};
