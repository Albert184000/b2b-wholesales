import React, { useMemo, useState } from 'react';
import {
  Building2,
  Check,
  CreditCard,
  FileCheck,
  FileText,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { BuyerCreditSummary, BuyerProfileSummary } from '../../components/buyer';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Tabs
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BusinessDocument, CompanyAddress, CreditActivity } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { getInvoiceBalance } from '../../utils/financeLogistics';

const blankAddress: CompanyAddress = {
  id: '',
  type: 'Shipping',
  label: '',
  contactName: '',
  phone: '',
  street: '',
  city: 'Phnom Penh',
  province: 'Phnom Penh',
  country: 'Cambodia',
  postalCode: '',
  isDefault: false
};

export const BuyerProfilePage: React.FC = () => {
  const { currentBuyer, invoices, creditActivity, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'company';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [addresses, setAddresses] = useState<CompanyAddress[]>(currentBuyer.addresses || []);
  const [addressDraft, setAddressDraft] = useState<CompanyAddress>(blankAddress);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: currentBuyer.companyName,
    businessType: currentBuyer.businessType || '',
    registrationNumber: currentBuyer.registrationNumber,
    taxId: currentBuyer.taxId,
    industry: currentBuyer.industry || '',
    website: currentBuyer.website || '',
    phone: currentBuyer.phone,
    email: currentBuyer.businessEmail || currentBuyer.email || '',
    primaryContact: currentBuyer.contactPerson
  });

  const invoiceCreditSummary = useMemo(() => {
    const outstanding = invoices
      .filter((invoice) => !['Paid', 'Cancelled', 'Draft'].includes(invoice.status))
      .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
    const overdue = invoices
      .filter((invoice) => invoice.status === 'Overdue')
      .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);

    return { outstanding, overdue };
  }, [invoices]);

  const tabs = [
    { id: 'company', label: 'Company Information', icon: Building2 },
    { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
    { id: 'documents', label: 'Business Documents', icon: FileCheck, count: currentBuyer.businessDocuments?.length || 0 },
    { id: 'credit', label: 'Credit Information', icon: CreditCard },
    { id: 'team', label: 'Account Team', icon: UserCheck, count: currentBuyer.accountTeam?.length || 0 },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  const setTab = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const openAddressModal = (address?: CompanyAddress) => {
    setEditingAddressId(address?.id || null);
    setAddressDraft(address || { ...blankAddress, id: `addr-${Date.now()}` });
    setAddressModalOpen(true);
  };

  const saveAddress = () => {
    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((address) => (address.id === editingAddressId ? addressDraft : address))
      );
      showToast('Address updated in frontend profile state.', 'success');
    } else {
      setAddresses((prev) => [{ ...addressDraft, id: addressDraft.id || `addr-${Date.now()}` }, ...prev]);
      showToast('Address added to frontend profile state.', 'success');
    }
    setAddressModalOpen(false);
  };

  const setDefaultAddress = (target: CompanyAddress) => {
    setAddresses((prev) =>
      prev.map((address) =>
        address.type === target.type
          ? { ...address, isDefault: address.id === target.id }
          : address
      )
    );
    showToast(`${target.label} set as default ${target.type.toLowerCase()} address.`, 'success');
  };

  const deleteAddress = (addressId: string) => {
    setAddresses((prev) => prev.filter((address) => address.id !== addressId));
    showToast('Address removed from frontend profile state.', 'warning');
  };

  const documentColumns: Column<BusinessDocument>[] = [
    {
      key: 'document',
      header: 'Document',
      accessor: (document) => (
        <div className="min-w-[220px]">
          <div className="font-semibold text-slate-900">{document.document}</div>
          <div className="mt-0.5 font-mono text-xs text-blue-700">{document.documentNumber}</div>
        </div>
      )
    },
    {
      key: 'uploaded',
      header: 'Uploaded Date',
      accessor: (document) => <span className="font-semibold text-slate-700">{document.uploadedDate}</span>
    },
    {
      key: 'expiry',
      header: 'Expiry',
      accessor: (document) => <span className="text-slate-700">{document.expiry || 'N/A'}</span>
    },
    {
      key: 'status',
      header: 'Verification Status',
      accessor: (document) => <StatusBadge status={document.verificationStatus} />
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      accessor: (document) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="xs"
              onClick={() => showToast(`${document.fileName || document.document} opened for review.`, 'info')}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="xs"
              onClick={() => showToast(`${document.document} replacement requested.`, 'info')}
          >
            Replace
          </Button>
        </div>
      )
    }
  ];

  const creditColumns: Column<CreditActivity>[] = [
    {
      key: 'date',
      header: 'Date',
      accessor: (activity) => <span className="font-semibold text-slate-700">{activity.date}</span>
    },
    {
      key: 'activity',
      header: 'Activity',
      accessor: (activity) => <span className="font-bold text-slate-900">{activity.activity}</span>
    },
    {
      key: 'reference',
      header: 'Reference',
      accessor: (activity) => <span className="font-mono text-xs font-bold text-blue-700">{activity.reference}</span>
    },
    {
      key: 'debit',
      header: 'Debit',
      align: 'right',
      accessor: (activity) => (
        <span className="font-mono font-semibold text-rose-700">
          {activity.debit ? `-${formatCurrency(activity.debit)}` : '-'}
        </span>
      )
    },
    {
      key: 'credit',
      header: 'Credit',
      align: 'right',
      accessor: (activity) => (
        <span className="font-mono font-semibold text-emerald-700">
          {activity.credit ? `+${formatCurrency(activity.credit)}` : '-'}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Available Balance',
      align: 'right',
      accessor: (activity) => (
        <span className="font-mono font-bold text-slate-900">{formatCurrency(activity.balance)}</span>
      )
    }
  ];

  const saveCompanyInfo = () => {
    setIsEditingCompany(false);
    showToast('Company information saved in frontend profile state.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        subtitle="Manage buyer identity, addresses, compliance documents, credit terms, contacts, and security preferences."
        badge={<StatusBadge status={currentBuyer.status === 'Approved' ? 'Verified' : currentBuyer.status} />}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Company Profile' }
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <BuyerProfileSummary buyer={currentBuyer} className="xl:col-span-2" />
        <BuyerCreditSummary
          buyer={currentBuyer}
          outstandingInvoices={invoiceCreditSummary.outstanding}
          overdueAmount={invoiceCreditSummary.overdue}
        />
      </div>

      <Card noPadding className="border-slate-200">
        <div className="px-5 pt-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setTab} variant="underline" />
        </div>

        <div className="p-5">
          {activeTab === 'company' && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Company Information</h3>
                  <p className="text-xs text-slate-500">Maintain buyer company profile details used across RFQs, POs, invoices, and shipments.</p>
                </div>
                {isEditingCompany ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingCompany(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" icon={Check} onClick={saveCompanyInfo}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" icon={Pencil} onClick={() => setIsEditingCompany(true)}>
                    Edit
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Company Name"
                  value={companyInfo.companyName}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, companyName: event.target.value }))}
                />
                <Input
                  label="Business Type"
                  value={companyInfo.businessType}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, businessType: event.target.value }))}
                />
                <Input
                  label="Registration Number"
                  value={companyInfo.registrationNumber}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, registrationNumber: event.target.value }))}
                />
                <Input
                  label="Tax ID"
                  value={companyInfo.taxId}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, taxId: event.target.value }))}
                />
                <Input
                  label="Industry"
                  value={companyInfo.industry}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, industry: event.target.value }))}
                />
                <Input
                  label="Website"
                  value={companyInfo.website}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, website: event.target.value }))}
                />
                <Input
                  label="Phone"
                  value={companyInfo.phone}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, phone: event.target.value }))}
                />
                <Input
                  label="Email"
                  value={companyInfo.email}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, email: event.target.value }))}
                />
                <Input
                  label="Primary Contact"
                  value={companyInfo.primaryContact}
                  disabled={!isEditingCompany}
                  onChange={(event) => setCompanyInfo((prev) => ({ ...prev, primaryContact: event.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Account Status</div>
                  <div className="mt-2"><StatusBadge status="Verified" /></div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Buyer Group</div>
                  <div className="mt-2 text-lg font-extrabold text-blue-900">{currentBuyer.buyerGroup}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Addresses</h3>
                  <p className="text-xs text-slate-500">Registered, billing, and shipping addresses for buyer workflows.</p>
                </div>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => openAddressModal()}>
                  Add Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="No addresses"
                  description="Add a registered, billing, or shipping address for buyer records."
                  actionText="Add Address"
                  actionIcon={Plus}
                  onAction={() => openAddressModal()}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {addresses.map((address) => (
                    <Card key={address.id} className="border-slate-200" noPadding>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900">{address.label}</div>
                            <div className="mt-1 flex items-center gap-2">
                              <StatusBadge status={address.type} size="sm" />
                              {address.isDefault && <StatusBadge status="Default" size="sm" />}
                            </div>
                          </div>
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                          <div>{address.street}</div>
                          <div>{address.city}{address.province ? `, ${address.province}` : ''}</div>
                          <div>{address.country} {address.postalCode}</div>
                          <div className="pt-2 text-xs">
                            <div className="font-semibold text-slate-900">{address.contactName}</div>
                            <div>{address.phone}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="outline" size="xs" icon={Pencil} onClick={() => openAddressModal(address)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="xs" onClick={() => setDefaultAddress(address)}>
                            Set Default
                          </Button>
                          <Button variant="danger" size="xs" icon={Trash2} onClick={() => deleteAddress(address.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <Card
              title="Business Documents"
              subtitle="Buyer compliance documents and verification status."
              className="border-slate-200"
            >
              {currentBuyer.businessDocuments?.length ? (
                <DataTable columns={documentColumns} data={currentBuyer.businessDocuments} compact />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No business documents"
                  description="Compliance documents appear here after upload."
                />
              )}
            </Card>
          )}

          {activeTab === 'credit' && (
            <div className="space-y-6">
              <BuyerCreditSummary
                buyer={currentBuyer}
                outstandingInvoices={invoiceCreditSummary.outstanding}
                overdueAmount={invoiceCreditSummary.overdue}
              />
              <Card title="Credit Activity" subtitle="Frontend ledger for buyer credit movement." className="border-slate-200">
                {creditActivity.length ? (
                  <DataTable columns={creditColumns} data={creditActivity} compact />
                ) : (
                  <EmptyState
                    icon={CreditCard}
                    title="No credit activity"
                    description="PO approvals, invoice payments, and credit adjustments appear here."
                  />
                )}
              </Card>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(currentBuyer.accountTeam || []).map((member) => (
                <Card key={member.id} className="border-slate-200">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-slate-900">{member.name}</div>
                        <div className="mt-1 text-xs font-semibold text-blue-700">{member.role}</div>
                      </div>
                      <UserCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => showToast(`${member.role} contact action queued.`, 'info')}
                    >
                      Contact
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card title="Authentication" className="border-slate-200">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Change Password</div>
                      <p className="mt-1 text-xs text-slate-500">Update account access credentials for the buyer workspace.</p>
                    </div>
                    <Button variant="outline" size="sm" icon={Lock} onClick={() => setPasswordModalOpen(true)}>
                      Change
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Two-Factor Authentication</div>
                      <p className="mt-1 text-xs text-slate-500">Authenticator app confirmation required.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorEnabled((enabled) => !enabled)}
                      className={`relative h-7 w-12 rounded-full transition-colors ${
                        twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      aria-label="Toggle two-factor authentication"
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          twoFactorEnabled ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <ShieldCheck className="h-4 w-4" />
                      Account security status
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                      Verified buyer account, active sessions monitored, and two-factor authentication {twoFactorEnabled ? 'enabled' : 'disabled'}.
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Login Sessions" className="border-slate-200">
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'Phnom Penh, Cambodia', lastActive: 'Current session' },
                    { device: 'Safari on iPad', location: 'Phnom Penh, Cambodia', lastActive: '2026-08-17 06:10 PM' },
                    { device: 'Edge on Windows', location: 'Siem Reap, Cambodia', lastActive: '2026-08-15 11:35 AM' }
                  ].map((session) => (
                    <div key={session.device} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                      <div className="font-bold text-slate-900">{session.device}</div>
                      <div className="mt-1 text-xs text-slate-500">{session.location} / {session.lastActive}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Notification Preferences" className="border-slate-200 xl:col-span-2">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {['Invoice reminders', 'Shipment milestones', 'Credit utilization alerts'].map((preference) => (
                    <label
                      key={preference}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800"
                    >
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span>{preference}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddressId ? 'Edit Address' : 'Add Address'}
      >
        <div className="space-y-4">
          <Select
            label="Address Type"
            value={addressDraft.type}
            onChange={(event) => setAddressDraft((prev) => ({ ...prev, type: event.target.value }))}
            options={[
              { label: 'Registered Address', value: 'Registered' },
              { label: 'Billing Address', value: 'Billing' },
              { label: 'Shipping Address', value: 'Shipping' }
            ]}
          />
          <Input
            label="Label"
            value={addressDraft.label}
            onChange={(event) => setAddressDraft((prev) => ({ ...prev, label: event.target.value }))}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Contact Person"
              value={addressDraft.contactName}
              onChange={(event) => setAddressDraft((prev) => ({ ...prev, contactName: event.target.value }))}
            />
            <Input
              label="Phone"
              value={addressDraft.phone}
              onChange={(event) => setAddressDraft((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>
          <Input
            label="Street"
            value={addressDraft.street}
            onChange={(event) => setAddressDraft((prev) => ({ ...prev, street: event.target.value }))}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="City"
              value={addressDraft.city}
              onChange={(event) => setAddressDraft((prev) => ({ ...prev, city: event.target.value }))}
            />
            <Input
              label="Province"
              value={addressDraft.province}
              onChange={(event) => setAddressDraft((prev) => ({ ...prev, province: event.target.value }))}
            />
            <Input
              label="Country"
              value={addressDraft.country}
              onChange={(event) => setAddressDraft((prev) => ({ ...prev, country: event.target.value }))}
            />
            <Input
              label="Postal Code"
              value={addressDraft.postalCode}
              onChange={(event) => setAddressDraft((prev) => ({ ...prev, postalCode: event.target.value }))}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Check} onClick={saveAddress} disabled={!addressDraft.label || !addressDraft.street}>
              Save Address
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Lock}
              onClick={() => {
                setPasswordModalOpen(false);
                showToast('Password change request saved.', 'success');
              }}
            >
              Save Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
