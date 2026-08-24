import React, { useMemo, useState } from 'react';
import {
  Copy,
  Edit,
  Eye,
  KeyRound,
  Plus,
  Save,
  ShieldCheck,
  ShieldOff,
  Trash2,
  XCircle
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import { mockUsers } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  RoleDefinition,
  getAssignedRolesForPermission,
  isPermissionKeyFormatValid,
  normalizeRoleId,
  permissionModules,
  permissionDefinitions
} from '../../utils/rbac';

type RoleModalMode = 'view' | 'create' | 'edit' | 'duplicate';

type ManagedRole = RoleDefinition & {
  clonedFrom?: string;
};

type RoleForm = {
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  permissions: string[];
};

type RoleFormErrors = {
  name?: string;
  permissions?: string;
};

type PendingRoleAction = {
  role: ManagedRole;
  action: 'activate' | 'deactivate' | 'delete';
};

const buildRoleForm = (role?: ManagedRole, mode: RoleModalMode = 'create'): RoleForm => ({
  name: role ? (mode === 'duplicate' ? `${role.name} Copy` : role.name) : '',
  description: role?.description || '',
  status: role?.status || 'Active',
  permissions: role ? [...role.permissions] : []
});

const countUsersForRole = (role: ManagedRole) =>
  mockUsers.filter((user) => normalizeRoleId(user.role) === normalizeRoleId(role.id)).length;

