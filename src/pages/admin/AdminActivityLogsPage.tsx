import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Globe2,
  History,
  Search,
  Shield,
  XCircle
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Input,
  KPICard,
  LoadingSkeleton,
  Modal,
  PageHeader,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import { mockActivityLogs } from '../../data/mockData';
import { ActivityLog } from '../../types';

type ActivityStatus = 'Successful' | 'Review' | 'Failed';
type ActivityLogRow = ActivityLog & {
  userName: string;
  userRole: string;
  module: string;
  recordId: string;
  recordType: string;
  ipAddress: string;
  description: string;
  status: ActivityStatus;
};

const pageSize = 8;
const controlClassName = 'h-10 min-w-0';

const supplementalActivityLogs: ActivityLog[] = [
  {
    id: 'log-005',
    userId: 'usr-adm-01',
    userName: 'Un Somnang',
    userRole: 'ADMIN',
    action: 'APPROVED_BUYER_APPLICATION',
    module: 'BUYERS',
    recordId: 'APP-2026-014',
    recordType: 'BuyerApplication',
    description: 'Approved Angkor Cloud Solutions as a Corporate buyer after document review.',
    ipAddress: '10.0.10.2',
    timestamp: '2026-08-18 09:30 AM'
  },
  {
    id: 'log-006',
    userId: 'usr-rep-01',
    userName: 'David Chen',
    userRole: 'ACCOUNT_EXECUTIVE',
    action: 'UPDATED_RFQ_STATUS',
    module: 'RFQS',
    recordId: 'RFQ-2026-103',
    recordType: 'RFQ',
    description: 'Moved printer fleet RFQ into sales review and assigned quotation owner.',
    ipAddress: '10.0.14.88',
    timestamp: '2026-08-18 10:12 AM'
  },
  {
    id: 'log-007',
    userId: 'usr-adm-01',
    userName: 'Un Somnang',
    userRole: 'ADMIN',
    action: 'UPDATED_PRODUCT_STATUS',
    module: 'CATALOG',
    recordId: 'PROD-006',
    recordType: 'Product',
    description: 'Activated Samsung PM9A3 enterprise SSD tier pricing after MOQ review.',
    ipAddress: '10.0.10.2',
    timestamp: '2026-08-18 01:45 PM'
  },
  {
    id: 'log-008',
    userId: 'usr-mgr-01',
    userName: 'Marcus Vance',
    userRole: 'SALES_MANAGER',
    action: 'REQUESTED_QUOTE_REVIEW',
    module: 'QUOTES',
    recordId: 'QTE-2026-113',
    recordType: 'Quote',
    description: 'Requested manager approval for concession pricing on networking equipment.',
    ipAddress: '10.0.12.45',
    timestamp: '2026-08-18 03:05 PM'
  },
  {
    id: 'log-009',
    userId: 'usr-adm-01',
    userName: 'Un Somnang',
    userRole: 'ADMIN',
    action: 'FAILED_LOGIN_ATTEMPT',
    module: 'AUTH',
    recordId: 'USR-UNKNOWN',
    recordType: 'Authentication',
    description: 'Blocked sign-in attempt after repeated invalid credentials.',
    ipAddress: '203.176.132.22',
    timestamp: '2026-08-18 04:22 PM'
  },
  {
    id: 'log-010',
    userId: 'usr-adm-01',
    userName: 'Un Somnang',
    userRole: 'ADMIN',
    action: 'RECORDED_PAYMENT',
    module: 'FINANCE',
    recordId: 'INV-2026-0112',
    recordType: 'Invoice',
    description: 'Recorded partial wire payment against ABC Technology invoice.',
    ipAddress: '10.0.10.2',
    timestamp: '2026-08-18 05:14 PM'
  },
  {
    id: 'log-011',
    userId: 'usr-rep-01',
    userName: 'David Chen',
    userRole: 'ACCOUNT_EXECUTIVE',
    action: 'CREATED_SHIPMENT',
    module: 'LOGISTICS',
    recordId: 'SHP-2026-0041',
    recordType: 'Shipment',
    description: 'Prepared outbound pallet shipment from Phnom Penh Main Distribution Hub.',
    ipAddress: '10.0.14.88',
    timestamp: '2026-08-19 08:40 AM'
  },
  {
    id: 'log-012',
    userId: 'usr-adm-01',
    userName: 'Un Somnang',
    userRole: 'ADMIN',
    action: 'UPDATED_SYSTEM_SETTING',
    module: 'SYSTEM',
    recordId: 'SETTINGS-CREDIT',
    recordType: 'Settings',
    description: 'Updated credit review reminder threshold for enterprise buyers.',
    ipAddress: '10.0.10.2',
    timestamp: '2026-08-19 09:10 AM'
  }
];

