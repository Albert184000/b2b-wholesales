import React from 'react';
import { AlertTriangle, Clock3 } from 'lucide-react';
import { Quote } from '../../types';
import { getQuoteExpiryState } from '../../utils/rfqQuote';

interface QuoteExpiryNoticeProps {
  quote: Quote;
  compact?: boolean;
  className?: string;
}

export const QuoteExpiryNotice: React.FC<QuoteExpiryNoticeProps> = ({
  quote,
  compact = false,
  className = ''
}) => {
  const expiry = getQuoteExpiryState(quote);
  const Icon = expiry.tone === 'danger' ? AlertTriangle : Clock3;

  const toneClasses =
    expiry.tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : expiry.tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-slate-200 bg-slate-50 text-slate-700';

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border ${toneClasses} ${
        compact ? 'px-3 py-2 text-xs' : 'p-4 text-sm'
      } ${className}`}
    >
      <Icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} mt-0.5 shrink-0`} />
      <div>
        <div className="font-bold">{expiry.label}</div>
        {!compact && (
          <p className="mt-0.5 text-xs opacity-80">
            Quote validity controls buyer actions. Expired quotes can be reviewed but cannot be
            accepted or countered.
          </p>
        )}
      </div>
    </div>
  );
};
