import React, { useState } from 'react';
import { CheckCircle2, Edit, Save, ShieldCheck } from 'lucide-react';
import { Button, Card, Modal, PageHeader } from '../../components/ui';
import { useApp } from '../../context/AppContext';

interface RoleConfig {
  name: string;
  desc: string;
  usersCount: number;
  permissions: string[];
}

export const AdminRolesPage: React.FC = () => {
  const { showToast } = useApp();
  const [roles, setRoles] = useState<RoleConfig[]>([
    {
      name: 'Super Admin',
      desc: 'Full system root access across all modules, configuration settings, and database auditing.',
      usersCount: 2,
      permissions: ['Manage Users & Roles', 'Approve Buyers & Credit', 'Manage Catalog', 'Issue Quotations', 'Manage Invoices & Reconciliation', 'Logistics Dispatch']
    },
    {
      name: 'Sales Manager',
      desc: 'Manages commercial negotiations, RFQ review, custom tier pricing quotes, and customer accounts.',
      usersCount: 4,
      permissions: ['Approve Buyers (Tier Assignment)', 'Issue Quotations & Counter-Offers', 'Manage Master Contracts', 'View Inventory Stock']
    },
    {
      name: 'Warehouse Manager',
      desc: 'Responsible for physical fulfillment, bin management, cycle counts, stock adjustments, and carrier dispatch.',
      usersCount: 3,
      permissions: ['Manage Multi-Warehouse Inventory', 'Stock Level Adjustments', 'Fulfill Purchase Orders', 'Assign Freight Tracking & Waybills']
    },
    {
      name: 'Finance Officer',
      desc: 'Oversees accounts receivable (AR), tax invoicing, bank remittance verification, and revolving credit facilities.',
      usersCount: 2,
      permissions: ['Issue Tax Invoices', 'Reconcile Bank Transfers', 'Set Credit Limits', 'View Financial Reports']
    }
  ]);
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const permissionCatalog = [
    'Manage Users & Roles',
    'Approve Buyers & Credit',
    'Manage Catalog',
    'Issue Quotations',
    'Issue Quotations & Counter-Offers',
    'Manage Master Contracts',
    'View Inventory Stock',
    'Manage Multi-Warehouse Inventory',
    'Stock Level Adjustments',
    'Fulfill Purchase Orders',
    'Assign Freight Tracking & Waybills',
    'Issue Tax Invoices',
    'Reconcile Bank Transfers',
    'Set Credit Limits',
    'View Financial Reports',
    'Logistics Dispatch'
  ];

  const openRoleModal = (role: RoleConfig) => {
    setSelectedRole(role);
    setDraftPermissions(role.permissions);
  };

  const togglePermission = (permission: string) => {
    setDraftPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  };

  const saveRolePermissions = () => {
    if (!selectedRole) return;
    setRoles((current) =>
      current.map((role) =>
        role.name === selectedRole.name ? { ...role, permissions: draftPermissions } : role
      )
    );
    showToast(`${selectedRole.name} permissions updated.`, 'success');
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role-Based Access Control (RBAC) Permissions"
        subtitle="Define enterprise security boundaries and functional privileges across operational departments"
        breadcrumbs={[
          { label: 'System & Security', href: '/admin/dashboard' },
          { label: 'Roles & Permissions' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r, idx) => (
          <Card key={idx} className="p-6 border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                <span className="text-[11px] text-blue-600 font-semibold">{r.usersCount} Active Staff</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="xs" icon={Edit} onClick={() => openRoleModal(r)}>
                  Edit
                </Button>
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-700 block">
                Assigned Privileges:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                {r.permissions.map((p, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={Boolean(selectedRole)}
        onClose={() => setSelectedRole(null)}
        title={selectedRole ? `Edit Permissions: ${selectedRole.name}` : 'Edit Permissions'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-bold text-slate-900">{selectedRole?.name}</div>
            <p className="mt-1 text-sm text-slate-600">{selectedRole?.desc}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {permissionCatalog.map((permission) => {
              const checked = draftPermissions.includes(permission);
              return (
                <label
                  key={permission}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                    checked
                      ? 'border-blue-200 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePermission(permission)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold">{permission}</span>
                </label>
              );
            })}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setSelectedRole(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Save} onClick={saveRolePermissions}>
              Save Permissions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
