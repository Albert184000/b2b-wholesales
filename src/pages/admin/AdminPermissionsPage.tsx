import React, { useMemo, useState } from 'react';
import { Eye, KeyRound, Layers, ShieldCheck, Users } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  EmptyState,
  Modal,
  PageHeader,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import {
  PermissionDefinition,
  getAssignedRolesForPermission,
  permissionDefinitions,
  permissionModules
} from '../../utils/rbac';
import { useApp } from '../../context/AppContext';

export const AdminPermissionsPage: React.FC = () => {
  const { roles } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPermission, setSelectedPermission] = useState<PermissionDefinition | null>(null);

  const filteredPermissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return permissionDefinitions.filter((permission) => {
      const assignedRoles = getAssignedRolesForPermission(permission.key, roles);
      const matchesSearch =
        !normalizedSearch ||
        [permission.key, permission.name, permission.module, permission.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesModule = moduleFilter === 'All' || permission.module === moduleFilter;
      const matchesRole = roleFilter === 'All' || assignedRoles.some((role) => String(role.id) === roleFilter);
      const matchesStatus = statusFilter === 'All' || permission.status === statusFilter;

      return matchesSearch && matchesModule && matchesRole && matchesStatus;
    });
  }, [moduleFilter, roleFilter, roles, searchTerm, statusFilter]);

  const columns: Column<PermissionDefinition>[] = [
    {
      key: 'permission',
      header: 'Permission',
      accessor: (permission) => (
        <div className="min-w-[260px]">
          <div className="font-bold text-slate-900">{permission.name}</div>
          <div className="mt-1 font-mono text-xs text-slate-500">{permission.key}</div>
        </div>
      )
    },
    {
      key: 'module',
      header: 'Module',
      accessor: (permission) => (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
          {permission.module}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (permission) => <p className="min-w-[260px] text-xs leading-5 text-slate-600">{permission.description}</p>
    },
    {
      key: 'roles',
      header: 'Assigned Roles',
      accessor: (permission) => {
        const assignedRoles = getAssignedRolesForPermission(permission.key, roles);
        const visibleRoles = assignedRoles.slice(0, 3);
        const remaining = assignedRoles.length - visibleRoles.length;

        return (
          <div className="flex min-w-[220px] flex-wrap gap-1.5">
            {visibleRoles.map((role) => (
              <span
                key={String(role.id)}
                className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700"
              >
                {role.name}
              </span>
            ))}
            {remaining > 0 && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                +{remaining}
              </span>
            )}
            {assignedRoles.length === 0 && <span className="text-xs font-semibold text-slate-400">No roles</span>}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (permission) => <StatusBadge status={permission.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: (permission) => (
        <div className="flex justify-end">
          <Button variant="outline" size="xs" icon={Eye} onClick={() => setSelectedPermission(permission)}>
            Details
          </Button>
        </div>
      )
    }
  ];

  const selectedAssignedRoles = selectedPermission ? getAssignedRolesForPermission(selectedPermission.key, roles) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permission Management"
        subtitle="Audit every permission key, module assignment, role usage, and status in the mock RBAC catalog."
        breadcrumbs={[
          { label: 'System', href: '/admin/dashboard' },
          { label: 'Permissions' }
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{permissionDefinitions.length}</div>
              <div className="text-xs font-semibold text-slate-500">Permissions</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{permissionModules.length}</div>
              <div className="text-xs font-semibold text-slate-500">Modules</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{roles.length}</div>
              <div className="text-xs font-semibold text-slate-500">Roles</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {permissionDefinitions.filter((permission) => getAssignedRolesForPermission(permission.key, roles).length > 0).length}
              </div>
              <div className="text-xs font-semibold text-slate-500">Assigned keys</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_190px_190px_160px]">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search permission key, friendly name, module, or description..."
          />
          <Select
            aria-label="Filter permissions by module"
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            options={[
              { label: 'All modules', value: 'All' },
              ...permissionModules.map((module) => ({ label: module.module, value: module.module }))
            ]}
          />
          <Select
            aria-label="Filter permissions by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            options={[
              { label: 'All roles', value: 'All' },
              ...roles.map((role) => ({ label: role.name, value: String(role.id) }))
            ]}
          />
          <Select
            aria-label="Filter permissions by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: 'All statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]}
          />
        </div>

        {filteredPermissions.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredPermissions}
            keyExtractor={(permission) => permission.key}
            enablePagination
            pageSize={10}
            emptyMessage="No permission keys match the current filters."
          />
        ) : (
          <EmptyState
            icon={KeyRound}
            title="No permissions found"
            description="Try clearing one of the module, role, status, or search filters."
          />
        )}
      </Card>

      <Modal
        isOpen={Boolean(selectedPermission)}
        onClose={() => setSelectedPermission(null)}
        title={selectedPermission ? selectedPermission.name : 'Permission Details'}
        subtitle={selectedPermission?.key}
        size="lg"
      >
        {selectedPermission && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Module</div>
                <div className="mt-1 font-bold text-slate-900">{selectedPermission.module}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</div>
                <div className="mt-2">
                  <StatusBadge status={selectedPermission.status} size="sm" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Assigned Roles</div>
                <div className="mt-1 font-mono text-lg font-extrabold text-slate-900">{selectedAssignedRoles.length}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Description</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedPermission.description}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Roles using this permission</div>
                  <p className="mt-1 text-xs text-slate-500">These built-in roles include the selected permission key.</p>
                </div>
                <StatusBadge status={`${selectedAssignedRoles.length} roles`} size="sm" showDot={false} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {selectedAssignedRoles.map((role) => (
                  <div key={String(role.id)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="font-bold text-slate-900">{role.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{role.permissions.length} permissions assigned</div>
                  </div>
                ))}
                {selectedAssignedRoles.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                    No roles currently use this permission.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
