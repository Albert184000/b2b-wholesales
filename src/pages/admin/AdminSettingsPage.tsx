import React, { useState } from 'react';
import { Settings, Save, Building2, CreditCard, Shield, Bell, Database } from 'lucide-react';
import {
  Button,
  Card,
  PageHeader,
  Input,
  Select,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useApp();

  const [companyName, setCompanyName] = useState('WholesaleHub Commercial Supply Ltd.');
  const [taxId, setTaxId] = useState('KHM-VAT-992810');
  const [currency, setCurrency] = useState('USD');
  const [defaultCreditLimit, setDefaultCreditLimit] = useState(25000);
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('Net 30');
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState('Disabled (Manual Review)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('ERP System configuration settings saved successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="ERP Global System Configuration"
        subtitle="Configure corporate legal identity, default underwriting parameters, and automated notification triggers"
        breadcrumbs={[
          { label: 'System & Security', href: '/admin/dashboard' },
          { label: 'System Settings' }
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Corporate Entity & Legal Parameters" className="p-6 border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Wholesale Distributor Legal Entity Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <Input
              label="VAT / Tax Identification Registration"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              required
            />

            <Select
              label="Primary Base Operating Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { label: 'USD ($) — United States Dollar', value: 'USD' },
                { label: 'KHR (៛) — Khmer Riel', value: 'KHR' }
              ]}
            />
          </div>
        </Card>

        <Card title="Credit Risk & Default Onboarding Parameters" className="p-6 border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default New Buyer Credit Facility ($ USD)"
              type="number"
              value={defaultCreditLimit}
              onChange={(e) => setDefaultCreditLimit(parseInt(e.target.value) || 0)}
              helperText="Baseline limit assigned prior to audited financial review"
            />

            <Select
              label="Default Invoicing Settlement Terms"
              value={defaultPaymentTerms}
              onChange={(e) => setDefaultPaymentTerms(e.target.value)}
              options={[
                { label: 'Net 30 Days', value: 'Net 30' },
                { label: 'Net 60 Days', value: 'Net 60' },
                { label: '100% Advance Wire Transfer', value: 'Advance Wire' }
              ]}
            />

            <div className="sm:col-span-2">
              <Select
                label="Automated Buyer Compliance Verification"
                value={autoApprovalThreshold}
                onChange={(e) => setAutoApprovalThreshold(e.target.value)}
                options={[
                  { label: 'Disabled (Require Manual MOC & Tax Certificate Review)', value: 'Disabled' },
                  { label: 'Enable Automatic Tier-3 with $5,000 credit cap', value: 'Tier3' }
                ]}
              />
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
