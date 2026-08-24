import React, { useMemo, useState } from 'react';
import { Edit, Eye, Plus, Save, ShieldCheck, ShieldOff, UserCheck, Users } from 'lucide-react';
import {
  Avatar,
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
import { User, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  RoleDefinition,
  canAccessAdminPortal,
  canAccessBuyerPortal,
  getRoleDefinition,
  getRoleDisplayName,
  getRolePermissions,
  normalizeRoleId,
  permissionModules
} from '../../utils/rbac';

type InviteErrors = {
  name?: string;
  email?: string;
  role?: string;
};

type UserModalMode = 'view' | 'edit';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getPortalSummary = (role: string, roles: RoleDefinition[]) => {
  const roleDefinition = getRoleDefinition(role, roles);

  if (roleDefinition.portal === 'admin' || roleDefinition.portal === 'internal' || canAccessAdminPortal(role)) {
    return 'Admin portal';
  }

  if (roleDefinition.portal === 'buyer' || canAccessBuyerPortal(role)) return 'Buyer portal';
  return 'Public only';
};

const getPermissionGroups = (role: string, roles: RoleDefinition[]) => {
  const permissionSet = new Set(getRolePermissions(role, roles));
  return permissionModules
    .map((module) => ({
      module: module.module,
      permissions: module.permissions.filter((permission) => permissionSet.has(permission.key))
    }))
    .filter((module) => module.permissions.length > 0);
};

const getRoleOptionLabel = (role: RoleDefinition) =>
  `${role.name} - ${role.permissions.length} permission${role.permissions.length === 1 ? '' : 's'}`;

export const AdminUsersPage: React.FC = () => {
  const { roles, showToast } = useApp();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<UserModalMode>('view');
  const [pendingStatusUser, setPendingStatusUser] = useState<User | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<string>('ACCOUNT_EXECUTIVE');
  const [inviteErrors, setInviteErrors] = useState<InviteErrors>({});
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [editRole, setEditRole] = useState<string>('ACCOUNT_EXECUTIVE');
  const [editStatus, setEditStatus] = useState('Active');

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const roleName = getRoleDisplayName(user.role, roles);
      const matchesSearch =
        !normalizedSearch ||
        [user.name, user.email, user.companyName, user.department, roleName, user.role]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesRole = roleFilter === 'All' || normalizeRoleId(user.role) === roleFilter;
      const matchesStatus = statusFilter === 'All' || (user.status || 'Active') === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, roles, searchTerm, statusFilter, users]);

  const resetInviteForm = () => {
    setNewName('');
    setNewEmail('');
    setNewRole('ACCOUNT_EXECUTIVE');
    setInviteErrors({});
    setIsSubmittingInvite(false);
  };

  const closeInviteModal = () => {
    setAddUserModalOpen(false);
    resetInviteForm();
  };

  const validateInvite = () => {
    const trimmedName = newName.trim();
    const normalizedEmail = newEmail.trim().toLowerCase();
    const nextErrors: InviteErrors = {};

    if (!trimmedName) {
      nextErrors.name = 'Full legal name is required.';
    }

    if (!normalizedEmail) {
      nextErrors.email = 'Corporate email address is required.';
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = 'Enter a valid corporate email address.';
    } else if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      nextErrors.email = 'A user account already exists for this email.';
    }

    if (!newRole) {
      nextErrors.role = 'Select an RBAC role.';
    }

    setInviteErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, trimmedName, normalizedEmail };
  };

  const handleAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateInvite();
    if (!validation.isValid || !newRole) return;

    setIsSubmittingInvite(true);

    const role = getRoleDefinition(newRole, roles);
    const newUser: User = {
      id: `usr-invite-${Date.now()}`,
      name: validation.trimmedName,
      email: validation.normalizedEmail,
      role: normalizeRoleId(newRole) as UserRole,
      department: role.name,
      companyName: 'WholesaleHub Global',
      status: 'Pending',
      lastActive: 'Invite pending'
    };

    setUsers((current) => [newUser, ...current]);
    showToast(`Invite created for ${validation.trimmedName} as ${role.name}.`, 'success');
    closeInviteModal();
  };

  const openUserModal = (mode: UserModalMode, user: User) => {
    setActiveUser(user);
    setUserModalMode(mode);
    setEditRole(normalizeRoleId(user.role));
    setEditStatus(user.status || 'Active');
  };

  const closeUserModal = () => {
    setActiveUser(null);
    setUserModalMode('view');
    setEditRole('ACCOUNT_EXECUTIVE');
    setEditStatus('Active');
  };

  const handleSaveRoleAssignment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeUser) return;

    const nextRole = normalizeRoleId(editRole) as UserRole;
    const nextRoleDefinition = getRoleDefinition(nextRole, roles);

    setUsers((current) =>
      current.map((user) =>
        user.id === activeUser.id
          ? {
              ...user,
              role: nextRole,
              department: nextRoleDefinition.name,
              status: editStatus
            }
          : user
      )
    );
    showToast(`${activeUser.name} updated to ${nextRoleDefinition.name}.`, 'success');
    closeUserModal();
  };

  const toggleUserStatus = () => {
    if (!pendingStatusUser) return;

    const currentStatus = pendingStatusUser.status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    setUsers((current) =>
      current.map((user) => (user.id === pendingStatusUser.id ? { ...user, status: nextStatus } : user))
    );
    showToast(`${pendingStatusUser.name} ${nextStatus === 'Active' ? 'activated' : 'deactivated'}.`, 'success');
    setPendingStatusUser(null);
  };

  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: String(role.id)
  }));
  const activeRoleDefinition = activeUser ? getRoleDefinition(activeUser.role, roles) : null;
  const editRoleDefinition = getRoleDefinition(editRole, roles);
  const currentPermissions = activeUser ? getRolePermissions(activeUser.role, roles) : [];
  const previewPermissions = getRolePermissions(editRole, roles);
  const gainedPermissions = previewPermissions.filter((permission) => !currentPermissions.includes(permission));
  const removedPermissions = currentPermissions.filter((permission) => !previewPermissions.includes(permission));
  const permissionGroups = getPermissionGroups(userModalMode === 'edit' ? editRole : activeUser?.role || 'GUEST', roles);

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      accessor: (user) => (
        <div className="flex min-w-[260px] items-center gap-3">
          <Avatar name={user.name} src={user.avatar} size="sm" status={(user.status || 'Active') === 'Active' ? 'online' : undefined} />
          <div className="min-w-0">
            <span className="block truncate font-bold text-slate-900">{user.name}</span>
            <span className="block truncate text-[11px] text-slate-500">{user.email}</span>
            {user.companyName && <span className="block truncate text-[11px] text-slate-400">{user.companyName}</span>}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Current Role',
      accessor: (user) => (
        <div className="min-w-[160px]">
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
            {getRoleDisplayName(user.role, roles)}
          </span>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">{getPortalSummary(user.role, roles)}</div>
        </div>
      )
    },
    {
      key: 'permissions',
      header: 'Effective Permissions',
      align: 'right',
      accessor: (user) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{getRolePermissions(user.role, roles).length}</div>
          <div className="text-[11px] text-slate-500">assigned</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (user) => <StatusBadge status={user.status || 'Active'} size="sm" />
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      accessor: (user) => <span className="whitespace-nowrap text-xs font-semibold text-slate-600">{user.lastActive || 'Not recorded'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: (user) => {
        const isActive = (user.status || 'Active') === 'Active';

        return (
          <div className="flex min-w-[250px] flex-wrap justify-end gap-1.5">
            <Button variant="outline" size="xs" icon={Eye} onClick={() => openUserModal('view', user)}>
              View
            </Button>
            <Button variant="outline" size="xs" icon={Edit} onClick={() => openUserModal('edit', user)}>
              Change Role
            </Button>
            <Button
              variant={isActive ? 'outline' : 'success'}
              size="xs"
              icon={isActive ? ShieldOff : ShieldCheck}
              onClick={() => setPendingStatusUser(user)}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Role Assignment"
        subtitle="Manage staff, buyer, and guest demo identities with clear role previews and effective permissions."
        breadcrumbs={[
          { label: 'System', href: '/admin/dashboard' },
          { label: 'Users' }
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              resetInviteForm();
              setAddUserModalOpen(true);
            }}
          >
            Invite User
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{users.length}</div>
              <div className="text-xs font-semibold text-slate-500">Total users</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {users.filter((user) => (user.status || 'Active') === 'Active').length}
              </div>
              <div className="text-xs font-semibold text-slate-500">Active accounts</div>
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
              <div className="text-xs font-semibold text-slate-500">Assignable roles</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name, email, company, department, or role..."
          />
          <Select
            aria-label="Filter users by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            options={[
              { label: 'All roles', value: 'All' },
              ...roleOptions
            ]}
          />
          <Select
            aria-label="Filter users by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { label: 'All statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Suspended', value: 'Suspended' }
            ]}
          />
        </div>

        {filteredUsers.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredUsers}
            keyExtractor={(user) => user.id}
            enablePagination
            pageSize={8}
            emptyMessage="No users match the current filters."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Adjust your role, status, or search filters to find a matching account."
            actionText="Invite User"
            actionIcon={Plus}
            onAction={() => setAddUserModalOpen(true)}
          />
        )}
      </Card>

      <Modal isOpen={addUserModalOpen} onClose={closeInviteModal} title="Invite User" size="lg">
        <form onSubmit={handleAddUser} noValidate className="space-y-4">
          <Input
            id="staff-invite-full-name"
            label="Full Legal Name"
            required
            placeholder="e.g. Sothea Meas"
            value={newName}
            error={inviteErrors.name}
            autoComplete="name"
            onChange={(event) => {
              setNewName(event.target.value);
              if (inviteErrors.name) setInviteErrors((current) => ({ ...current, name: undefined }));
            }}
          />
          <Input
            id="staff-invite-email"
            label="Corporate Email Address"
            type="email"
            required
            placeholder="e.g. sothea@wholesalehub.com"
            value={newEmail}
            error={inviteErrors.email}
            autoComplete="email"
            onChange={(event) => {
              setNewEmail(event.target.value);
              if (inviteErrors.email) setInviteErrors((current) => ({ ...current, email: undefined }));
            }}
          />
          <Select
            id="staff-invite-role"
            label="RBAC Role"
            required
            value={newRole}
            error={inviteErrors.role}
            onChange={(event) => {
              setNewRole(event.target.value);
              if (inviteErrors.role) setInviteErrors((current) => ({ ...current, role: undefined }));
            }}
            options={roles.map((role) => ({ label: getRoleOptionLabel(role), value: String(role.id) }))}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Invite Preview</div>
            <div className="mt-1 font-bold text-slate-900">{getRoleDisplayName(newRole, roles)}</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {getPortalSummary(newRole, roles)} access with {getRolePermissions(newRole, roles).length} permission keys.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={closeInviteModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingInvite}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(activeUser)}
        onClose={closeUserModal}
        title={activeUser ? `${userModalMode === 'view' ? 'User Details' : 'Change Role'}: ${activeUser.name}` : 'User Details'}
        size="xl"
      >
        {activeUser && activeRoleDefinition && (
          <form onSubmit={handleSaveRoleAssignment} className="space-y-5">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={activeUser.name} src={activeUser.avatar} size="lg" status={(activeUser.status || 'Active') === 'Active' ? 'online' : undefined} />
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900">{activeUser.name}</div>
                  <div className="text-sm text-slate-500">{activeUser.email}</div>
                  <div className="text-xs text-slate-400">{activeUser.companyName || 'WholesaleHub Global'}</div>
                </div>
              </div>
              <StatusBadge status={activeUser.status || 'Active'} size="sm" />
            </div>

            {userModalMode === 'edit' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Assign Role"
                  value={editRole}
                  onChange={(event) => setEditRole(event.target.value)}
                  options={roles.map((role) => ({ label: getRoleOptionLabel(role), value: String(role.id) }))}
                />
                <Select
                  label="Account Status"
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value)}
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' },
                    { label: 'Suspended', value: 'Suspended' }
                  ]}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Current Role</div>
                <div className="mt-1 font-bold text-slate-900">{activeRoleDefinition.name}</div>
                <div className="mt-1 text-xs text-slate-500">{getPortalSummary(activeUser.role, roles)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {userModalMode === 'edit' ? 'New Role' : 'Permission Count'}
                </div>
                <div className="mt-1 font-bold text-slate-900">
                  {userModalMode === 'edit' ? editRoleDefinition.name : `${currentPermissions.length} permissions`}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {userModalMode === 'edit' ? getPortalSummary(editRole, roles) : 'Effective from assigned role'}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Access Impact</div>
                <div className="mt-1 font-mono text-lg font-extrabold text-slate-900">
                  {userModalMode === 'edit' ? `${previewPermissions.length}` : `${currentPermissions.length}`}
                </div>
                <div className="mt-1 text-xs text-slate-500">permission keys after save</div>
              </div>
            </div>

            {userModalMode === 'edit' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Permissions Added</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {gainedPermissions.slice(0, 10).map((permission) => (
                      <span key={permission} className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
                        {permission}
                      </span>
                    ))}
                    {gainedPermissions.length === 0 && <span className="text-xs font-semibold text-emerald-700">No new keys</span>}
                    {gainedPermissions.length > 10 && <span className="text-xs font-semibold text-emerald-700">+{gainedPermissions.length - 10} more</span>}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-rose-700">Permissions Removed</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {removedPermissions.slice(0, 10).map((permission) => (
                      <span key={permission} className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700">
                        {permission}
                      </span>
                    ))}
                    {removedPermissions.length === 0 && <span className="text-xs font-semibold text-rose-700">No removed keys</span>}
                    {removedPermissions.length > 10 && (
                      <span className="text-xs font-semibold text-rose-700">+{removedPermissions.length - 10} more</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Permission Summary</div>
                  <p className="mt-1 text-xs text-slate-500">
                    Grouped by module for {userModalMode === 'edit' ? editRoleDefinition.name : activeRoleDefinition.name}.
                  </p>
                </div>
                <StatusBadge status={`${permissionGroups.length} modules`} size="sm" showDot={false} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {permissionGroups.map((group) => (
                  <div key={group.module} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-slate-900">{group.module}</div>
                      <span className="font-mono text-xs font-bold text-slate-500">{group.permissions.length}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {group.permissions.slice(0, 6).map((permission) => (
                        <span key={permission.key} className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-slate-600">
                          {permission.key}
                        </span>
                      ))}
                      {group.permissions.length > 6 && (
                        <span className="text-[11px] font-semibold text-slate-500">+{group.permissions.length - 6} more</span>
                      )}
                    </div>
                  </div>
                ))}
                {permissionGroups.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                    This role has no admin permission keys.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={closeUserModal}>
                {userModalMode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {userModalMode === 'view' ? (
                <Button type="button" variant="primary" size="sm" icon={Edit} onClick={() => openUserModal('edit', activeUser)}>
                  Change Role
                </Button>
              ) : (
                <Button type="submit" variant="primary" size="sm" icon={Save}>
                  Save Assignment
                </Button>
              )}
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingStatusUser)}
        onClose={() => setPendingStatusUser(null)}
        onConfirm={toggleUserStatus}
        title={(pendingStatusUser?.status || 'Active') === 'Active' ? 'Deactivate User' : 'Activate User'}
        message={
          <span>
            {(pendingStatusUser?.status || 'Active') === 'Active'
              ? `Deactivate ${pendingStatusUser?.name}? Their demo account will remain listed but inactive.`
              : `Activate ${pendingStatusUser?.name}? Their assigned role access will be restored.`}
          </span>
        }
        confirmText={(pendingStatusUser?.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}
        variant={(pendingStatusUser?.status || 'Active') === 'Active' ? 'danger' : 'success'}
      />
    </div>
  );
};
