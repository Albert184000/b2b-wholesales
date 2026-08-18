import React from 'react';
import { CheckCircle2, Clock3, MessageSquare, ShieldCheck, XCircle } from 'lucide-react';
import { NegotiationEntry } from '../../types';
import { Avatar, StatusBadge } from '../ui';
import { formatCurrency } from '../../utils/pricing';

interface NegotiationTimelineProps {
  entries?: NegotiationEntry[];
  className?: string;
}

const getActionIcon = (entry: NegotiationEntry) => {
  if (entry.actionTaken === 'ACCEPT_QUOTE' || entry.actionTaken === 'MANAGER_APPROVED') {
    return CheckCircle2;
  }
  if (entry.actionTaken === 'REJECT_QUOTE') {
    return XCircle;
  }
  if (entry.actionTaken === 'REQUEST_MANAGER_APPROVAL') {
    return ShieldCheck;
  }
  return entry.senderRole === 'SYSTEM' ? Clock3 : MessageSquare;
};

const getRoleLabel = (role: string) => {
  if (role === 'BUYER') return 'Buyer';
  if (role === 'SALES_REP') return 'Sales Rep';
  if (role === 'SALES_MANAGER') return 'Sales Manager';
  if (role === 'SYSTEM') return 'System';
  return role;
};

export const NegotiationTimeline: React.FC<NegotiationTimelineProps> = ({
  entries = [],
  className = ''
}) => {
  if (entries.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 ${className}`}>
        No negotiation activity has been recorded yet.
      </div>
    );
  }

  return (
    <div className={`relative space-y-4 ${className}`}>
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />

      {entries.map((entry) => {
        const Icon = getActionIcon(entry);
        const isBuyer = entry.senderRole === 'BUYER';

        return (
          <div key={entry.id} className="relative flex items-start gap-3">
            <div
              className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-xs ${
                isBuyer
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : entry.senderRole === 'SALES_MANAGER'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : entry.senderRole === 'SYSTEM'
                  ? 'border-slate-200 bg-slate-100 text-slate-600'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={entry.senderName} size="xs" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-900">{entry.senderName}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {getRoleLabel(entry.senderRole)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  {entry.status && <StatusBadge status={entry.status} size="sm" />}
                  <span>{entry.timestamp}</span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">{entry.message}</p>

              {(entry.proposedPrice || entry.quantity || entry.attachmentName) && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {entry.proposedPrice && (
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">
                      Proposed: {formatCurrency(entry.proposedPrice)}
                    </span>
                  )}
                  {entry.quantity && (
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">
                      Qty: {entry.quantity.toLocaleString()} units
                    </span>
                  )}
                  {entry.attachmentName && (
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">
                      {entry.attachmentName}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
