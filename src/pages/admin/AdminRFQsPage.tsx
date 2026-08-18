import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Search, Eye, FileSpreadsheet, Plus, Send, CheckCircle2 } from 'lucide-react';
import {
  Button,
  DataTable,
  Column,
  StatusBadge,
  PageHeader,
  SearchBar,
  FilterBar,
  Card,
  Modal,
  Input,
  Select,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { RFQ, PaymentTerms } from '../../types';

export const AdminRFQsPage: React.FC = () => {
  const { rfqs, generateQuote, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState<RFQ | null>(null);
  const [quoteTerms, setQuoteTerms] = useState<PaymentTerms>('Net 30');
  const [validUntil, setValidUntil] = useState('2026-09-15');
  const [quoteNotes, setQuoteNotes] = useState('Prices include pallet packaging and 3-year enterprise warranty.');
  const [itemPrices, setItemPrices] = useState<{ [sku: string]: number }>({});

  const filteredRfqs = rfqs.filter((rfq) => {
    const matchSearch =
      rfq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || rfq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenQuoteModal = (rfq: RFQ) => {
    setSelectedRfqForQuote(rfq);
    const initialPrices: { [sku: string]: number } = {};
    rfq.items.forEach((item) => {
      initialPrices[item.sku] = item.targetPrice;
    });
    setItemPrices(initialPrices);
  };

  const handleGenerateQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqForQuote) return;

    generateQuote(selectedRfqForQuote.id, {
      validUntil,
      paymentTerms: quoteTerms,
      notes: quoteNotes,
      items: selectedRfqForQuote.items.map((i) => ({
        sku: i.sku,
        productName: i.productName,
        quantity: i.quantity,
        quotedUnitPrice: itemPrices[i.sku] || i.targetPrice
      }))
    });

    setSelectedRfqForQuote(null);
  };

  const columns: Column<RFQ>[] = [
    {
      header: 'RFQ ID & Reference',
      accessor: (rfq) => (
        <div>
          <Link to={`/admin/rfqs/${rfq.id}`} className="font-mono font-bold text-blue-600 block hover:text-blue-800">
            {rfq.rfqNumber || rfq.id}
          </Link>
          <span className="font-semibold text-slate-900 line-clamp-1">{rfq.projectTitle}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Corporate Buyer',
      accessor: (rfq) => (
        <div>
          <span className="font-bold text-slate-900">{rfq.buyerName}</span>
          <span className="text-[11px] text-slate-400 block">{rfq.buyerId}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Items & Units',
      accessor: (rfq) => (
        <div className="text-slate-600">
          <span className="font-semibold text-slate-800">{rfq.items.length} SKUs</span>
          <span className="text-[11px] text-slate-400 block">
            {rfq.items.reduce((a, b) => a + b.quantity, 0)} units
          </span>
        </div>
      )
    },
    {
      header: 'Target Budget',
      accessor: (rfq) => (
        <span className="font-mono font-bold text-slate-900">
          ${rfq.targetBudget.toLocaleString()} USD
        </span>
      ),
      sortable: true
    },
    {
      header: 'Status',
      accessor: (rfq) => <StatusBadge status={rfq.status} />
    },
    {
      header: 'Actions',
      accessor: (rfq) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to={`/admin/rfqs/${rfq.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>
          {rfq.status !== 'Quoted' && rfq.status !== 'Accepted' ? (
            <Button
              variant="primary"
              size="xs"
              icon={FileSpreadsheet}
              onClick={() => handleOpenQuoteModal(rfq)}
            >
              Issue Quote
            </Button>
          ) : (
            <Link to="/admin/quotes">
              <Button variant="outline" size="xs">
                View Quote
              </Button>
            </Link>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wholesale RFQs & Inquiries Pipeline"
        subtitle="Manage custom buyer pricing requests, review target budgets, and formulate official quotation offers"
        breadcrumbs={[
          { label: 'Sales & Procurement', href: '/admin/dashboard' },
          { label: 'RFQs' }
        ]}
      />

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search RFQs by buyer name, project title, or ID..."
            />
          </div>
          <FilterBar
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'Submitted', value: 'Submitted' },
                  { label: 'Under Review', value: 'Under Review' },
                  { label: 'Quoted', value: 'Quoted' },
                  { label: 'Accepted', value: 'Accepted' },
                  { label: 'Rejected', value: 'Rejected' }
                ]
              }
            ]}
            hasActiveFilters={statusFilter !== 'ALL' || searchTerm !== ''}
            onReset={() => {
              setStatusFilter('ALL');
              setSearchTerm('');
            }}
          />
        </div>

        <DataTable columns={columns} data={filteredRfqs} />
      </Card>

      {/* Quote Formulation Modal */}
      {selectedRfqForQuote && (
        <Modal
          isOpen={!!selectedRfqForQuote}
          onClose={() => setSelectedRfqForQuote(null)}
          title={`Formulate Official Quote for ${selectedRfqForQuote.id}`}
          size="lg"
        >
          <form onSubmit={handleGenerateQuoteSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
              <div>
                <span className="text-slate-500">Buyer Organization:</span>
                <p className="font-bold text-slate-900">{selectedRfqForQuote.buyerName}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Target Budget:</span>
                <p className="font-mono font-bold text-blue-700">
                  ${selectedRfqForQuote.targetBudget.toLocaleString()} USD
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold uppercase text-slate-600 block">
                Line Items & Quoted Unit Pricing:
              </label>
              {selectedRfqForQuote.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block">{item.productName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.sku} · Qty: {item.quantity} units (Buyer Target: ${item.targetPrice})
                    </span>
                  </div>
                  <div className="w-36">
                    <Input
                      label="Quoted Unit ($)"
                      type="number"
                      step="0.01"
                      value={itemPrices[item.sku] || item.targetPrice}
                      onChange={(e) =>
                        setItemPrices({
                          ...itemPrices,
                          [item.sku]: parseFloat(e.target.value) || 0
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Quotation Validity Deadline"
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
              <Select
                label="Applicable Payment Terms"
                value={quoteTerms}
                onChange={(e) => setQuoteTerms(e.target.value as PaymentTerms)}
                options={[
                  { label: 'Net 30 Days', value: 'Net 30' },
                  { label: 'Net 60 Days', value: 'Net 60' },
                  { label: 'Advance Wire Transfer', value: 'Advance Wire' }
                ]}
              />
            </div>

            <Textarea
              label="Quotation Commercial Notes & SLA Terms"
              rows={2}
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRfqForQuote(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={Send}>
                Dispatch Formal Quotation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
