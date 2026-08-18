import React, { useState } from 'react';
import { CheckCircle2, Edit3, Plus, Tag, ToggleLeft, Users } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  Input,
  KPICard,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BuyerGroupConfig } from '../../types';
import { formatCurrency } from '../../utils/pricing';

const buildBlankGroup = (): BuyerGroupConfig => ({
  id: `grp-${Date.now()}`,
  name: 'Standard',
  description: '',
  buyersCount: 0,
  defaultDiscount: 0,
  defaultPaymentTerms: 'Net 30',
  defaultCreditLimit: 20000,
  pricingRule: 'Base wholesale tiers only',
  pricingPriority: 4,
  status: 'Active'
});

export const AdminBuyerGroupsPage: React.FC = () => {
  const { buyerGroups, saveBuyerGroup, deactivateBuyerGroup } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [draftGroup, setDraftGroup] = useState<BuyerGroupConfig>(buildBlankGroup());

  const openCreate = () => {
    setDraftGroup(buildBlankGroup());
    setModalOpen(true);
  };

  const openEdit = (group: BuyerGroupConfig) => {
    setDraftGroup(group);
    setModalOpen(true);
  };

  const columns: Column<BuyerGroupConfig>[] = [
    {
      key: 'group',
      header: 'Group',
      accessor: (group) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{group.name}</div>
          <div className="mt-0.5 text-xs text-slate-500">{group.description}</div>
        </div>
      )
    },
    {
      key: 'buyers',
      header: 'Buyers',
      align: 'right',
      accessor: (group) => <span className="font-bold text-slate-900">{group.buyersCount.toLocaleString()}</span>
    },
    {
      key: 'discount',
      header: 'Default Discount',
      align: 'right',
      accessor: (group) => <span className="font-mono font-bold text-blue-700">{group.defaultDiscount}%</span>
    },
    {
      key: 'terms',
      header: 'Default Credit Terms',
      accessor: (group) => <span className="font-semibold text-slate-700">{group.defaultPaymentTerms}</span>
    },
    {
      key: 'credit',
      header: 'Default Credit',
      align: 'right',
      accessor: (group) => <span className="font-mono font-bold text-slate-900">{formatCurrency(group.defaultCreditLimit)}</span>
    },
    {
      key: 'rule',
      header: 'Pricing Rule',
      accessor: (group) => <span className="text-sm text-slate-700">{group.pricingRule}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (group) => <StatusBadge status={group.status} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (group) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="xs" icon={Edit3} onClick={() => openEdit(group)}>
            Edit
          </Button>
          <Button variant="danger" size="xs" icon={ToggleLeft} onClick={() => deactivateBuyerGroup(group.id)} disabled={group.status === 'Inactive'}>
            Deactivate
          </Button>
        </div>
      )
    }
  ];

  const saveDraft = () => {
    saveBuyerGroup(draftGroup);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Groups"
        subtitle="Manage default discounts, credit terms, credit limits, pricing priority, and group availability."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Buyer Groups' }
        ]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreate}>
            Create Group
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Groups" value={buyerGroups.length} icon={Tag} subtext="Pricing classifications" />
        <KPICard title="Active Groups" value={buyerGroups.filter((group) => group.status === 'Active').length} icon={CheckCircle2} subtext="Available for assignment" badge="Active" badgeVariant="success" />
        <KPICard title="Managed Buyers" value={buyerGroups.reduce((sum, group) => sum + group.buyersCount, 0)} icon={Users} subtext="Buyer group assignments" />
        <KPICard title="Top Discount" value={`${Math.max(...buyerGroups.map((group) => group.defaultDiscount))}%`} icon={Tag} subtext="Highest default discount" />
      </div>

      <Card className="border-slate-200">
        <DataTable columns={columns} data={buyerGroups} compact />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={buyerGroups.some((group) => group.id === draftGroup.id) ? `Edit ${draftGroup.name}` : 'Create Buyer Group'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Group Name"
            value={draftGroup.name}
            onChange={(event) => setDraftGroup((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Textarea
            label="Description"
            rows={3}
            value={draftGroup.description}
            onChange={(event) => setDraftGroup((prev) => ({ ...prev, description: event.target.value }))}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Default Discount (%)"
              type="number"
              value={draftGroup.defaultDiscount}
              onChange={(event) => setDraftGroup((prev) => ({ ...prev, defaultDiscount: Number(event.target.value) }))}
            />
            <Select
              label="Default Payment Terms"
              value={draftGroup.defaultPaymentTerms}
              onChange={(event) => setDraftGroup((prev) => ({ ...prev, defaultPaymentTerms: event.target.value }))}
              options={[
                { label: 'Net 30', value: 'Net 30' },
                { label: 'Net 60', value: 'Net 60' },
                { label: 'Advance Wire', value: 'Advance Wire' }
              ]}
            />
            <Input
              label="Default Credit Limit"
              type="number"
              step="5000"
              value={draftGroup.defaultCreditLimit}
              onChange={(event) => setDraftGroup((prev) => ({ ...prev, defaultCreditLimit: Number(event.target.value) }))}
            />
            <Input
              label="Pricing Priority"
              type="number"
              value={draftGroup.pricingPriority}
              onChange={(event) => setDraftGroup((prev) => ({ ...prev, pricingPriority: Number(event.target.value) }))}
            />
          </div>
          <Input
            label="Pricing Rule"
            value={draftGroup.pricingRule}
            onChange={(event) => setDraftGroup((prev) => ({ ...prev, pricingRule: event.target.value }))}
          />
          <Select
            label="Status"
            value={draftGroup.status}
            onChange={(event) => setDraftGroup((prev) => ({ ...prev, status: event.target.value }))}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={saveDraft} disabled={!draftGroup.name || !draftGroup.description}>
              Save Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
