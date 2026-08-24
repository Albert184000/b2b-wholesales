import React, { useState } from 'react';
import { Bell, Building2, CreditCard, Database, Save, Settings, Shield } from 'lucide-react';
import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useApp();

  const [companyName, setCompanyName] = useState('WholesaleHub Commercial Supply Ltd.');
  const [taxId, setTaxId] = useState('KHM-VAT-992810');
  const [currency, setCurrency] = useState('USD');
  const [supportEmail, setSupportEmail] = useState('support@wholesalehub.example');
  const [defaultCreditLimit, setDefaultCreditLimit] = useState(25000);
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('Net 30');
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState('Disabled');
  const [notificationDigest, setNotificationDigest] = useState('Daily Digest');
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [auditRetention, setAuditRetention] = useState('24 months');
  const [backupMode, setBackupMode] = useState('Nightly Snapshot');
  const [settingsNote, setSettingsNote] = useState('Mock UI only. Backend policy enforcement will be connected in the API stage.');

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    showToast('ERP system configuration settings saved successfully.', 'success');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="ERP Global System Configuration"
        subtitle="Configure corporate identity, default underwriting parameters, notifications, audit retention, and local UI policy."
        breadcrumbs={[
          { label: 'System & Security', href: '/admin/dashboard' },
          { label: 'System Settings' }
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Company', value: companyName, icon: Building2 },
            { label: 'Credit Defaults', value: `$${defaultCreditLimit.toLocaleString()}`, icon: CreditCard },
            { label: 'RBAC Mode', value: 'Centralized', icon: Shield },
            { label: 'Audit Retention', value: auditRetention, icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Icon className="h-4 w-4 text-blue-700" />
                  {item.label}
                </div>
                <div className="mt-2 truncate text-sm font-bold text-slate-900">{item.value}</div>
              </div>
            );
          })}
        </div>

        <Card title="Corporate Entity & Legal Parameters" className="border-slate-200 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Wholesale Distributor Legal Entity Name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                required
              />
            </div>
            <Input
              label="VAT / Tax Identification Registration"
              value={taxId}
              onChange={(event) => setTaxId(event.target.value)}
              required
            />
            <Select
              label="Primary Base Operating Currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              options={[
                { label: 'USD ($) - United States Dollar', value: 'USD' },
                { label: 'KHR (Riel) - Khmer Riel', value: 'KHR' }
              ]}
            />
            <Input
              label="Buyer Support Email"
              type="email"
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
              helperText="Displayed in onboarding and document-review UI."
            />
          </div>
        </Card>

        <Card title="Credit Risk & Default Onboarding Parameters" className="border-slate-200 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Default New Buyer Credit Facility"
              type="number"
              value={defaultCreditLimit}
              onChange={(event) => setDefaultCreditLimit(parseInt(event.target.value, 10) || 0)}
              helperText="Baseline limit assigned before audited financial review."
              prefixText="$"
            />
            <Select
              label="Default Invoicing Settlement Terms"
              value={defaultPaymentTerms}
              onChange={(event) => setDefaultPaymentTerms(event.target.value)}
              options={[
                { label: 'Prepaid', value: 'Prepaid' },
                { label: 'COD', value: 'COD' },
                { label: 'Net-30', value: 'Net 30' },
                { label: 'Net-60', value: 'Net 60' },
                { label: 'Net-90', value: 'Net 90' }
              ]}
            />
            <div className="sm:col-span-2">
              <Select
                label="Automated Buyer Compliance Verification"
                value={autoApprovalThreshold}
                onChange={(event) => setAutoApprovalThreshold(event.target.value)}
                options={[
                  { label: 'Disabled - require manual tax and company document review', value: 'Disabled' },
                  { label: 'Enable Tier-3 auto approval with $5,000 cap', value: 'Tier3' }
                ]}
              />
            </div>
          </div>
        </Card>

        <Card title="Notifications, Security, and Audit Controls" className="border-slate-200 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Operational Notification Digest"
              value={notificationDigest}
              onChange={(event) => setNotificationDigest(event.target.value)}
              options={[
                { label: 'Immediate Alerts', value: 'Immediate Alerts' },
                { label: 'Daily Digest', value: 'Daily Digest' },
                { label: 'Weekly Summary', value: 'Weekly Summary' }
              ]}
            />
            <Select
              label="Admin Session Timeout"
              value={sessionTimeout}
              onChange={(event) => setSessionTimeout(event.target.value)}
              options={[
                { label: '15 minutes', value: '15 minutes' },
                { label: '30 minutes', value: '30 minutes' },
                { label: '60 minutes', value: '60 minutes' }
              ]}
            />
            <Select
              label="Activity Log Retention"
              value={auditRetention}
              onChange={(event) => setAuditRetention(event.target.value)}
              options={[
                { label: '12 months', value: '12 months' },
                { label: '24 months', value: '24 months' },
                { label: '36 months', value: '36 months' }
              ]}
            />
            <Select
              label="Mock Backup Schedule"
              value={backupMode}
              onChange={(event) => setBackupMode(event.target.value)}
              options={[
                { label: 'Nightly Snapshot', value: 'Nightly Snapshot' },
                { label: 'Twice Daily Snapshot', value: 'Twice Daily Snapshot' },
                { label: 'Manual Export Only', value: 'Manual Export Only' }
              ]}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="System Operations Note"
                rows={3}
                value={settingsNote}
                onChange={(event) => setSettingsNote(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Bell className="h-4 w-4 text-blue-700" />
                Notifications
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">Buyer approval, quote, invoice, stock, and shipment triggers are represented in mock UI.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Shield className="h-4 w-4 text-blue-700" />
                Access Control
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">Menus, routes, actions, and protected fields stay controlled by centralized RBAC.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Database className="h-4 w-4 text-blue-700" />
                Data Policy
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">This stage stores all actions locally until backend integration is approved.</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
