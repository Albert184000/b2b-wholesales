import React, { useState } from 'react';
import { Activity, Search, Shield, User, Clock, FileText, CheckCircle2 } from 'lucide-react';
import {
  DataTable,
  Column,
  PageHeader,
  SearchBar,
  Card,
  StatusBadge
} from '../../components/ui';
import { mockActivityLogs } from '../../data/mockData';
import { ActivityLog } from '../../types';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs] = useState<ActivityLog[]>(mockActivityLogs);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((l) =>
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<ActivityLog>[] = [
    {
      header: 'Timestamp',
      accessor: (l) => <span className="font-mono text-xs text-slate-500">{l.timestamp}</span>,
      sortable: true
    },
    {
      header: 'Staff User',
      accessor: (l) => (
        <span className="font-semibold text-slate-900">{l.user}</span>
      ),
      sortable: true
    },
    {
      header: 'Action Taken',
      accessor: (l) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          {l.action}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Audit Trail Details',
      accessor: (l) => <span className="text-slate-700 text-xs">{l.details}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ERP System Audit Logs & Compliance Trail"
        subtitle="Immutable timestamped records of all credit adjustments, RFQ quotes, user approvals, and catalog updates"
        breadcrumbs={[
          { label: 'System & Security', href: '/admin/dashboard' },
          { label: 'Activity Logs' }
        ]}
      />

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search audit trail by user, action, or document ref..."
          />
        </div>

        <DataTable columns={columns} data={filteredLogs} />
      </Card>
    </div>
  );
};
