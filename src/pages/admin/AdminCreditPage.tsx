import React, { useState } from 'react';
import { AlertTriangle, CreditCard, DollarSign, CheckCircle2, Edit, Save } from 'lucide-react';
import {
  Button,
  DataTable,
  Column,
  StatusBadge,
  PageHeader,
  SearchBar,
  Card,
  KPICard,
  Modal,
  Input,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Buyer } from '../../types';

export const AdminCreditPage: React.FC = () => {
  const { buyers, updateBuyerCredit, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [creditLimit, setCreditLimit] = useState(0);
  const [newPOAmount, setNewPOAmount] = useState(25000);
  const [creditNote, setCreditNote] = useState('Credit facility reviewed against current payment history and order pipeline.');

  const totalFacility = buyers.reduce((sum, b) => sum + b.creditLimit, 0);
  const totalUsed = buyers.reduce((sum, b) => sum + b.usedCredit, 0);
  const totalAvailable = buyers.reduce((sum, b) => sum + b.availableCredit, 0);
  const projectedCreditUsage = (selectedBuyer?.usedCredit || 0) + newPOAmount;
  const projectedCreditAvailable = Math.max(0, creditLimit - projectedCreditUsage);
  const creditApprovalRequired = Boolean(selectedBuyer && projectedCreditUsage > creditLimit);

  const filteredBuyers = buyers.filter((b) =>
    b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreditModal = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setCreditLimit(buyer.creditLimit);
    setNewPOAmount(25000);
    setCreditNote('Credit facility reviewed against current payment history and order pipeline.');
  };

  const handleSaveCredit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBuyer) return;
    updateBuyerCredit(selectedBuyer.id, creditLimit);
    showToast(`${selectedBuyer.companyName} credit limit updated to $${creditLimit.toLocaleString()} USD.`, 'success');
    setSelectedBuyer(null);
  };

  const columns: Column<Buyer>[] = [
    {
      header: 'Buyer Company',
      accessor: (b) => (
        <div>
          <span className="font-bold text-slate-900 block">{b.companyName}</span>
          <span className="text-[11px] text-slate-400 font-mono">{b.id}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Assigned Terms',
      accessor: (b) => (
        <div>
          <span className="font-semibold text-blue-700">{b.paymentTerms}</span>
          <span className="text-[11px] text-slate-400 block">{b.buyerGroup}</span>
        </div>
      )
    },
    {
      header: 'Credit Facility',
      accessor: (b) => (
        <span className="font-mono font-bold text-slate-900">
          ${b.creditLimit.toLocaleString()} USD
        </span>
      ),
      sortable: true
    },
    {
      header: 'Outstanding Balance',
      accessor: (b) => (
        <span className="font-mono font-bold text-rose-600">
          ${b.usedCredit.toLocaleString()} USD
        </span>
      ),
      sortable: true
    },
    {
      header: 'Available Headroom',
      accessor: (b) => (
        <span className="font-mono font-bold text-emerald-600">
          ${b.availableCredit.toLocaleString()} USD
        </span>
      ),
      sortable: true
    },
    {
      header: 'Utilization',
      accessor: (b) => {
        const percent = Math.round((b.usedCredit / b.creditLimit) * 100);
        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percent > 80 ? 'bg-rose-500' : percent > 50 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (b) => (
        <Button variant="outline" size="xs" icon={Edit} onClick={() => openCreditModal(b)}>
          Edit Limit
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate Credit Management & Risk Limits"
        subtitle="Monitor aggregate enterprise credit exposure, revolving limits, and accounts receivable utilization"
        breadcrumbs={[
          { label: 'Finance & Credit', href: '/admin/dashboard' },
          { label: 'Credit Risk Control' }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Approved Credit Facility"
          value={`$${totalFacility.toLocaleString()} USD`}
          subtext="Underwritten across all active buyers"
          icon={CreditCard}
        />
        <KPICard
          title="Total Drawn Credit Exposure"
          value={`$${totalUsed.toLocaleString()} USD`}
          subtext={`${Math.round((totalUsed / totalFacility) * 100)}% aggregate utilization`}
          icon={DollarSign}
        />
        <KPICard
          title="Available Purchasing Power"
          value={`$${totalAvailable.toLocaleString()} USD`}
          subtext="Unutilized revolving credit line"
          icon={CheckCircle2}
        />
      </div>

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search buyers by name or account ID..."
          />
        </div>

        <DataTable columns={columns} data={filteredBuyers} />
      </Card>

      <Modal
        isOpen={Boolean(selectedBuyer)}
        onClose={() => setSelectedBuyer(null)}
        title={selectedBuyer ? `Credit Limit Review: ${selectedBuyer.companyName}` : 'Credit Limit Review'}
      >
        <form onSubmit={handleSaveCredit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Current Limit</div>
              <div className="mt-1 font-mono font-bold text-slate-900">${selectedBuyer?.creditLimit.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Used</div>
              <div className="mt-1 font-mono font-bold text-rose-700">${selectedBuyer?.usedCredit.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">New Available</div>
              <div className="mt-1 font-mono font-bold text-emerald-700">
                ${Math.max(0, creditLimit - (selectedBuyer?.usedCredit || 0)).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm sm:grid-cols-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Payment Terms</div>
              <div className="mt-1 font-semibold text-slate-900">{selectedBuyer?.paymentTerms || 'Net-30'}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Used + New PO</div>
              <div className="mt-1 font-mono font-bold text-slate-900">${projectedCreditUsage.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Projected Headroom</div>
              <div className={`mt-1 font-mono font-bold ${creditApprovalRequired ? 'text-rose-700' : 'text-emerald-700'}`}>
                ${projectedCreditAvailable.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Validation</div>
              <div className="mt-1">
                <StatusBadge status={creditApprovalRequired ? 'Approval Required' : 'Within Limit'} size="sm" />
              </div>
            </div>
          </div>
          <Input
            label="Approved Credit Facility"
            type="number"
            min={0}
            prefixText="$"
            value={creditLimit}
            onChange={(event) => setCreditLimit(parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label="Mock New PO Amount"
            type="number"
            min={0}
            prefixText="$"
            value={newPOAmount}
            onChange={(event) => setNewPOAmount(parseInt(event.target.value, 10) || 0)}
            helperText="Validates whether Used Credit + New PO exceeds the approved limit."
          />
          {creditApprovalRequired && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-bold">Credit approval required</div>
                <p className="mt-1 leading-6">
                  Used Credit + New PO exceeds the proposed credit limit. Route this order through credit approval before PO release.
                </p>
              </div>
            </div>
          )}
          <Textarea
            label="Internal Credit Note"
            value={creditNote}
            onChange={(event) => setCreditNote(event.target.value)}
            rows={3}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedBuyer(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Credit Limit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
