import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, BriefcaseBusiness, Download, LineChart as LineChartIcon, TrendingUp, Users } from 'lucide-react';
import {
  Button,
  Card,
  ChartCard,
  Column,
  DataTable,
  KPICard,
  PageHeader,
  Select,
  StatusBadge
} from '../../components/ui';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { BuyerCompany, Contract } from '../../types';
import { formatCurrency } from '../../utils/pricing';

const employeePerformance = [
  { id: 'emp-001', name: 'David Chen', role: 'Account Executive', revenue: 485000, quotes: 34, winRate: 78, status: 'Active' },
  { id: 'emp-002', name: 'Sreymom Heng', role: 'Sales Manager', revenue: 392000, quotes: 27, winRate: 74, status: 'Active' },
  { id: 'emp-003', name: 'Vutha Sok', role: 'Warehouse Manager', revenue: 0, quotes: 0, winRate: 96, status: 'Active' },
  { id: 'emp-004', name: 'Malis Chan', role: 'Finance Officer', revenue: 0, quotes: 0, winRate: 94, status: 'Active' }
];

export const AdminReportsPage: React.FC = () => {
  const {
    adminDashboardStats,
    buyers,
    contracts,
    purchaseOrders,
    invoices,
    showToast
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'sales';
  const [timeRange, setTimeRange] = useState('2026-Q3');

  const totalRevenue = purchaseOrders.reduce((sum, po) => sum + (po.grandTotal || po.totalAmount || 0), 0);
  const activeContracts = contracts.filter((contract) => contract.status === 'Active').length;
  const outstandingAR = invoices.reduce((sum, invoice) => sum + (invoice.balanceDue || 0), 0);
  const buyerSpendRows = useMemo(
    () =>
      [...buyers]
        .sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0))
        .slice(0, 8),
    [buyers]
  );

  const buyerColumns: Column<BuyerCompany>[] = [
    {
      key: 'buyer',
      header: 'Buyer',
      accessor: (buyer) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{buyer.companyName}</div>
          <div className="text-xs text-slate-500">{buyer.buyerGroup} / {buyer.assignedRep.name}</div>
        </div>
      )
    },
    { key: 'spend', header: 'Procurement', align: 'right', accessor: (buyer) => <span className="font-mono font-bold text-slate-900">{formatCurrency(buyer.totalPurchases || 0)}</span> },
    { key: 'credit', header: 'Credit Limit', align: 'right', accessor: (buyer) => <span className="font-mono text-slate-700">{formatCurrency(buyer.creditLimit)}</span> },
    { key: 'status', header: 'Status', accessor: (buyer) => <StatusBadge status={buyer.status} size="sm" /> }
  ];

  const contractColumns: Column<Contract>[] = [
    {
      key: 'contract',
      header: 'Contract',
      accessor: (contract) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{contract.title}</div>
          <div className="font-mono text-xs text-blue-700">{contract.contractNumber || contract.id}</div>
        </div>
      )
    },
    { key: 'buyer', header: 'Buyer', accessor: (contract) => <span className="font-semibold text-slate-900">{contract.companyName || contract.buyerName}</span> },
    { key: 'value', header: 'Value', align: 'right', accessor: (contract) => <span className="font-mono font-bold text-slate-900">{formatCurrency(contract.contractValue || 0)}</span> },
    { key: 'end', header: 'End Date', accessor: (contract) => <span className="text-slate-700">{contract.endDate}</span> },
    { key: 'status', header: 'Status', accessor: (contract) => <StatusBadge status={contract.status} size="sm" /> }
  ];

  const employeeColumns: Column<(typeof employeePerformance)[number]>[] = [
    {
      key: 'employee',
      header: 'Employee',
      accessor: (employee) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{employee.name}</div>
          <div className="text-xs text-slate-500">{employee.role}</div>
        </div>
      )
    },
    { key: 'revenue', header: 'Revenue Managed', align: 'right', accessor: (employee) => <span className="font-mono font-bold text-slate-900">{formatCurrency(employee.revenue)}</span> },
    { key: 'quotes', header: 'Quotes', align: 'right', accessor: (employee) => <span className="font-mono text-slate-700">{employee.quotes}</span> },
    { key: 'score', header: 'Performance', accessor: (employee) => <StatusBadge status={`${employee.winRate}% Score`} size="sm" showDot={false} /> },
    { key: 'status', header: 'Status', accessor: (employee) => <StatusBadge status={employee.status} size="sm" /> }
  ];

  const renderReportBody = () => {
    if (activeTab === 'buyers') {
      return (
        <Card title="Buyer Performance Report">
          <DataTable columns={buyerColumns} data={buyerSpendRows} />
        </Card>
      );
    }

    if (activeTab === 'contracts') {
      return (
        <Card title="Contract Performance Report">
          <DataTable columns={contractColumns} data={contracts} />
        </Card>
      );
    }

    if (activeTab === 'employees') {
      return (
        <Card title="Employee Performance Report">
          <DataTable columns={employeeColumns} data={employeePerformance} />
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue vs Target" subtitle="Monthly wholesale performance.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminDashboardStats.revenueMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Buyer Growth" subtitle="Verified buyer count by group.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminDashboardStats.buyerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="standard" stroke="#64748b" strokeWidth={2} />
                <Line type="monotone" dataKey="corporate" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="vip" stroke="#059669" strokeWidth={2} />
                <Line type="monotone" dataKey="distributor" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports and Analytics"
        subtitle="Executive reporting for sales, buyers, contracts, finance exposure, and staff performance."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
              options={[
                { label: 'Current Quarter (Q3 2026)', value: '2026-Q3' },
                { label: 'Year-to-Date (2026)', value: '2026-YTD' },
                { label: 'Fiscal Year 2025', value: '2025-FY' }
              ]}
            />
            <Button variant="outline" size="sm" icon={Download} onClick={() => showToast(`${timeRange} report export queued.`, 'success')}>
              Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Revenue Managed" value={formatCurrency(totalRevenue)} subtext="Purchase order value" icon={TrendingUp} />
        <KPICard title="Active Buyers" value={buyers.filter((buyer) => ['Approved', 'Active'].includes(buyer.status)).length} subtext={`${buyers.length} total records`} icon={Users} />
        <KPICard title="Active Contracts" value={activeContracts} subtext={`${contracts.length} contract records`} icon={BriefcaseBusiness} />
        <KPICard title="Outstanding AR" value={formatCurrency(outstandingAR)} subtext="Invoice balance due" icon={BarChart3} />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'sales', label: 'Sales Reports', icon: LineChartIcon },
          { id: 'buyers', label: 'Buyer Reports', icon: Users },
          { id: 'contracts', label: 'Contract Reports', icon: BriefcaseBusiness },
          { id: 'employees', label: 'Employee Performance', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              icon={Icon}
              onClick={() => setSearchParams(tab.id === 'sales' ? {} : { tab: tab.id })}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {renderReportBody()}
    </div>
  );
};
