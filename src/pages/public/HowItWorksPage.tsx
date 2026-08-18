import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileQuestion,
  FileSpreadsheet,
  ShoppingBag,
  Receipt,
  Truck,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button, Card, PageHeader } from '../../components/ui';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageHeader
        title="Enterprise B2B Procurement Lifecycle"
        subtitle="How WholesaleHub powers bulk volume buying, RFQ negotiation, revolving credit, and pallet logistics"
        breadcrumbs={[{ label: 'How It Works' }]}
        actions={
          <Link to="/register">
            <Button variant="primary" size="sm">
              Open Business Account
            </Button>
          </Link>
        }
      />

      {/* 6 Step Visual Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
            01
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Corporate Onboarding & Credit</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Submit your business tax patent and MOC certificate. Upon approval, receive an approved Net 30 or Net 60 revolving credit facility.
          </p>
        </Card>

        <Card className="p-6 border-slate-200 hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
            02
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Volume Sourcing & RFQs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Select products by MOQ, input required project delivery dates, target prices, and special packaging or batch warranty requirements.
          </p>
        </Card>

        <Card className="p-6 border-slate-200 hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
            03
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Official Quote Negotiation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Assigned account executives review stock allocation, propose tiered discounts, and support real-time counter-offers with PDF exports.
          </p>
        </Card>

        <Card className="p-6 border-slate-200 hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
            04
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">PO Generation & Credit Hold</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Accept quotes with 1-click PO generation. The ERP automatically verifies available buyer credit limits and allocates warehouse inventory.
          </p>
        </Card>

        <Card className="p-6 border-slate-200 hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
            05
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Fulfillment & Pallet Freight</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Central warehouses pick, pack, and palletize orders. Live tracking with carrier waybills and electronic proof-of-delivery (POD).
          </p>
        </Card>

        <Card className="p-6 border-slate-200 hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
            06
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Tax Invoicing & Reconciliation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Compliant VAT invoices generated on Net 30/60 schedules. Credit balances replenish immediately upon payment receipt.
          </p>
        </Card>
      </div>

      {/* Comparison table */}
      <Card title="Why B2B Wholesale Is Different from B2C Retail" className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Capability</th>
                <th className="p-3.5 text-rose-600">Standard B2C Retail</th>
                <th className="p-3.5 text-blue-600 font-bold">WholesaleHub B2B Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3.5 font-semibold">Pricing Model</td>
                <td className="p-3.5">Fixed retail prices</td>
                <td className="p-3.5 font-bold text-slate-900">Volume tiers + RFQ negotiation</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Payment Terms</td>
                <td className="p-3.5">Prepaid credit card only</td>
                <td className="p-3.5 font-bold text-slate-900">Corporate Net 30 / Net 60 revolving credit</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Order Minimums</td>
                <td className="p-3.5">1 single item</td>
                <td className="p-3.5 font-bold text-slate-900">Commercial MOQs & Master cartons</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Legal & Tax</td>
                <td className="p-3.5">Simple receipt</td>
                <td className="p-3.5 font-bold text-slate-900">Official VAT tax invoices & Master contracts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
