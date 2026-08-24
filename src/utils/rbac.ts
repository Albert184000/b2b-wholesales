import { UserRole } from '../types';

export type PermissionStatus = 'Active' | 'Inactive';
export type RoleStatus = 'Active' | 'Inactive';
export type RolePortal = 'admin' | 'buyer' | 'public' | 'internal';

export interface PermissionDefinition {
  key: string;
  name: string;
  module: string;
  description: string;
  status: PermissionStatus;
}

export interface PermissionModule {
  module: string;
  description: string;
  permissions: PermissionDefinition[];
}

export interface RoleDefinition {
  id: UserRole | string;
  name: string;
  description: string;
  status: RoleStatus;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  builtIn?: boolean;
  protectedRole?: boolean;
  clonedFrom?: string;
  portal: RolePortal;
  dashboardFocus: string[];
}

const permission = (
  key: string,
  name: string,
  module: string,
  description: string,
  status: PermissionStatus = 'Active'
): PermissionDefinition => ({ key, name, module, description, status });

export const permissionModules: PermissionModule[] = [
  {
    module: 'Buyer Management',
    description: 'Company accounts, buyer onboarding, verification, and account standing.',
    permissions: [
      permission('buyers.view', 'View buyers', 'Buyer Management', 'View buyer company records and account details.'),
      permission('buyers.create', 'Create buyers', 'Buyer Management', 'Create internal buyer records.'),
      permission('buyers.update', 'Update buyers', 'Buyer Management', 'Edit buyer profiles, groups, and account ownership.'),
      permission('buyers.approve', 'Approve buyers', 'Buyer Management', 'Approve verified buyer registrations.'),
      permission('buyers.reject', 'Reject buyers', 'Buyer Management', 'Reject buyer applications after review.'),
      permission('buyers.suspend', 'Suspend buyers', 'Buyer Management', 'Suspend or reinstate buyer access.')
    ]
  },
  {
    module: 'Product Management',
    description: 'Catalog records, category visibility, and sensitive product cost access.',
    permissions: [
      permission('products.view', 'View products', 'Product Management', 'View product catalog records in the admin portal.'),
      permission('products.create', 'Create products', 'Product Management', 'Create new product catalog records.'),
      permission('products.update', 'Update products', 'Product Management', 'Edit product content, pricing setup, and status.'),
      permission('products.delete', 'Delete products', 'Product Management', 'Archive or remove product records.'),
      permission('products.view_cost_price', 'View cost price', 'Product Management', 'View internal cost price and margin information.')
    ]
  },
  {
    module: 'Pricing',
    description: 'Wholesale tiers, buyer group pricing, and pricing approvals.',
    permissions: [
      permission('pricing.view', 'View pricing', 'Pricing', 'View wholesale price tiers and buyer group pricing.'),
      permission('pricing.create', 'Create pricing', 'Pricing', 'Create new pricing rules and tier schedules.'),
      permission('pricing.update', 'Update pricing', 'Pricing', 'Edit pricing rules and tier schedules.'),
      permission('pricing.approve', 'Approve pricing', 'Pricing', 'Approve commercial pricing exceptions.')
    ]
  },
  {
    module: 'RFQ',
    description: 'Request-for-quote intake, assignment, and staff follow-up.',
    permissions: [
      permission('rfqs.view', 'View RFQs', 'RFQ', 'View RFQ lists, details, and buyer requirements.'),
      permission('rfqs.create', 'Create RFQs', 'RFQ', 'Create RFQs on behalf of a buyer account.'),
      permission('rfqs.update', 'Update RFQs', 'RFQ', 'Edit RFQ status, notes, and internal handling.'),
      permission('rfqs.assign', 'Assign RFQs', 'RFQ', 'Assign RFQs to sales staff.')
    ]
  },
  {
    module: 'Quotations',
    description: 'Quote creation, approval, buyer acceptance, and negotiation workflow.',
    permissions: [
      permission('quotes.view', 'View quotations', 'Quotations', 'View quotation lists, details, and pricing summaries.'),
      permission('quotes.create', 'Create quotations', 'Quotations', 'Create quotations for buyer RFQs.'),
      permission('quotes.update', 'Update quotations', 'Quotations', 'Edit quotation details and negotiation status.'),
      permission('quotes.approve', 'Approve quotations', 'Quotations', 'Approve quotes requiring manager review.'),
      permission('quotes.accept', 'Accept quotations', 'Quotations', 'Mark accepted quotations and move toward purchase order creation.')
    ]
  },
  {
    module: 'Purchase Orders',
    description: 'Purchase order review, approval, fulfillment status, and buyer PO references.',
    permissions: [
      permission('purchase_orders.view', 'View purchase orders', 'Purchase Orders', 'View purchase order lists and details.'),
      permission('purchase_orders.create', 'Create purchase orders', 'Purchase Orders', 'Create purchase orders from approved quotes.'),
      permission('purchase_orders.approve', 'Approve purchase orders', 'Purchase Orders', 'Approve purchase orders requiring staff review.'),
      permission('purchase_orders.update', 'Update purchase orders', 'Purchase Orders', 'Edit purchase order status and internal handling.')
    ]
  },
  {
    module: 'Contracts',
    description: 'Master agreements, renewal status, milestones, and contract documents.',
    permissions: [
      permission('contracts.view', 'View contracts', 'Contracts', 'View contract lists, details, and documents.'),
      permission('contracts.create', 'Create contracts', 'Contracts', 'Create commercial contracts and agreements.'),
      permission('contracts.update', 'Update contracts', 'Contracts', 'Edit contract details, status, and milestones.'),
      permission('contracts.renew', 'Renew contracts', 'Contracts', 'Manage renewal requests and renewal outcomes.')
    ]
  },
  {
    module: 'Inventory',
    description: 'Warehouse stock levels, allocation decisions, and inventory adjustments.',
    permissions: [
      permission('inventory.view', 'View inventory', 'Inventory', 'View warehouse inventory, bins, and stock positions.'),
      permission('inventory.adjust', 'Adjust inventory', 'Inventory', 'Create stock adjustments and movement records.'),
      permission('inventory.allocate', 'Allocate inventory', 'Inventory', 'Allocate stock to purchase orders.')
    ]
  },
  {
    module: 'Finance',
    description: 'Invoices, payments, credit limits, and buyer financial controls.',
    permissions: [
      permission('invoices.view', 'View invoices', 'Finance', 'View invoice lists, details, and balances.'),
      permission('invoices.create', 'Create invoices', 'Finance', 'Create invoices for fulfilled orders.'),
      permission('payments.view', 'View payments', 'Finance', 'View payment records and reconciliation status.'),
      permission('payments.manage', 'Manage payments', 'Finance', 'Manage payment reconciliation and payment actions.'),
      permission('credit.view', 'View credit', 'Finance', 'View buyer credit limits and utilization.'),
      permission('credit.manage', 'Manage credit', 'Finance', 'Manage buyer credit limits, holds, and reviews.')
    ]
  },
  {
    module: 'Logistics',
    description: 'Shipments, carriers, tracking, and delivery status management.',
    permissions: [
      permission('shipments.view', 'View shipments', 'Logistics', 'View shipments, tracking, and delivery history.'),
      permission('shipments.create', 'Create shipments', 'Logistics', 'Create shipment records and dispatch plans.'),
      permission('shipments.update', 'Update shipments', 'Logistics', 'Edit shipment status, carrier, and tracking information.')
    ]
  },
  {
    module: 'Reports',
    description: 'Operational analytics for sales, buyers, contracts, and employee performance.',
    permissions: [
      permission('reports.sales', 'Sales reports', 'Reports', 'View revenue, quotation, and order performance reports.'),
      permission('reports.buyers', 'Buyer reports', 'Reports', 'View buyer lifecycle, segmentation, and activity reports.'),
      permission('reports.contracts', 'Contract reports', 'Reports', 'View contract value, renewal, and expiry reports.'),
      permission(
        'reports.employee_performance',
        'Employee performance',
        'Reports',
        'View sales staff workload, activity, and performance reports.'
      )
    ]
  },
  {
    module: 'System',
    description: 'Identity access management, system settings, permissions, and audit controls.',
    permissions: [
      permission('users.view', 'View users', 'System', 'View staff and account user records.'),
      permission('users.manage', 'Manage users', 'System', 'Invite, update, activate, and deactivate user accounts.'),
      permission('roles.view', 'View roles', 'System', 'View RBAC role definitions and assigned permissions.'),
      permission('roles.manage', 'Manage roles', 'System', 'Create, update, duplicate, deactivate, and delete custom roles.'),
      permission('permissions.view', 'View permissions', 'System', 'View permission catalog and assigned role usage.'),
      permission('permissions.manage', 'Manage permissions', 'System', 'Maintain permission metadata and assignment controls.'),
      permission('activity_logs.view', 'View activity logs', 'System', 'View staff and system audit logs.'),
      permission('settings.manage', 'Manage settings', 'System', 'Manage system-level settings and configuration.')
    ]
  }
];

