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
  FilterBar,
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
import { getCreditAvailable } from '../../utils/financeLogistics';
import { formatCurrency } from '../../utils/pricing';

const pageSize = 8;

export const AdminBuyersPage: React.FC = () => {
  const {
    buyers,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBuyer, setEditingBuyer] = useState<BuyerCompany | null>(null);
  const [editGroup, setEditGroup] = useState<BuyerGroup>('Corporate');
  const [editTerms, setEditTerms] = useState<PaymentTerms>('Net 30');
  const [editCreditLimit, setEditCreditLimit] = useState(0);

  const summary = useMemo(
    () => ({
      total: buyers.length,
      approved: buyers.filter((buyer) => buyer.status === 'Approved' || buyer.status === 'Active').length,
      pending: buyers.filter((buyer) => buyer.status === 'Pending' || buyer.status === 'Under Review').length,
      suspended: buyers.filter((buyer) => buyer.status === 'Suspended').length,
      priority: buyers.filter((buyer) => ['VIP', 'Corporate', 'Distributor'].includes(buyer.buyerGroup)).length
    }),
    [buyers]
  );

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
      const matchesDate = !joinedFrom || buyer.joinedDate >= joinedFrom;

      return matchesSearch && matchesStatus && matchesGroup && matchesRep && matchesCountry && matchesDate;
    });
  }, [buyers, countryFilter, groupFilter, joinedFrom, repFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedBuyers = filteredBuyers.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize);
  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    groupFilter !== 'ALL' ||
    repFilter !== 'ALL' ||
    countryFilter !== 'ALL' ||
    joinedFrom !== '';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setGroupFilter('ALL');
    setRepFilter('ALL');
    setCountryFilter('ALL');
    setJoinedFrom('');
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
        <div className="min-w-[220px]">
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
      accessor: (buyer) => <StatusBadge status={buyer.buyerGroup} size="sm" />
    },
    {
      key: 'rep',
      header: 'Account Executive',
      accessor: (buyer) => <span className="text-sm font-semibold text-slate-700">{buyer.assignedRep.name}</span>
    },
    {
      key: 'credit',
      header: 'Credit Limit',
      align: 'right',
      accessor: (buyer) => (
        <span className="font-mono font-bold text-slate-900">{formatCurrency(buyer.creditLimit)}</span>
      )
    },
    {
      key: 'available',
      header: 'Available Credit',
      align: 'right',
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
      accessor: (buyer) => <span className="font-semibold text-slate-700">{buyer.joinedDate}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (buyer) => (
        <div className="flex justify-end gap-2">
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
              Approval Queue
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard title="Total Buyers" value={summary.total} icon={Users} subtext="All buyer records" />
        <KPICard title="Approved" value={summary.approved} icon={ShieldCheck} subtext="Verified accounts" badge="Active" badgeVariant="success" />
        <KPICard title="Pending" value={summary.pending} icon={UserCheck} subtext="Needs review" badge="Queue" badgeVariant="amber" />
        <KPICard title="Suspended" value={summary.suspended} icon={PauseCircle} subtext="Credit or compliance hold" badge="Hold" badgeVariant="danger" />
        <KPICard title="VIP / Corporate" value={summary.priority} icon={WalletCards} subtext="Priority pricing groups" />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
                placeholder="Search company, contact, tax ID, registration, or account executive..."
              />
            </div>
            <Input
              label="Joined From"
              type="date"
              value={joinedFrom}
              onChange={(event) => {
                setJoinedFrom(event.target.value);
                setCurrentPage(1);
              }}
              className="xl:min-w-[170px]"
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
                options: [
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Under Review', value: 'Under Review' },
                  { label: 'Suspended', value: 'Suspended' },
                  { label: 'Rejected', value: 'Rejected' }
                ]
              },
              {
                id: 'group',
                label: 'Buyer Group',
                value: groupFilter,
                onChange: (value) => {
                  setGroupFilter(value);
                  setCurrentPage(1);
                },
                options: groupOptions.map((group) => ({ label: group, value: group }))
              },
              {
                id: 'rep',
                label: 'Account Executive',
                value: repFilter,
                onChange: (value) => {
                  setRepFilter(value);
                  setCurrentPage(1);
                },
                options: repOptions.map((rep) => ({ label: rep, value: rep }))
              },
              {
                id: 'country',
                label: 'Country',
                value: countryFilter,
                onChange: (value) => {
                  setCountryFilter(value);
                  setCurrentPage(1);
                },
                options: countryOptions.map((country) => ({ label: country, value: country }))
              }
            ]}
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          />
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
            <DataTable columns={columns} data={paginatedBuyers} compact />
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
