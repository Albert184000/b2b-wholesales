import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, FileText, RotateCcw } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  PageHeader,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Contract } from '../../types';

const pageSize = 8;
const referenceDate = new Date('2026-08-19T00:00:00');
const dayInMs = 24 * 60 * 60 * 1000;
const expiringSoonDays = 45;

type ExpiryFilter = 'ALL' | 'SOON' | 'EXPIRED';

type ContractDisplayRow = Contract & {
  displayId: string;
  corporateBuyer: string;
  secondaryBuyerText: string;
  displayTier: string;
  displayTerms: string;
  expiryStatus: 'Active' | 'Near Expiry' | 'Expired' | 'Pending Signature';
  expiryDescription: string;
  daysRemaining: number;
};

const formatContractId = (contract: Contract) => (contract.contractNumber || contract.id).toUpperCase();

const parseDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDaysRemaining = (endDate: string) => {
  const parsedEndDate = parseDate(endDate);
  if (!parsedEndDate) return 0;
  return Math.ceil((parsedEndDate.getTime() - referenceDate.getTime()) / dayInMs);
};

const getExpiryDetails = (contract: Contract) => {
  if (contract.status === 'Pending Signature') {
    return {
      expiryStatus: 'Pending Signature' as const,
      expiryDescription: 'Pending Signature',
      daysRemaining: getDaysRemaining(contract.endDate)
    };
  }

  const daysRemaining = getDaysRemaining(contract.endDate);

  if (daysRemaining < 0 || contract.status === 'Expired') {
    return {
      expiryStatus: 'Expired' as const,
      expiryDescription: 'Expired',
      daysRemaining
    };
  }

  if (daysRemaining <= expiringSoonDays || contract.status === 'Near Expiry') {
    return {
      expiryStatus: 'Near Expiry' as const,
      expiryDescription: `Near Expiry — ${daysRemaining} days remaining`,
      daysRemaining
    };
  }

  return {
    expiryStatus: 'Active' as const,
    expiryDescription: 'Active',
    daysRemaining
  };
};