export const permissionDefinitions = permissionModules.flatMap((module) => module.permissions);
export const permissionKeys = permissionDefinitions.map((item) => item.key);

export const roleDefinitions: RoleDefinition[] = [
  {
    id: 'ADMIN',
    name: 'Super Admin',
    description: 'Full system control across admin, security, catalog, sales, finance, logistics, and settings.',
    status: 'Active',
    createdAt: '2025-01-08',
    updatedAt: '2026-08-12',
    permissions: permissionKeys,
    builtIn: true,
    protectedRole: true,
    portal: 'admin',
    dashboardFocus: [
      'Full-system revenue, buyer, catalog, finance, inventory, logistics, and audit visibility.',
      'Can manage users, roles, permissions, activity logs, and system settings.'
    ]
  },
  {
    id: 'SALES_MANAGER',
    name: 'Sales Manager',
    description: 'Commercial team lead for buyer lifecycle, RFQs, quotes, negotiations, orders, contracts, and reports.',
    status: 'Active',
    createdAt: '2025-02-16',
    updatedAt: '2026-08-10',
    permissions: [
      'buyers.view',
      'buyers.create',
      'buyers.update',
      'buyers.approve',
      'buyers.reject',
      'buyers.suspend',
      'products.view',
      'pricing.view',
      'pricing.create',
      'pricing.update',
      'pricing.approve',
      'rfqs.view',
      'rfqs.update',
      'rfqs.assign',
      'quotes.view',
      'quotes.create',
      'quotes.update',
      'quotes.approve',
      'quotes.accept',
      'purchase_orders.view',
      'purchase_orders.approve',
      'purchase_orders.update',
      'contracts.view',
      'contracts.create',
      'contracts.update',
      'contracts.renew',
      'inventory.view',
      'invoices.view',
      'credit.view',
      'credit.manage',
      'shipments.view',
      'reports.sales',
      'reports.buyers',
      'reports.contracts',
      'reports.employee_performance'
    ],
    builtIn: true,
    portal: 'admin',
    dashboardFocus: [
      'Revenue, RFQs, quotes, negotiations, purchase orders, contracts, sales targets, and rep performance.',
      'Can approve buyer applications, quote exceptions, and commercial pricing decisions.'
    ]
  },
  {
    id: 'ACCOUNT_EXECUTIVE',
    name: 'Account Executive',
    description: 'Front-line sales owner for assigned buyers, RFQs, quotations, negotiations, POs, and follow-ups.',
    status: 'Active',
    createdAt: '2025-03-04',
    updatedAt: '2026-08-11',
    permissions: [
      'buyers.view',
      'buyers.update',
      'products.view',
      'pricing.view',
      'rfqs.view',
      'rfqs.create',
      'rfqs.update',
      'quotes.view',
      'quotes.create',
      'quotes.update',
      'purchase_orders.view',
      'purchase_orders.create',
      'purchase_orders.update',
      'contracts.view',
      'contracts.create',
      'contracts.update',
      'contracts.renew',
      'invoices.view',
      'shipments.view'
    ],
    builtIn: true,
    portal: 'admin',
    dashboardFocus: [
      'Assigned buyers, active RFQs, drafted quotes, negotiations, follow-up POs, contracts, and daily tasks.',
      'Cost pricing, system settings, and cross-team reports stay restricted.'
    ]
  },
  {
    id: 'VERIFIED_BUYER',
    name: 'Verified Buyer',
    description: 'Approved business buyer with access to the buyer portal, RFQs, quotes, POs, contracts, invoices, and shipments.',
    status: 'Active',
    createdAt: '2025-04-22',
    updatedAt: '2026-08-09',
    permissions: [],
    builtIn: true,
    portal: 'buyer',
    dashboardFocus: [
      'Buyer portal dashboard, product discovery, RFQs, quotes, purchase orders, invoices, and shipments.',
      'No access to admin routes or staff-only cost information.'
    ]
  },
  {
    id: 'GUEST',
    name: 'Guest Buyer',
    description: 'Public storefront visitor before business registration or buyer verification.',
    status: 'Active',
    createdAt: '2025-04-22',
    updatedAt: '2026-08-09',
    permissions: [],
    builtIn: true,
    portal: 'public',
    dashboardFocus: [
      'Public website only: catalog browsing, registration, login, and support pages.',
      'No buyer portal, admin portal, or authenticated commerce actions.'
    ]
  },
  {
    id: 'Warehouse Manager',
    name: 'Warehouse Manager',
    description: 'Internal operations role for warehouse, stock movement, allocation, and shipment workflows.',
    status: 'Active',
    createdAt: '2025-06-10',
    updatedAt: '2026-07-28',
    permissions: [
      'products.view',
      'purchase_orders.view',
      'purchase_orders.update',
      'inventory.view',
      'inventory.adjust',
      'inventory.allocate',
      'shipments.view',
      'shipments.create',
      'shipments.update'
    ],
    builtIn: true,
    portal: 'internal',
    dashboardFocus: [
      'Warehouses, stock movement, allocations, backorders, carrier dispatch, and shipment status.',
      'Commercial pricing, buyer approvals, finance, and system controls stay hidden.'
    ]
  },
  {
    id: 'Finance Officer',
    name: 'Finance Officer',
    description: 'Internal finance role for invoices, payments, credit limits, and financial follow-up.',
    status: 'Active',
    createdAt: '2025-06-18',
    updatedAt: '2026-07-30',
    permissions: [
      'buyers.view',
      'purchase_orders.view',
      'contracts.view',
      'invoices.view',
      'invoices.create',
      'payments.view',
      'payments.manage',
      'credit.view',
      'credit.manage',
      'reports.sales'
    ],
    builtIn: true,
    portal: 'internal',
    dashboardFocus: [
      'Invoices, payments, credit utilization, overdue balances, and revenue reporting.',
      'No catalog editing, inventory adjustments, or role management permissions.'
    ]
  }
];

