import React from 'react';
import { AlertTriangle, CheckCircle2, CreditCard } from 'lucide-react';
import { CreditCheck } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { Card, StatusBadge } from '../ui';

interface CreditValidationCardProps {
  creditCheck: CreditCheck;
  className?: string;
}

export const CreditValidationCard: React.FC<CreditValidationCardProps> = ({
  creditCheck,
  className = ''
}) => {
  const Icon = creditCheck.status === 'Passed' ? CheckCircle2 : AlertTriangle;
  const iconClasses =
    creditCheck.status === 'Passed'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : creditCheck.status === 'Approval Required'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <Card title="Credit Validation" className={className}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={creditCheck.status} />
            <span className="text-xs font-semibold text-slate-500">
              Buyer status: {creditCheck.buyerStatus}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{creditCheck.message}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          ['Credit Limit', creditCheck.creditLimit],
          ['Used Credit', creditCheck.usedCredit],
          ['Available Credit', creditCheck.availableCredit],
          ['PO Amount', creditCheck.poAmount],
          ['Remaining After PO', creditCheck.remainingCreditAfterPO],
          ['Shortfall', creditCheck.shortfall]
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {label === 'PO Amount' && <CreditCard className="h-3.5 w-3.5" />}
              <span>{label}</span>
            </div>
            <div
              className={`mt-1 font-mono text-lg font-extrabold ${
                label === 'Remaining After PO' && Number(value) < 0
                  ? 'text-rose-700'
                  : label === 'Shortfall' && Number(value) > 0
                  ? 'text-amber-700'
                  : 'text-slate-900'
              }`}
            >
              {formatCurrency(Number(value))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