export const AdminRolesPage: React.FC = () => {
  const { roles, setRoles, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortMode, setSortMode] = useState('updated-desc');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<RoleModalMode>('create');
  const [selectedRole, setSelectedRole] = useState<ManagedRole | null>(null);
  const [roleForm, setRoleForm] = useState<RoleForm>(buildRoleForm());
  const [formErrors, setFormErrors] = useState<RoleFormErrors>({});
  const [pendingAction, setPendingAction] = useState<PendingRoleAction | null>(null);

  const filteredRoles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return roles
      .filter((role) => {
        const matchesSearch =
          !normalizedSearch ||
          [role.name, role.description, role.portal, role.permissions.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesStatus = statusFilter === 'All' || role.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortMode === 'name-asc') return a.name.localeCompare(b.name);
        if (sortMode === 'name-desc') return b.name.localeCompare(a.name);
        if (sortMode === 'permissions-desc') return b.permissions.length - a.permissions.length;
        if (sortMode === 'users-desc') return countUsersForRole(b) - countUsersForRole(a);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [roles, searchTerm, sortMode, statusFilter]);

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setSelectedRole(null);
    setModalMode('create');
    setRoleForm(buildRoleForm());
    setFormErrors({});
  };

  const openRoleModal = (mode: RoleModalMode, role?: ManagedRole) => {
    setRoleModalOpen(true);
    setModalMode(mode);
    setSelectedRole(role || null);
    setRoleForm(buildRoleForm(role, mode));
    setFormErrors({});
  };

  const validateRoleForm = () => {
    const errors: RoleFormErrors = {};
    const trimmedName = roleForm.name.trim();
    const duplicate = roles.some((role) => {
      const isCurrentRole =
        selectedRole && modalMode === 'edit' && normalizeRoleId(role.id) === normalizeRoleId(selectedRole.id);
      return !isCurrentRole && role.name.toLowerCase() === trimmedName.toLowerCase();
    });
    const invalidKeys = roleForm.permissions.filter((key) => !isPermissionKeyFormatValid(key));

    if (!trimmedName) {
      errors.name = 'Role name is required.';
    } else if (duplicate) {
      errors.name = 'A role with this name already exists.';
    }

    if (invalidKeys.length > 0) {
      errors.permissions = 'One or more permission keys do not match the module.action format.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const togglePermission = (permissionKey: string) => {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permissionKey)
        ? current.permissions.filter((key) => key !== permissionKey)
        : [...current.permissions, permissionKey]
    }));
  };

  const setModulePermissions = (moduleName: string, selected: boolean) => {
    const modulePermissionKeys =
      permissionModules.find((module) => module.module === moduleName)?.permissions.map((permission) => permission.key) || [];

    setRoleForm((current) => {
      const permissionSet = new Set(current.permissions);
      modulePermissionKeys.forEach((permissionKey) => {
        if (selected) {
          permissionSet.add(permissionKey);
        } else {
          permissionSet.delete(permissionKey);
        }
      });

      return { ...current, permissions: Array.from(permissionSet) };
    });
  };

  const handleSaveRole = (event: React.FormEvent) => {
    event.preventDefault();
    if (modalMode === 'view') return;
    if (!validateRoleForm()) return;

    const today = new Date().toISOString().slice(0, 10);
    const trimmedName = roleForm.name.trim();

    if (modalMode === 'edit' && selectedRole) {
      setRoles((current) =>
        current.map((role) =>
          normalizeRoleId(role.id) === normalizeRoleId(selectedRole.id)
            ? {
                ...role,
                name: trimmedName,
                description: roleForm.description.trim(),
                status: roleForm.status,
                permissions: roleForm.permissions,
                updatedAt: today
              }
            : role
        )
      );
      showToast(`${trimmedName} updated.`, 'success');
      closeRoleModal();
      return;
    }

    const newRole: ManagedRole = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      description: roleForm.description.trim(),
      status: roleForm.status,
      createdAt: today,
      updatedAt: today,
      permissions: roleForm.permissions,
      builtIn: false,
      protectedRole: false,
      portal: 'internal',
      clonedFrom: modalMode === 'duplicate' ? selectedRole?.name : undefined,
      dashboardFocus: ['Custom role for controlled demo access to selected WholesaleHub modules.']
    };

    setRoles((current) => [newRole, ...current]);
    showToast(`${trimmedName} created with ${roleForm.permissions.length} permissions.`, 'success');
    closeRoleModal();
  };

  const applyPendingAction = () => {
    if (!pendingAction) return;

    const { role, action } = pendingAction;
    const today = new Date().toISOString().slice(0, 10);

    if (role.protectedRole && action !== 'activate') {
      showToast(`${role.name} is protected and cannot be changed by this demo action.`, 'warning');
      setPendingAction(null);
      return;
    }

    if (action === 'delete') {
      setRoles((current) => current.filter((item) => normalizeRoleId(item.id) !== normalizeRoleId(role.id)));
      showToast(`${role.name} deleted.`, 'success');
      setPendingAction(null);
      return;
    }

    const nextStatus = action === 'activate' ? 'Active' : 'Inactive';
    setRoles((current) =>
      current.map((item) =>
        normalizeRoleId(item.id) === normalizeRoleId(role.id) ? { ...item, status: nextStatus, updatedAt: today } : item
      )
    );
    showToast(`${role.name} ${nextStatus === 'Active' ? 'activated' : 'deactivated'}.`, 'success');
    setPendingAction(null);
  };

  const selectedPermissionCount = roleForm.permissions.length;
  const isProtectedEdit = modalMode === 'edit' && Boolean(selectedRole?.protectedRole);
  const isReadOnlyModal = modalMode === 'view' || isProtectedEdit;
  const modalTitle =
    modalMode === 'create'
      ? 'Create Role'
      : modalMode === 'duplicate'
      ? `Duplicate Role: ${selectedRole?.name}`
      : modalMode === 'edit'
      ? `Edit Role: ${selectedRole?.name}`
      : `Role Details: ${selectedRole?.name}`;

  const columns: Column<ManagedRole>[] = [
    {
      key: 'role',
      header: 'Role',
      accessor: (role) => (
        <div className="min-w-[220px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900">{role.name}</span>
            {role.protectedRole && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                Protected
              </span>
            )}
            {role.clonedFrom && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                Copy
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{role.description}</p>
        </div>
      )
    },
    {
      key: 'users',
      header: 'Users',
      align: 'right',
      accessor: (role) => <span className="font-mono font-bold text-slate-900">{countUsersForRole(role)}</span>
    },
    {
      key: 'permissions',
      header: 'Permissions',
      align: 'right',
      accessor: (role) => <span className="font-mono font-bold text-slate-900">{role.permissions.length}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (role) => <StatusBadge status={role.status} size="sm" />
    },
    {
      key: 'created',
      header: 'Created',
      accessor: (role) => <span className="whitespace-nowrap text-xs font-semibold text-slate-600">{role.createdAt}</span>
    },
    {
      key: 'updated',
      header: 'Updated',
      accessor: (role) => <span className="whitespace-nowrap text-xs font-semibold text-slate-600">{role.updatedAt}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: (role) => {
        const isProtected = role.protectedRole;
        const isBuiltIn = role.builtIn;
        const nextAction = role.status === 'Active' ? 'deactivate' : 'activate';

        return (
          <div className="flex min-w-[280px] flex-wrap justify-end gap-1.5">
            <Button variant="outline" size="xs" icon={Eye} onClick={() => openRoleModal('view', role)}>
              View
            </Button>
            <Button
              variant="outline"
              size="xs"
              icon={Edit}
              disabled={isProtected}
              title={isProtected ? 'Super Admin permissions are locked.' : undefined}
              onClick={() => openRoleModal('edit', role)}
            >
              Edit
            </Button>
            <Button variant="outline" size="xs" icon={Copy} onClick={() => openRoleModal('duplicate', role)}>
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="xs"
              icon={role.status === 'Active' ? ShieldOff : ShieldCheck}
              disabled={isProtected}
              onClick={() => setPendingAction({ role, action: nextAction })}
            >
              {role.status === 'Active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="danger"
              size="xs"
              icon={Trash2}
              disabled={isProtected || isBuiltIn}
              title={isBuiltIn ? 'Built-in roles cannot be deleted.' : undefined}
              onClick={() => setPendingAction({ role, action: 'delete' })}
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        subtitle="Create roles, review assigned users, and control grouped permissions across WholesaleHub modules."
        breadcrumbs={[
          { label: 'System', href: '/admin/dashboard' },
          { label: 'Roles' }
        ]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => openRoleModal('create')}>
            Create Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{roles.length}</div>
              <div className="text-xs font-semibold text-slate-500">Total roles</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{permissionDefinitions.length}</div>
              <div className="text-xs font-semibold text-slate-500">Permission keys</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {roles.filter((role) => role.status === 'Inactive').length}
              </div>
              <div className="text-xs font-semibold text-slate-500">Inactive roles</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px]">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search roles, descriptions, portals, or permission keys..."
          />
          <Select
            aria-label="Filter roles by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: 'All statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]}
          />
          <Select
            aria-label="Sort roles"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            options={[
              { label: 'Updated newest', value: 'updated-desc' },
              { label: 'Name A-Z', value: 'name-asc' },
              { label: 'Name Z-A', value: 'name-desc' },
              { label: 'Most permissions', value: 'permissions-desc' },
              { label: 'Most users', value: 'users-desc' }
            ]}
          />
        </div>

        {filteredRoles.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredRoles}
            keyExtractor={(role) => String(role.id)}
            enablePagination
            pageSize={6}
            emptyMessage="No roles match the current filters."
          />
        ) : (
          <EmptyState
            icon={ShieldOff}
            title="No roles found"
            description="Adjust your search or status filter to find a matching role."
            actionText="Create Role"
            actionIcon={Plus}
            onAction={() => openRoleModal('create')}
          />
        )}
      </Card>

      <Modal isOpen={roleModalOpen} onClose={closeRoleModal} title={modalTitle} size="full">
        <form onSubmit={handleSaveRole} className="space-y-5">
          {isProtectedEdit && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <div className="font-bold">Protected built-in role</div>
              <p className="mt-1 text-xs leading-5 text-blue-800">
                Super Admin keeps all permissions and cannot be edited, deactivated, or deleted in this demo.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <Input
              label="Role Name"
              required
              value={roleForm.name}
              error={formErrors.name}
              disabled={isReadOnlyModal}
              placeholder="e.g. Regional Sales Lead"
              onChange={(event) => {
                setRoleForm((current) => ({ ...current, name: event.target.value }));
                if (formErrors.name) setFormErrors((current) => ({ ...current, name: undefined }));
              }}
            />
            <Select
              label="Status"
              value={roleForm.status}
              disabled={isReadOnlyModal}
              onChange={(event) => setRoleForm((current) => ({ ...current, status: event.target.value as 'Active' | 'Inactive' }))}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' }
              ]}
            />
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{selectedPermissionCount}</div>
            </div>
          </div>

          <div>
            <label
              htmlFor="role-description"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Description
            </label>
            <textarea
              id="role-description"
              value={roleForm.description}
              disabled={isReadOnlyModal}
              placeholder="Describe what this role can do."
              onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Permission Matrix</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Select individual permissions or grant/clear an entire module.
                </p>
              </div>
              {!isReadOnlyModal && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      setRoleForm((current) => ({ ...current, permissions: permissionDefinitions.map((item) => item.key) }))
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setRoleForm((current) => ({ ...current, permissions: [] }))}
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
            {formErrors.permissions && <p className="mt-2 text-xs font-semibold text-rose-600">{formErrors.permissions}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {permissionModules.map((module) => {
              const moduleKeys = module.permissions.map((permissionItem) => permissionItem.key);
              const selectedInModule = moduleKeys.filter((key) => roleForm.permissions.includes(key)).length;
              const allModuleSelected = selectedInModule === moduleKeys.length;

              return (
                <section key={module.module} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{module.module}</h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{module.description}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusBadge status={`${selectedInModule}/${moduleKeys.length}`} size="sm" showDot={false} />
                      {!isReadOnlyModal && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setModulePermissions(module.module, true)}
                            disabled={allModuleSelected}
                          >
                            Select
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setModulePermissions(module.module, false)}
                            disabled={selectedInModule === 0}
                          >
                            Clear
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {module.permissions.map((permissionItem) => {
                      const checked = roleForm.permissions.includes(permissionItem.key);
                      const assignedRoles = getAssignedRolesForPermission(permissionItem.key, roles);

                      return (
                        <label
                          key={permissionItem.key}
                          className={`flex min-h-[92px] cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                            checked
                              ? 'border-blue-200 bg-blue-50 text-blue-950'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          } ${isReadOnlyModal ? 'cursor-default opacity-90' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isReadOnlyModal}
                            onChange={() => togglePermission(permissionItem.key)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                            aria-label={`${permissionItem.name} permission`}
                          />
                          <span className="min-w-0">
                            <span className="block font-bold">{permissionItem.name}</span>
                            <span className="mt-0.5 block font-mono text-[11px] text-slate-500">{permissionItem.key}</span>
                            <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                              Used by {assignedRoles.length} role{assignedRoles.length === 1 ? '' : 's'}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={closeRoleModal}>
              {modalMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {modalMode !== 'view' && !isProtectedEdit && (
              <Button type="submit" variant="primary" size="sm" icon={Save}>
                {modalMode === 'edit' ? 'Save Role' : 'Create Role'}
              </Button>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={applyPendingAction}
        title={
          pendingAction?.action === 'delete'
            ? 'Delete Role'
            : pendingAction?.action === 'deactivate'
            ? 'Deactivate Role'
            : 'Activate Role'
        }
        message={
          <span>
            {pendingAction?.action === 'delete'
              ? `Delete ${pendingAction.role.name}? Users currently assigned to this role should be reassigned before removal.`
              : `${pendingAction?.action === 'activate' ? 'Activate' : 'Deactivate'} ${
                  pendingAction?.role.name
                }? Sidebar access and actions will update for users assigned to this role.`}
          </span>
        }
        confirmText={
          pendingAction?.action === 'delete'
            ? 'Delete Role'
            : pendingAction?.action === 'deactivate'
            ? 'Deactivate'
            : 'Activate'
        }
        variant={pendingAction?.action === 'delete' || pendingAction?.action === 'deactivate' ? 'danger' : 'success'}
      />
    </div>
  );
};