const roleAliases: Record<string, string> = {
  ADMIN: 'ADMIN',
  'Super Admin': 'ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  'Sales Manager': 'SALES_MANAGER',
  ACCOUNT_EXECUTIVE: 'ACCOUNT_EXECUTIVE',
  'Account Executive': 'ACCOUNT_EXECUTIVE',
  VERIFIED_BUYER: 'VERIFIED_BUYER',
  'Verified Buyer': 'VERIFIED_BUYER',
  GUEST: 'GUEST',
  'Guest Buyer': 'GUEST',
  'Warehouse Manager': 'Warehouse Manager',
  'Finance Officer': 'Finance Officer'
};

export const primaryRoleIds: UserRole[] = ['ADMIN', 'SALES_MANAGER', 'ACCOUNT_EXECUTIVE', 'VERIFIED_BUYER', 'GUEST'];

export const normalizeRoleId = (role?: UserRole | string | null) => {
  if (!role) return 'GUEST';
  return roleAliases[String(role)] || String(role);
};

export const getRoleDefinition = (
  role?: UserRole | string | null,
  availableRoles: RoleDefinition[] = roleDefinitions
): RoleDefinition => {
  const normalized = normalizeRoleId(role);
  const foundRole = availableRoles.find((item) => normalizeRoleId(item.id) === normalized || String(item.id) === String(role));

  if (foundRole) return foundRole;

  return {
    id: normalized,
    name: String(role || 'Custom Role'),
    description: 'Custom demo role with permissions managed from the local role management screen.',
    status: 'Active',
    createdAt: '2026-08-24',
    updatedAt: '2026-08-24',
    permissions: [],
    portal: 'internal',
    dashboardFocus: ['Custom roles need explicit permissions before they can access admin modules.']
  };
};

