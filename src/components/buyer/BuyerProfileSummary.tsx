import React from 'react';
import { Building2, Mail, Phone, UserCheck } from 'lucide-react';
import { BuyerCompany } from '../../types';
import { Avatar, Card, StatusBadge } from '../ui';

interface BuyerProfileSummaryProps {
  buyer: BuyerCompany;
  className?: string;
}

export const BuyerProfileSummary: React.FC<BuyerProfileSummaryProps> = ({ buyer, className = '' }) => {
  return (
    <Card title="Company Profile Summary" className={`border-slate-200 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold shrink-0">
              ABC
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-slate-900 truncate">{buyer.companyName}</h3>
              <p className="text-xs text-slate-500 truncate">{buyer.businessType}</p>
            </div>
          </div>
          <StatusBadge status={buyer.status} size="sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="block text-slate-500">Buyer Group</span>
            <strong className="text-slate-900">{buyer.buyerGroup}</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="block text-slate-500">Tax ID</span>
            <strong className="text-slate-900">{buyer.taxId}</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="block text-slate-500">Credit Terms</span>
            <strong className="text-slate-900">{buyer.paymentTerms}</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="block text-slate-500">City</span>
            <strong className="text-slate-900">{buyer.city || 'Phnom Penh'}</strong>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Account Executive
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={buyer.assignedRep.name} size="sm" status="online" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900">{buyer.assignedRep.name}</div>
              <div className="text-[11px] text-slate-500">{buyer.assignedRep.title}</div>
            </div>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="inline-flex items-center gap-2 min-w-0">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{buyer.businessEmail || buyer.email}</span>
          </div>
          <div className="inline-flex items-center gap-2 min-w-0">
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{buyer.phone}</span>
          </div>
          <div className="inline-flex items-center gap-2 min-w-0 sm:col-span-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{buyer.address}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