export const AdminContractsPage: React.FC = () => {
  const { buyers, contracts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('ALL');
  const [buyerFilter, setBuyerFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const buyerNameById = useMemo(
    () => new Map(buyers.map((buyer) => [buyer.id, buyer.companyName])),
    [buyers]
  );

  const contractRows: ContractDisplayRow[] = useMemo(
    () =>
      contracts.map((contract) => {
        const expiry = getExpiryDetails(contract);
        const corporateBuyer =
          contract.companyName ||
          buyerNameById.get(contract.buyerId) ||
          contract.buyerName ||
          'Unknown buyer';

        return {
          ...contract,
          displayId: formatContractId(contract),
          corporateBuyer,
          secondaryBuyerText: contract.buyerId,
          displayTier: contract.buyerGroup || 'Not assigned',
          displayTerms: contract.paymentTerms || contract.terms || 'Not assigned',
          ...expiry
        };
      }),
    [buyerNameById, contracts]
  );

  const buyerOptions = useMemo(
    () => Array.from(new Set(contractRows.map((contract) => contract.corporateBuyer))).sort(),
    [contractRows]
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(contractRows.map((contract) => contract.status))).sort(),
    [contractRows]
  );

  const filteredContracts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return contractRows.filter((contract) => {
      const searchable = [
        contract.displayId,
        contract.title,
        contract.corporateBuyer,
        contract.secondaryBuyerText,
        contract.displayTier,
        contract.displayTerms,
        contract.status
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || contract.status === statusFilter;
      const matchesBuyer = buyerFilter === 'ALL' || contract.corporateBuyer === buyerFilter;
      const matchesExpiry =
        expiryFilter === 'ALL' ||
        (expiryFilter === 'SOON' && contract.expiryStatus === 'Near Expiry') ||
        (expiryFilter === 'EXPIRED' && contract.expiryStatus === 'Expired');

      return matchesSearch && matchesStatus && matchesBuyer && matchesExpiry;
    });
  }, [buyerFilter, contractRows, expiryFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedContracts = filteredContracts.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize);
  const resultStart = filteredContracts.length === 0 ? 0 : (currentPageSafe - 1) * pageSize + 1;
  const resultEnd = Math.min(currentPageSafe * pageSize, filteredContracts.length);
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL' || expiryFilter !== 'ALL' || buyerFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setExpiryFilter('ALL');
    setBuyerFilter('ALL');
    setCurrentPage(1);
  };

  const columns: Column<ContractDisplayRow>[] = [
    {
      key: 'contract',
      header: 'Contract ID & Agreement',
      accessor: (c) => (
        <div className="min-w-[240px]">
          <span className="font-mono font-bold text-blue-600 block">{c.displayId}</span>
          <span className="font-semibold text-slate-900">{c.title || 'Untitled contract'}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'buyer',
      header: 'Corporate Buyer',
      accessor: (c) => (
        <div className="min-w-[220px]">
          <span className="font-bold text-slate-900">{c.corporateBuyer}</span>
          <span className="text-[11px] text-slate-400 block">{c.secondaryBuyerText}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'terms',
      header: 'Assigned Tier & Terms',
      accessor: (c) => (
        <div className="min-w-[220px] space-y-1">
          <StatusBadge status={c.displayTier} size="sm" showDot={c.displayTier !== 'Not assigned'} />
          <div>
            <StatusBadge status={c.displayTerms} size="sm" showDot={c.displayTerms !== 'Not assigned'} />
          </div>
        </div>
      )
    },
    {
      key: 'period',
      header: 'Period of Validity',
      accessor: (c) => (
        <div className="min-w-[180px] text-xs">
          <div className="font-semibold text-slate-700">{c.startDate} to {c.endDate}</div>
          <div className="mt-1 text-slate-500">{c.expiryDescription}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (c) => (
        <div className="min-w-[150px] space-y-1">
          <StatusBadge status={c.expiryStatus} />
          {c.status !== c.expiryStatus && <div><StatusBadge status={c.status} size="sm" showDot={false} /></div>}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      accessor: (c) => (
        <div className="flex min-w-[90px] justify-end">
          <Link to={`/admin/contracts/${c.id}`}>
            <Button variant="outline" size="xs" icon={Eye} aria-label={`View ${c.displayId}`}>
              View
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Supply Agreements & SLA Contracts"
        subtitle="Manage legally executed commercial contracts, annual volume commitments, and tiered discount covenants"
        breadcrumbs={[
          { label: 'Sales & Procurement', href: '/admin/dashboard' },
          { label: 'Contracts' }
        ]}
      />

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,2fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(220px,1.25fr)_auto] xl:items-end">
            <div className="min-w-0 md:col-span-2 xl:col-span-1">
              <label htmlFor="contract-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Search
              </label>
              <SearchBar
                id="contract-search"
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                placeholder="Search contracts..."
                className="w-full"
                inputClassName="h-10"
              />
            </div>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                ...statusOptions.map((status) => ({ label: status, value: status }))
              ]}
              className="h-10"
            />
            <Select
              label="Expiry"
              value={expiryFilter}
              onChange={(event) => {
                setExpiryFilter(event.target.value as ExpiryFilter);
                setCurrentPage(1);
              }}
              options={[
                { label: 'All', value: 'ALL' },
                { label: 'Expiring Soon', value: 'SOON' },
                { label: 'Expired', value: 'EXPIRED' }
              ]}
              className="h-10"
            />
            <Select
              label="Buyer"
              value={buyerFilter}
              onChange={(event) => {
                setBuyerFilter(event.target.value);
                setCurrentPage(1);
              }}
              options={[
                { label: 'All Buyers', value: 'ALL' },
                ...buyerOptions.map((buyer) => ({ label: buyer, value: buyer }))
              ]}
              className="h-10"
            />
            <Button
              type="button"
              variant={hasActiveFilters ? 'outline' : 'secondary'}
              size="sm"
              icon={RotateCcw}
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`h-10 w-full xl:w-auto ${hasActiveFilters ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : ''}`}
            >
              Reset Filters
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-medium">
              Showing <span className="font-semibold text-slate-900">{resultStart}</span>-<span className="font-semibold text-slate-900">{resultEnd}</span> of{' '}
              <span className="font-semibold text-slate-900">{filteredContracts.length}</span> contracts
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                icon={ChevronLeft}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPageSafe === 1}
                aria-label="Previous contracts page"
              >
                Previous
              </Button>
              <div className="rounded-md bg-white px-3 py-1 font-semibold text-slate-800 ring-1 ring-slate-200">
                Page {currentPageSafe} of {totalPages}
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPageSafe >= totalPages}
                aria-label="Next contracts page"
              >
                Next
              </Button>
            </div>
          </div>

          {filteredContracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No contracts found"
              description="Try adjusting the contract search, status, expiry, or buyer filters."
              actionText="Reset Filters"
              actionIcon={RotateCcw}
              onAction={resetFilters}
            />
          ) : (
            <DataTable
              columns={columns}
              data={paginatedContracts}
              compact
              emptyMessage="No contracts match the selected filters."
              className="[&>table]:min-w-[1060px] [scrollbar-width:thin] [scrollbar-color:rgb(203_213_225)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
            />
          )}
        </div>
      </Card>
    </div>
  );
};