export const getRoleDisplayName = (role?: UserRole | string | null, availableRoles?: RoleDefinition[]) =>
  getRoleDefinition(role, availableRoles).name;

export const getRolePermissions = (role?: UserRole | string | null, availableRoles?: RoleDefinition[]) =>
  getRoleDefinition(role, availableRoles).permissions;

export const getRolePermissionCount = (role?: UserRole | string | null, availableRoles?: RoleDefinition[]) =>
  getRolePermissions(role, availableRoles).length;

export const hasPermission = (role: UserRole | string | null | undefined, permissionKey: string) =>
  getRolePermissions(role).includes(permissionKey);

export const hasAnyPermission = (role: UserRole | string | null | undefined, permissions: string[]) => {
  const currentPermissions = getRolePermissions(role);
  return permissions.some((permissionKey) => currentPermissions.includes(permissionKey));
};

export const hasAllPermissions = (role: UserRole | string | null | undefined, permissions: string[]) => {
  const currentPermissions = getRolePermissions(role);
  return permissions.every((permissionKey) => currentPermissions.includes(permissionKey));
};

export const canAccessAdminPortal = (role?: UserRole | string | null) => {
  const roleDefinition = getRoleDefinition(role);
  return roleDefinition.portal === 'admin' || roleDefinition.portal === 'internal';
};

export const canAccessBuyerPortal = (role?: UserRole | string | null) => normalizeRoleId(role) === 'VERIFIED_BUYER';