const normalizeLog = (log: ActivityLog): ActivityLogRow => {
  const action = log.action || 'UNKNOWN_ACTION';
  const status: ActivityStatus = action.includes('FAILED')
    ? 'Failed'
    : action.includes('REQUESTED') || action.includes('CREDIT')
    ? 'Review'
    : 'Successful';

  return {
    ...log,
    userName: log.userName || log.user || 'System',
    userRole: log.userRole || 'SYSTEM',
    module: log.module || 'SYSTEM',
    recordId: log.recordId || 'N/A',
    recordType: log.recordType || 'Record',
    ipAddress: log.ipAddress || 'N/A',
    description: log.description || log.details || 'Activity recorded.',
    status
  };
};

const parseActivityDate = (timestamp: string) => {
  const [datePart, timePart = '00:00', meridiem = 'AM'] = timestamp.split(' ');
  const [hourPart = '0', minutePart = '0'] = timePart.split(':');
  let hour = Number(hourPart);
  const minute = Number(minutePart);

  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  const parsed = new Date(`${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatAction = (action: string) =>
  action
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');

export const AdminActivityLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<ActivityLogRow | null>(null);
  const [viewState, setViewState] = useState<'ready' | 'loading' | 'error'>('ready');

  const logs = useMemo(
    () => [...mockActivityLogs, ...supplementalActivityLogs].map(normalizeLog),
    []
  );

  const options = useMemo(
    () => ({
      users: Array.from(new Set(logs.map((log) => log.userName))).sort(),
      roles: Array.from(new Set(logs.map((log) => log.userRole))).sort(),
      modules: Array.from(new Set(logs.map((log) => log.module))).sort(),
      actions: Array.from(new Set(logs.map((log) => log.action))).sort(),
      statuses: Array.from(new Set(logs.map((log) => log.status))).sort()
    }),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const activityDate = parseActivityDate(log.timestamp);
      const searchable = [
        log.timestamp,
        log.userName,
        log.userRole,
        log.action,
        log.module,
        log.recordId,
        log.recordType,
        log.ipAddress,
        log.status,
        log.description
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesDateFrom = !dateFrom || Boolean(activityDate && activityDate >= new Date(`${dateFrom}T00:00:00`));
      const matchesDateTo = !dateTo || Boolean(activityDate && activityDate <= new Date(`${dateTo}T23:59:59`));
      const matchesUser = userFilter === 'ALL' || log.userName === userFilter;
      const matchesRole = roleFilter === 'ALL' || log.userRole === roleFilter;
      const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

      return (
        matchesSearch &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesUser &&
        matchesRole &&
        matchesModule &&
        matchesAction &&
        matchesStatus
      );
    });
  }, [actionFilter, dateFrom, dateTo, logs, moduleFilter, roleFilter, searchTerm, statusFilter, userFilter]);

  const hasActiveFilters =
    searchTerm !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    userFilter !== 'ALL' ||
    roleFilter !== 'ALL' ||
    moduleFilter !== 'ALL' ||
    actionFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setUserFilter('ALL');
    setRoleFilter('ALL');
    setModuleFilter('ALL');
    setActionFilter('ALL');
    setStatusFilter('ALL');
  };

  const successfulCount = logs.filter((log) => log.status === 'Successful').length;
  const reviewCount = logs.filter((log) => log.status === 'Review').length;
  const failedCount = logs.filter((log) => log.status === 'Failed').length;
  const securityCount = logs.filter((log) => ['AUTH', 'SYSTEM'].includes(log.module)).length;

  const columns: Column<ActivityLogRow>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: (log) => <span className="whitespace-nowrap font-mono text-xs text-slate-600">{log.timestamp}</span>
    },
    {
      key: 'user',
      header: 'User',
      accessor: (log) => (
        <div className="min-w-[170px]">
          <div className="font-bold text-slate-900">{log.userName}</div>
          <div className="text-xs text-slate-500">{log.userId || 'system'}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (log) => <span className="whitespace-nowrap text-xs font-bold text-slate-700">{log.userRole}</span>
    },
    {
      key: 'action',
      header: 'Action',
      accessor: (log) => (
        <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
          {formatAction(log.action)}
        </span>
      )
    },
    {
      key: 'module',
      header: 'Module',
      accessor: (log) => <StatusBadge status={log.module} size="sm" showDot={false} />
    },
    {
      key: 'target',
      header: 'Target / Record',
      accessor: (log) => (
        <div className="min-w-[150px]">
          <div className="font-mono text-xs font-bold text-slate-900">{log.recordId}</div>
          <div className="text-xs text-slate-500">{log.recordType}</div>
        </div>
      )
    },
    {
      key: 'ip',
      header: 'IP Address',
      accessor: (log) => <span className="whitespace-nowrap font-mono text-xs text-slate-600">{log.ipAddress}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (log) => <StatusBadge status={log.status} size="sm" />
    },
    {
      key: 'details',
      header: 'Details',
      sortable: false,
      accessor: (log) => (
        <Button
          type="button"
          variant="outline"
          size="xs"
          icon={Eye}
          onClick={() => setSelectedLog(log)}
          aria-label={`View details for ${log.action} on ${log.recordId}`}
        >
          Details
        </Button>
      )
    }
  ];

  if (viewState === 'error') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Activity Logs"
          subtitle="System audit trail for staff, buyer, finance, catalog, and logistics actions."
          breadcrumbs={[
            { label: 'Admin Portal', href: '/admin/dashboard' },
            { label: 'Activity Logs' }
          ]}
        />
        <EmptyState
          icon={AlertTriangle}
          title="Activity logs could not load"
          description="The audit trail is temporarily unavailable in this workspace."
          actionText="Retry"
          actionIcon={History}
          onAction={() => setViewState('ready')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        subtitle="System audit trail for staff, buyer, finance, catalog, and logistics actions."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Activity Logs' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Events" value={logs.length} subtext="Recorded audit entries" icon={Activity} />
        <KPICard title="Successful" value={successfulCount} subtext="Completed actions" icon={CheckCircle2} badge="Stable" badgeVariant="success" />
        <KPICard title="Needs Review" value={reviewCount} subtext="Approval or review events" icon={Shield} badge={reviewCount ? 'Review' : undefined} badgeVariant="amber" />
        <KPICard title="Security Events" value={securityCount + failedCount} subtext={`${failedCount} failed event${failedCount === 1 ? '' : 's'}`} icon={Globe2} badge={failedCount ? 'Watch' : undefined} badgeVariant="danger" />
      </div>

      <Card title="Search & Filters" subtitle="Filter by actor, date, module, action, and status.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="activity-log-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Search
            </label>
            <SearchBar
              id="activity-log-search"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search logs by user, action, record, IP, or description..."
              inputClassName={controlClassName}
            />
          </div>
          <Input
            id="activity-date-from"
            type="date"
            label="Date From"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className={controlClassName}
          />
          <Input
            id="activity-date-to"
            type="date"
            label="Date To"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className={controlClassName}
          />
          <Select
            id="activity-user-filter"
            label="User"
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
            options={[{ label: 'All Users', value: 'ALL' }, ...options.users.map((user) => ({ label: user, value: user }))]}
            className={controlClassName}
          />
          <Select
            id="activity-role-filter"
            label="Role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            options={[{ label: 'All Roles', value: 'ALL' }, ...options.roles.map((role) => ({ label: role, value: role }))]}
            className={controlClassName}
          />
          <Select
            id="activity-module-filter"
            label="Module"
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            options={[{ label: 'All Modules', value: 'ALL' }, ...options.modules.map((module) => ({ label: module, value: module }))]}
            className={controlClassName}
          />
          <Select
            id="activity-action-filter"
            label="Action"
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            options={[
              { label: 'All Actions', value: 'ALL' },
              ...options.actions.map((action) => ({ label: formatAction(action), value: action }))
            ]}
            className={controlClassName}
          />
          <Select
            id="activity-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[{ label: 'All Statuses', value: 'ALL' }, ...options.statuses.map((status) => ({ label: status, value: status }))]}
            className={controlClassName}
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant={hasActiveFilters ? 'outline' : 'secondary'}
              size="sm"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="h-10 w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Activity Log Table"
        subtitle={`Showing ${filteredLogs.length} of ${logs.length} audit entries.`}
        action={
          <Button
            type="button"
            variant="ghost"
            size="xs"
            icon={Search}
            onClick={() => {
              setViewState('loading');
              window.setTimeout(() => setViewState('ready'), 400);
            }}
          >
            Refresh
          </Button>
        }
      >
        {viewState === 'loading' ? (
          <LoadingSkeleton type="table" rows={6} />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No activity logs found"
            description="Adjust filters or reset them to view the full audit trail."
            actionText={hasActiveFilters ? 'Reset Filters' : undefined}
            actionIcon={History}
            onAction={hasActiveFilters ? resetFilters : undefined}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredLogs}
            keyExtractor={(log) => log.id}
            pageSize={pageSize}
            enablePagination
            className="[&_table]:min-w-[1120px]"
            emptyMessage="No activity logs match the current filters."
          />
        )}
      </Card>

      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Activity Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Timestamp', selectedLog.timestamp],
                ['User', selectedLog.userName],
                ['Role', selectedLog.userRole],
                ['Action', formatAction(selectedLog.action)],
                ['Module', selectedLog.module],
                ['Target', `${selectedLog.recordType} / ${selectedLog.recordId}`],
                ['IP Address', selectedLog.ipAddress],
                ['Status', selectedLog.status]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Description</div>
              <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
                {selectedLog.description}
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" icon={XCircle} onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
