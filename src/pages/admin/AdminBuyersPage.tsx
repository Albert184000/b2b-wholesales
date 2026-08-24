import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Edit3,
  Eye,
  PauseCircle,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  WalletCards
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Input,
  KPICard,
  Modal,
  PageHeader,
  Pagination,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BuyerCompany, BuyerGroup, PaymentTerms } from '../../types';
import { getPendingBuyerApprovalCount } from '../../utils/adminMetrics';
import { getCreditAvailable } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

const pageSize = 8;
const controlClassName = 'h-10 min-w-0';

export const AdminBuyersPage: React.FC = () => {
  const {
    buyers,
    buyerApplications,
    updateBuyerAccountStatus,
    updateBuyerCredit,
    updateBuyerGroupAssignment,
    updateBuyerPaymentTerms,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [repFilter, setRepFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo, setJoinedTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBuyer, setEditingBuyer] = useState<BuyerCompany | null>(null);
  const [editGroup, setEditGroup] = useState<BuyerGroup>('Corporate');
  const [editTerms, setEditTerms] = useState<PaymentTerms>('Net 30');
  const [editCreditLimit, setEditCreditLimit] = useState(0);

  const pendingApprovalCount = useMemo(() => getPendingBuyerApprovalCount(buyerApplications), [buyerApplications]);
  const summary = useMemo(() => {
    const approved = buyers.filter((buyer) => buyer.status === 'Approved' || buyer.status === 'Active').length;
    const suspended = buyers.filter((buyer) => buyer.status === 'Suspended').length;
    const pendingAccounts = buyers.filter((buyer) => buyer.status === 'Pending' || buyer.status === 'Under Review').length;
    const pendingNotRepresentedInTable = Math.max(0, pendingApprovalCount - pendingAccounts);

    return {
      total: buyers.length + pendingNotRepresentedInTable,
      approved,
      pending: pendingApprovalCount,
      suspended,
      priority: buyers.filter((buyer) => ['VIP', 'Corporate', 'Distributor'].includes(buyer.buyerGroup)).length
    };
  }, [buyers, pendingApprovalCount]);

  const groupOptions = Array.from(new Set(buyers.map((buyer) => buyer.buyerGroup)));
  const repOptions = Array.from(new Set(buyers.map((buyer) => buyer.assignedRep.name)));
  const countryOptions = Array.from(new Set(buyers.map((buyer) => buyer.country || 'Cambodia')));

  const filteredBuyers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return buyers.filter((buyer) => {
      const searchable = [
        buyer.companyName,
        buyer.contactPerson,
        buyer.taxId,
        buyer.registrationNumber,
        buyer.assignedRep.name,
        buyer.id
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || buyer.status === statusFilter;
      const matchesGroup = groupFilter === 'ALL' || buyer.buyerGroup === groupFilter;
      const matchesRep = repFilter === 'ALL' || buyer.assignedRep.name === repFilter;
      const matchesCountry = countryFilter === 'ALL' || (buyer.country || 'Cambodia') === countryFilter;
      const matchesDateFrom = !joinedFrom || buyer.joinedDate >= joinedFrom;
      const matchesDateTo = !joinedTo || buyer.joinedDate <= joinedTo;

      return matchesSearch && matchesStatus && matchesGroup && matchesRep && matchesCountry && matchesDateFrom && matchesDateTo;
    });
  }, [buyers, countryFilter, groupFilter, joinedFrom, joinedTo, repFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedBuyers = filteredBuyers.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize);
  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    groupFilter !== 'ALL' ||
    repFilter !== 'ALL' ||
    countryFilter !== 'ALL' ||
    joinedFrom !== '' ||
    joinedTo !== '';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setGroupFilter('ALL');
    setRepFilter('ALL');
    setCountryFilter('ALL');
    setJoinedFrom('');
    setJoinedTo('');
    setCurrentPage(1);
  };

  const openEditModal = (buyer: BuyerCompany) => {
    setEditingBuyer(buyer);
    setEditGroup(buyer.buyerGroup);
    setEditTerms(buyer.paymentTerms);
    setEditCreditLimit(buyer.creditLimit);
  };

  const saveBuyerEdit = () => {
    if (!editingBuyer) return;
    updateBuyerGroupAssignment(editingBuyer.id, editGroup);
    updateBuyerCredit(editingBuyer.id, editCreditLimit);
    updateBuyerPaymentTerms(editingBuyer.id, editTerms);
    setEditingBuyer(null);
  };

  const columns: Column<BuyerCompany>[] = [
    {
      key: 'company',
      header: 'Company',
      accessor: (buyer) => (
        <div className="min-w-[240px]">
          <Link to={`/admin/buyers/${buyer.id}`} className="font-bold text-blue-700 hover:text-blue-900">
            {buyer.companyName}
          </Link>
          <div className="mt-0.5 text-xs text-slate-500">{buyer.registrationNumber}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Primary Contact',
      className: 'hidden md:table-cell',
      accessor: (buyer) => (
        <div className="min-w-[180px] text-sm">
          <div className="font-semibold text-slate-900">{buyer.contactPerson}</div>
          <div className="text-xs text-slate-500">{buyer.businessEmail || buyer.email}</div>
        </div>
      )
    },
    {
      key: 'group',
      header: 'Buyer Group',
      className: 'hidden lg:table-cell',
      accessor: (buyer) => <StatusBadge status={buyer.buyerGroup} size="sm" />
    },
    {
      key: 'rep',
      header: 'Account Executive',
      className: 'hidden xl:table-cell',
      accessor: (buyer) => <span className="text-sm font-semibold text-slate-700">{buyer.assignedRep.name}</span>
    },
    {
      key: 'credit',
      header: 'Credit Limit',
      align: 'right',
      className: 'hidden 2xl:table-cell',
      accessor: (buyer) => (
        <span className="font-mono font-bold text-slate-900">{formatCurrency(buyer.creditLimit)}</span>
      )
    },
    {
      key: 'available',
      header: 'Available Credit',
      align: 'right',
      className: 'hidden xl:table-cell',
      accessor: (buyer) => (
        <span className="font-mono font-bold text-emerald-700">
          {formatCurrency(getCreditAvailable(buyer.creditLimit, buyer.usedCredit))}
        </span>
      )
    },
    {
      key: 'purchases',
      header: 'Total Purchases',
      align: 'right',
      className: 'hidden 2xl:table-cell',
      accessor: (buyer) => (
        <span className="font-mono font-bold text-blue-700">{formatCurrency(buyer.totalPurchases || 0)}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (buyer) => <StatusBadge status={buyer.status} />
    },
    {
      key: 'joined',
      header: 'Joined Date',
      accessor: (buyer) => <span className="block min-w-[112px] whitespace-nowrap font-semibold text-slate-700">{buyer.joinedDate}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (buyer) => (
        <div className="flex min-w-[220px] justify-end gap-2">
          <Link to={`/admin/buyers/${buyer.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>
          <Button variant="outline" size="xs" icon={Edit3} onClick={() => openEditModal(buyer)}>
            Edit
          </Button>
          {buyer.status === 'Suspended' ? (
            <Button variant="success" size="xs" icon={CheckCircle2} onClick={() => updateBuyerAccountStatus(buyer.id, 'Approved')}>
              Activate
            </Button>
          ) : (
            <Button variant="danger" size="xs" icon={PauseCircle} onClick={() => updateBuyerAccountStatus(buyer.id, 'Suspended')}>
              Suspend
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Management"
        subtitle="Review, filter, and manage verified wholesale buyer accounts, groups, credit, and account standing."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Buyers' }
        ]}
        actions={
          <Link to="/admin/approvals">
            <Button variant="primary" size="sm" icon={UserCheck}>
              Approval Queue ({pendingApprovalCount})
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <KPICard title="Total Buyers" value={summary.total} icon={Users} subtext="All buyer records" />
        <KPICard title="Approved" value={summary.approved} icon={ShieldCheck} subtext="Verified accounts" badge="Active" badgeVariant="success" />
        <KPICard title="Pending Buyers" value={summary.pending} icon={UserCheck} subtext="Needs review" badge="Queue" badgeVariant="amber" />
        <KPICard title="Suspended" value={summary.suspended} icon={PauseCircle} subtext="Credit or compliance hold" badge="Hold" badgeVariant="danger" />
        <KPICard title="VIP / Corporate" value={summary.priority} icon={WalletCards} subtext="Priority pricing groups" />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(280px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(160px,1fr)_minmax(180px,1.1fr)_minmax(220px,1.2fr)_minmax(160px,1fr)_auto] 2xl:items-end">
            <div className="min-w-0 md:col-span-2 lg:col-span-3 2xl:col-span-1">
              <label htmlFor="buyer-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Search
              </label>
              <SearchBar
                id="buyer-search"
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                placeholder="Search buyers..."
                className="w-full"
                inputClassName={controlClassName}
              />
            </div>
            <div className="min-w-0">
              <Input
                label="From"
                type="date"
                value={joinedFrom}
                onChange={(event) => {
                  setJoinedFrom(event.target.value);
                  setCurrentPage(1);
                }}
                className={controlClassName}
              />
            </div>
            <div className="min-w-0">
              <Input
                label="To"
                type="date"
                value={joinedTo}
                onChange={(event) => {
                  setJoinedTo(event.target.value);
                  setCurrentPage(1);
                }}
                className={controlClassName}
              />
            </div>
            <div className="min-w-0">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Under Review', value: 'Under Review' },
                  { label: 'Suspended', value: 'Suspended' },
                  { label: 'Rejected', value: 'Rejected' }
                ]}
                className={controlClassName}
              />
            </div>
            <div className="min-w-0">
              <Select
                label="Buyer Group"
                value={groupFilter}
                onChange={(event) => {
                  setGroupFilter(event.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: 'All Groups', value: 'ALL' },
                  ...groupOptions.map((group) => ({ label: group, value: group }))
                ]}
                className={controlClassName}
              />
            </div>
            <div className="min-w-0">
              <Select
                label="Account Executive"
                value={repFilter}
                onChange={(event) => {
                  setRepFilter(event.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: 'All Executives', value: 'ALL' },
                  ...repOptions.map((rep) => ({ label: rep, value: rep }))
                ]}
                className={controlClassName}
              />
            </div>
            <div className="min-w-0">
              <Select
                label="Country"
                value={countryFilter}
                onChange={(event) => {
                  setCountryFilter(event.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: 'All Countries', value: 'ALL' },
                  ...countryOptions.map((country) => ({ label: country, value: country }))
                ]}
                className={controlClassName}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant={hasActiveFilters ? 'outline' : 'secondary'}
                size="sm"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className={`h-10 w-full px-4 2xl:w-auto ${
                  hasActiveFilters ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : ''
                }`}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {filteredBuyers.length === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState
              icon={Search}
              title="No buyers found"
              description="Try adjusting the account filters or search terms."
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4 pt-0">
            <DataTable
              columns={columns}
              data={paginatedBuyers}
              compact
              className="[&>table]:min-w-[1040px] [scrollbar-width:thin] [scrollbar-color:rgb(203_213_225)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
            />
            <Pagination
              currentPage={currentPageSafe}
              totalPages={totalPages}
              totalItems={filteredBuyers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!editingBuyer}
        onClose={() => setEditingBuyer(null)}
        title={editingBuyer ? `Edit ${editingBuyer.companyName}` : 'Edit Buyer'}
      >
        <div className="space-y-4">
          <Select
            label="Buyer Group"
            value={editGroup}
            onChange={(event) => setEditGroup(event.target.value as BuyerGroup)}
            options={[
              { label: 'Standard', value: 'Standard' },
              { label: 'Corporate', value: 'Corporate' },
              { label: 'VIP', value: 'VIP' },
              { label: 'Distributor', value: 'Distributor' }
            ]}
          />
          <Input
            label="Credit Limit"
            type="number"
            step="5000"
            value={editCreditLimit}
            onChange={(event) => setEditCreditLimit(Number(event.target.value))}
          />
          <Select
            label="Payment Terms"
            value={editTerms}
            onChange={(event) => setEditTerms(event.target.value)}
            options={[
              { label: 'Net 30', value: 'Net 30' },
              { label: 'Net 60', value: 'Net 60' },
              { label: 'Advance Wire', value: 'Advance Wire' }
            ]}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setEditingBuyer(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={saveBuyerEdit}>
              Save Buyer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
