import React from 'react';
import { SemanticStatus } from '../../types';

interface StatusBadgeProps {
  status: SemanticStatus | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = ''
}) => {
  const getStatusConfig = (st: string) => {
    switch (st) {
      // Green statuses
      case 'Approved':
      case 'Paid':
      case 'Completed':
      case 'Delivered':
      case 'Verified':
      case 'Good':
      case 'Good Standing':
      case 'Default':
      case 'Complete':
      case 'Low Risk':
      case 'Active':
      case 'Ready':
      case 'Accepted':
      case 'Converted':
      case 'Fulfilled':
      case 'Stock Allocated':
      case 'Fully Shipped':
      case 'Renewed':
      case 'Passed':
      case 'Fully Available':
      case 'In Stock':
      case 'SUCCESS':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };

      // Amber statuses
      case 'Pending':
      case 'Under Review':
      case 'Additional Documents Required':
      case 'Missing':
      case 'Pending Review':
      case 'Medium Risk':
      case 'Watchlist':
      case 'Awaiting Approval':
      case 'Pending Approval':
      case 'Pending Manager Approval':
      case 'Pending Signature':
      case 'Approval Required':
      case 'Renewal Requested':
      case 'Due Soon':
      case 'Partially Paid':
      case 'Partially Delivered':
      case 'Delayed':
      case 'Low Stock':
      case 'Viewed':
      case 'Near Expiry':
      case 'Partial Availability':
      case 'Below MOQ':
      case 'WARNING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };

      // Blue statuses
      case 'Processing':
      case 'Issued':
      case 'Assigned':
      case 'Verification In Progress':
      case 'Verification Pending':
      case 'In Transit':
      case 'Submitted':
      case 'Sent':
      case 'Quoted':
      case 'Negotiating':
      case 'Partially Shipped':
      case 'Out for Delivery':
      case 'In Progress':
      case 'Dispatched':
      case 'INFO':
      case 'Unread':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };

      // Red statuses
      case 'Rejected':
      case 'Overdue':
      case 'Cancelled':
      case 'Suspended':
      case 'Credit Hold':
      case 'High Risk':
      case 'Out of Stock':
      case 'Expired':
      case 'Terminated':
      case 'Exceeded':
      case 'Backorder':
      case 'Delivery Issue':
      case 'ALERT':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500'
        };

      // Gray statuses
      case 'Draft':
      case 'Archived':
      case 'Inactive':
      case 'Partial':
      case 'Unpaid':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${sizeClasses} ${className} whitespace-nowrap`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span>{status}</span>
    </span>
  );
};
