import React, { useState } from 'react';
import { Users, Plus, Edit, Save } from 'lucide-react';
import {
  Button,
  DataTable,
  Column,
  StatusBadge,
  PageHeader,
  SearchBar,
  Card,
  Modal,
  Input,
  Select
} from '../../components/ui';
import { mockUsers } from '../../data/mockData';
import { User, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useApp();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Sales Manager');
  const [editRole, setEditRole] = useState<UserRole>('Sales Manager');
  const [editStatus, setEditStatus] = useState('Active');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `usr-00${users.length + 1}`,
      name: newName,
      email: newEmail,
      role: newRole,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    };
    setUsers([...users, newUser]);
    setAddUserModalOpen(false);
    showToast(`Staff account created for ${newName} with role ${newRole}`, 'success');
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status || 'Active');
  };

  const handleSavePermissions = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === editingUser.id ? { ...user, role: editRole, status: editStatus } : user
      )
    );
    showToast(`${editingUser.name} permissions updated.`, 'success');
    setEditingUser(null);
  };

  const columns: Column<User>[] = [
    {
      header: 'Staff Member',
      accessor: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar}
            alt={u.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="font-bold text-slate-900 block">{u.name}</span>
            <span className="text-[11px] text-slate-400">{u.email}</span>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: 'System RBAC Role',
      accessor: (u) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {u.role}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Status',
      accessor: (u) => <StatusBadge status={u.status || 'Active'} />
    },
    {
      header: 'Actions',
      accessor: (u) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="xs"
            icon={Edit}
            onClick={() => openEditModal(u)}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internal Staff & Identity Access (IAM)"
        subtitle="Manage enterprise back-office employees, role assignments, and authentication permissions"
        breadcrumbs={[
          { label: 'System & Security', href: '/admin/dashboard' },
          { label: 'Staff Accounts' }
        ]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddUserModalOpen(true)}>
            Invite Staff Member
          </Button>
        }
      />

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search staff by name, email, or role..."
          />
        </div>

        <DataTable columns={columns} data={filteredUsers} />
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        title="Invite New Enterprise Staff Member"
      >
        <form onSubmit={handleAddUser} className="space-y-4 text-xs">
          <Input
            label="Full Legal Name"
            required
            placeholder="e.g. Sothea Meas"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Corporate Email Address"
            type="email"
            required
            placeholder="e.g. sothea@wholesalehub.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Select
            label="Assign RBAC Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            options={[
              { label: 'Super Admin', value: 'Super Admin' },
              { label: 'Sales Manager', value: 'Sales Manager' },
              { label: 'Warehouse Manager', value: 'Warehouse Manager' },
              { label: 'Finance Officer', value: 'Finance Officer' }
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send Staff Invite
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={editingUser ? `Edit Access: ${editingUser.name}` : 'Edit Access'}
      >
        <form onSubmit={handleSavePermissions} className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-bold text-slate-900">{editingUser?.name}</div>
            <div className="text-sm text-slate-500">{editingUser?.email}</div>
          </div>
          <Select
            label="RBAC Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as UserRole)}
            options={[
              { label: 'Super Admin', value: 'Super Admin' },
              { label: 'Sales Manager', value: 'Sales Manager' },
              { label: 'Warehouse Manager', value: 'Warehouse Manager' },
              { label: 'Finance Officer', value: 'Finance Officer' }
            ]}
          />
          <Select
            label="Account Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Suspended', value: 'Suspended' }
            ]}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div className="font-bold text-slate-900">Permission Preview</div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
              {[
                'Dashboard access',
                'Buyer records',
                editRole === 'Warehouse Manager' ? 'Inventory adjustment' : 'Commercial records',
                editRole === 'Finance Officer' ? 'Invoice reconciliation' : 'Reports access'
              ].map((permission) => (
                <div key={permission} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  {permission}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Access
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