export const canAccessPublicPortal = () => true;

export const getPermissionDefinition = (permissionKey: string) =>
  permissionDefinitions.find((item) => item.key === permissionKey);

export const getPermissionModule = (permissionKey: string) =>
  permissionModules.find((module) => module.permissions.some((permissionItem) => permissionItem.key === permissionKey));

export const getPermissionsByModule = (moduleName: string) =>
  permissionDefinitions.filter((permissionItem) => permissionItem.module === moduleName);

export const getAssignedRolesForPermission = (permissionKey: string, roles: RoleDefinition[] = roleDefinitions) =>
  roles.filter((role) => role.permissions.includes(permissionKey));

export const isPermissionKeyFormatValid = (permissionKey: string) => /^[a-z_]+(\.[a-z_]+)+$/.test(permissionKey);

export const isProtectedRole = (role?: UserRole | string | null) => getRoleDefinition(role).protectedRole === true;

export const isPrimaryRole = (role?: UserRole | string | null) =>
  primaryRoleIds.includes(normalizeRoleId(role) as UserRole);

interface RouteRequirement {
  all?: string[];
  any?: string[];
}

const routeRequirement = (pathname: string, search = ''): RouteRequirement | null => {
  const query = new URLSearchParams(search);
  const tab = query.get('tab');

  if (pathname === '/admin' || pathname === '/admin/dashboard') return null;
  if (pathname.startsWith('/admin/buyers')) return { all: ['buyers.view'] };
  if (pathname.startsWith('/admin/approvals')) return { all: ['buyers.approve'] };
  if (pathname.startsWith('/admin/buyer-groups')) return { all: ['buyers.update'] };
  if (pathname === '/admin/products/new') return { all: ['products.create'] };
  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) return { all: ['products.update'] };
  if (pathname.startsWith('/admin/products')) {
    if (tab === 'pricing') return { all: ['pricing.view'] };
    return { all: ['products.view'] };
  }
  if (pathname.startsWith('/admin/categories')) return { all: ['products.view'] };
  if (pathname.startsWith('/admin/pricing')) return { all: ['pricing.view'] };
  if (pathname.startsWith('/admin/rfqs')) return { all: ['rfqs.view'] };
  if (pathname.startsWith('/admin/quotes')) return { all: ['quotes.view'] };
  if (pathname.startsWith('/admin/purchase-orders')) return { all: ['purchase_orders.view'] };
  if (pathname.startsWith('/admin/contracts')) return { all: ['contracts.view'] };
  if (pathname.startsWith('/admin/warehouses')) return { all: ['inventory.view'] };
  if (pathname.startsWith('/admin/inventory')) {
    if (tab === 'allocations') return { all: ['inventory.allocate'] };
    return { all: ['inventory.view'] };
  }
  if (pathname.startsWith('/admin/payments')) return { all: ['payments.view'] };
  if (pathname.startsWith('/admin/credit-notes')) return { all: ['invoices.view'] };
  if (pathname.startsWith('/admin/invoices')) {
    if (tab === 'payments') return { all: ['payments.view'] };
    return { all: ['invoices.view'] };
  }
  if (pathname.startsWith('/admin/credit')) return { all: ['credit.view'] };
  if (pathname.startsWith('/admin/shipments')) {
    if (tab === 'carriers') return { all: ['shipments.update'] };
    return { all: ['shipments.view'] };
  }
  if (pathname.startsWith('/admin/reports')) {
    if (tab === 'sales') return { any: ['reports.sales', 'reports.employee_performance'] };
    return { any: ['reports.sales', 'reports.buyers', 'reports.contracts', 'reports.employee_performance'] };
  }
  if (pathname.startsWith('/admin/users')) return { all: ['users.view'] };
  if (pathname.startsWith('/admin/roles')) return { all: ['roles.view'] };
  if (pathname.startsWith('/admin/permissions')) return { all: ['permissions.view'] };
  if (pathname.startsWith('/admin/activity-logs')) return { all: ['activity_logs.view'] };
  if (pathname.startsWith('/admin/settings')) return { all: ['settings.manage'] };

  return { any: permissionKeys };
};

export const canAccessAdminPath = (role: UserRole | string | null | undefined, pathname: string, search = '') => {
  if (!canAccessAdminPortal(role)) return false;

  const requirement = routeRequirement(pathname, search);
  if (!requirement) return true;
  if (requirement.all && !hasAllPermissions(role, requirement.all)) return false;
  if (requirement.any && !hasAnyPermission(role, requirement.any)) return false;

  return true;
};
