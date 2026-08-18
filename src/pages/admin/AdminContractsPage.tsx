import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Eye, Download, ShieldCheck } from 'lucide-react';
import {
  Button,
  DataTable,
  Column,
  StatusBadge,
  PageHeader,
  SearchBar,
  Card,
  Modal
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Contract } from '../../types';

export const AdminContractsPage: React.FC = () => {
  const { contracts, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter((c) =>
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Contract>[] = [
    {
      header: 'Contract ID & Agreement',
      accessor: (c) => (
        <div>
          <span className="font-mono font-bold text-blue-600 block">{c.id}</span>
          <span className="font-semibold text-slate-900">{c.title}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Corporate Buyer',
      accessor: (c) => (
        <div>
          <span className="font-bold text-slate-900">{c.buyerName}</span>
          <span className="text-[11px] text-slate-400 block">{c.buyerId}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Assigned Tier & Terms',
      accessor: (c) => (
        <div>
          <span className="font-semibold text-blue-700">{c.terms}</span>
          <span className="text-[11px] text-slate-400 block">{c.buyerGroup}</span>
        </div>
      )
    },
    {
      header: 'Period of Validity',
      accessor: (c) => (
        <span className="text-slate-600 text-xs">
          {c.startDate} to {c.endDate}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Status',
      accessor: (c) => <StatusBadge status={c.status} />
    },
    {
      header: 'Action',
      accessor: (c) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to={`/admin/contracts/${c.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>
          <Button variant="ghost" size="xs" onClick={() => setSelectedContract(c)}>
            Preview
          </Button>
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

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search contracts by title, ID, or buyer name..."
          />
        </div>

        <DataTable columns={columns} data={filteredContracts} />
      </Card>

      {selectedContract && (
        <Modal
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          title={`${selectedContract.id} - ${selectedContract.title}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 font-medium">Buyer Organization:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedContract.buyerName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Payment Term Settlement:</span>
                <p className="font-bold text-blue-700 mt-0.5">{selectedContract.terms}</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 leading-relaxed text-slate-700">
              <h4 className="font-bold text-slate-900 text-sm">Enterprise SLA & Invoicing Covenants:</h4>
              <p>
                Minimum quarterly volume threshold: $50,000 USD for Tier-1 discount privileges.
              </p>
              <p>
                RMA replacements: 48-hour turn-around from central Phnom Penh hub.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => showToast('Agreement PDF downloaded', 'info')}
              >
                Download Signed Contract PDF
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedContract(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
