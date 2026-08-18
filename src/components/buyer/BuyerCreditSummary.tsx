import React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { BuyerCompany } from '../../types';
import { Card } from '../ui';
import { formatCurrency } from '../../utils/pricing';
import { getCreditAvailable, getCreditUtilization } from '../../utils/financeLogistics';

interface BuyerCreditSummaryProps {
  buyer: BuyerCompany;
  outstandingInvoices?: number;
  overdueAmount?: number;
  nextReviewDate?: string;
  accountStanding?: string;
  className?: string;
}

export const BuyerCreditSummary: React.FC<BuyerCreditSummaryProps> = ({
  buyer,
  outstandingInvoices = 0,
  overdueAmount = 0,
  nextReviewDate,
  accountStanding,
  className = ''
}) => {
  const availableCredit = getCreditAvailable(buyer.creditLimit, buyer.usedCredit);
  const utilization = getCreditUtilization(buyer.creditLimit, buyer.usedCredit);
  const barColor =
    utilization >= 85 ? 'bg-rose-500' : utilization >= 65 ? 'bg-amber-500' : 'bg-blue-600';

  return (
    <Card title="Credit Summary" className={`border-slate-200 ${className}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Credit Limit
            </div>
            <div className="mt-1 text-lg font-extrabold text-slate-900">
              {formatCurrency(buyer.creditLimit)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Used Credit
            </div>
            <div className="mt-1 text-lg font-extrabold text-slate-900">
              {formatCurrency(buyer.usedCredit)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-emerald-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Available
            </div>
            <div className="mt-1 text-lg font-extrabold text-emerald-700">
              {formatCurrency(availableCredit)}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">Utilization</span>
            <span className="font-bold text-slate-900">{utilization}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          <span className="inline-flex items-center gap-2 font-semibold">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Terms: {buyer.paymentTerms}
          </span>
          <span className="inline-flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Account standing: {accountStanding || buyer.accountStanding || 'Good Standing'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="block font-bold uppercase tracking-wider text-slate-500">
              Outstanding Invoices
            </span>
            <strong className="mt-1 block text-slate-900">{formatCurrency(outstandingInvoices)}</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="block font-bold uppercase tracking-wider text-slate-500">
              Overdue Amount
            </span>
            <strong className="mt-1 block text-rose-700">{formatCurrency(overdueAmount)}</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="block font-bold uppercase tracking-wider text-slate-500">
              Next Review
            </span>
            <strong className="mt-1 block text-slate-900">
              {nextReviewDate || buyer.creditReviewDate || '2026-12-15'}
            </strong>
          </div>
        </div>
      </div>
    </Card>
  );
};
