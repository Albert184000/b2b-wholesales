import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  DollarSign,
  Edit,
  Eye,
  Layers,
  LockKeyhole,
  Package,
  Plus,
  Save,
  Trash2,
  Warehouse
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  FilterBar,
  Input,
  KPICard,
  Modal,
  PageHeader,
  SearchBar,
  StatusBadge,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { mockCategories } from '../../data/mockData';
import { Product, ProductCategory } from '../../types';
import { formatCurrency, formatTierRange, getBestTier } from '../../utils/pricing';
import { hasPermission } from '../../utils/rbac';

const getStockStatus = (product: Product) => {
  if (product.availableStock <= 0) return 'Out of Stock';
  if (product.availableStock <= product.reorderPoint) return 'Low Stock';
  return 'In Stock';
};

const tabOptions = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'pricing', label: 'Tier Pricing' }
];

type CategoryDraft = Pick<ProductCategory, 'name' | 'slug' | 'description' | 'iconName'>;
type CategoryRow = ProductCategory & {
  activeCount: number;
  lowStockCount: number;
  status: string;
};

const defaultCategoryDraft: CategoryDraft = {
  name: '',
  slug: '',
  description: '',
  iconName: 'layers'
};

const buildSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const AdminProductsPage: React.FC = () => {
  const { currentUser, products, inventory, updateProductStatus, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [inactiveCategoryIds, setInactiveCategoryIds] = useState<string[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(defaultCategoryDraft);

  const lowStockCount = products.filter((product) => getStockStatus(product) === 'Low Stock').length;
  const outOfStockCount = products.filter((product) => getStockStatus(product) === 'Out of Stock').length;
  const inventoryValue = inventory.reduce((sum, item) => sum + item.available * item.unitCost, 0);
  const canViewCostPrice = hasPermission(currentUser.role, 'products.view_cost_price');
  const canCreateProducts = hasPermission(currentUser.role, 'products.create');
  const canUpdateProducts = hasPermission(currentUser.role, 'products.update');
  const canDeleteProducts = hasPermission(currentUser.role, 'products.delete');

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      const matchCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
      const matchStatus = statusFilter === 'ALL' || product.status === statusFilter;
      const matchStock = stockFilter === 'ALL' || getStockStatus(product) === stockFilter;

      return matchSearch && matchCategory && matchStatus && matchStock;
    });
  }, [products, searchTerm, selectedCategory, statusFilter, stockFilter]);

  const categoryRows = useMemo(
    () =>
      categories.map((category) => {
        const categoryProducts = products.filter((product) => product.category === category.name);
        const activeProducts = categoryProducts.filter((product) => product.status === 'Active');
        const lowStockProducts = categoryProducts.filter((product) => getStockStatus(product) !== 'In Stock');

        return {
          ...category,
          itemCount: categoryProducts.length,
          activeCount: activeProducts.length,
          lowStockCount: lowStockProducts.length,
          status: inactiveCategoryIds.includes(category.id) ? 'Inactive' : 'Active'
        };
      }),
    [categories, inactiveCategoryIds, products]
  );

  const handleToggleStatus = (product: Product) => {
    const nextStatus = product.status === 'Archived' ? 'Active' : 'Archived';
    updateProductStatus(product.id, nextStatus);
    showToast(`${product.sku} ${nextStatus === 'Active' ? 'reactivated' : 'deactivated'} in admin catalog.`, nextStatus === 'Active' ? 'success' : 'warning');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setStatusFilter('ALL');
    setStockFilter('ALL');
  };

  const openCategoryModal = (category?: ProductCategory) => {
    if (category) {
      setEditingCategoryId(category.id);
      setCategoryDraft({
        name: category.name,
        slug: category.slug,
        description: category.description,
        iconName: category.iconName || 'layers'
      });
    } else {
      setEditingCategoryId(null);
      setCategoryDraft(defaultCategoryDraft);
    }
    setCategoryModalOpen(true);
  };

  const saveCategory = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = categoryDraft.name.trim();
    if (!trimmedName) {
      showToast('Category name is required.', 'error');
      return;
    }

    const normalizedSlug = categoryDraft.slug.trim() || buildSlug(trimmedName);
    if (editingCategoryId) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategoryId
            ? {
                ...category,
                name: trimmedName,
                slug: normalizedSlug,
                description: categoryDraft.description.trim(),
                iconName: categoryDraft.iconName.trim() || 'layers'
              }
            : category
        )
      );
      showToast(`${trimmedName} category updated.`, 'success');
    } else {
      const newCategory: ProductCategory = {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        slug: normalizedSlug,
        description: categoryDraft.description.trim() || 'Wholesale category for approved B2B procurement teams.',
        iconName: categoryDraft.iconName.trim() || 'layers',
        itemCount: 0
      };
      setCategories((current) => [newCategory, ...current]);
      showToast(`${trimmedName} category added to the catalog.`, 'success');
    }

    setCategoryModalOpen(false);
  };

  const toggleCategoryStatus = (category: CategoryRow) => {
    setInactiveCategoryIds((current) =>
      current.includes(category.id)
        ? current.filter((id) => id !== category.id)
        : [...current, category.id]
    );
    showToast(`${category.name} set to ${category.status === 'Active' ? 'Inactive' : 'Active'}.`, category.status === 'Active' ? 'warning' : 'success');
  };

  const deleteCategory = (category: CategoryRow) => {
    if (category.itemCount > 0) {
      showToast('Only empty categories can be deleted. Move products before deleting this category.', 'warning');
      return;
    }

    setCategories((current) => current.filter((item) => item.id !== category.id));
    setInactiveCategoryIds((current) => current.filter((id) => id !== category.id));
    showToast(`${category.name} removed from the category directory.`, 'warning');
  };

  const productColumns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product / SKU',
      accessor: (product) => (
        <div className="flex min-w-[260px] items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <Link to={`/admin/products/${product.id}`} className="line-clamp-1 font-bold text-slate-900 hover:text-blue-700">
              {product.name}
            </Link>
            <div className="mt-0.5 font-mono text-[11px] font-semibold text-blue-700">
              {product.sku} - {product.brand}
            </div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (product) => (
        <div className="min-w-[160px]">
          <div className="font-semibold text-slate-800">{product.category}</div>
          <div className="text-[11px] text-slate-500">{product.unit}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'moq',
      header: 'MOQ / Pricing',
      accessor: (product) => {
        const bestTier = getBestTier(product);

        return (
          <div className="min-w-[150px] text-xs">
            <div className="font-bold text-slate-900">
              MOQ {product.moq.toLocaleString()} {product.unit}
            </div>
            <div className="mt-0.5 font-mono text-blue-700">
              {formatCurrency(product.basePrice, product.currency)} base
            </div>
            <div className="text-[11px] text-slate-500">
              Best: {formatCurrency(bestTier?.unitPrice || product.basePrice, product.currency)} at {bestTier ? formatTierRange(bestTier, product.unit) : 'base tier'}
            </div>
          </div>
        );
      },
      sortable: true
    },
    {
      key: 'inventory',
      header: 'Inventory',
      accessor: (product) => (
        <div className="min-w-[150px] text-xs">
          <div className="font-bold text-slate-900">{product.availableStock.toLocaleString()} available</div>
          <div className="text-slate-500">
            {product.reservedStock.toLocaleString()} reserved - reorder at {product.reorderPoint.toLocaleString()}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-slate-400">{product.warehouseLocation}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'stock',
      header: 'Stock',
      accessor: (product) => <StatusBadge status={getStockStatus(product)} size="sm" />
    },
    {
      key: 'status',
      header: 'Catalog',
      accessor: (product) => <StatusBadge status={product.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (product) => (
        <div className="flex min-w-[210px] flex-wrap items-center gap-1.5">
          <Link to={`/admin/products/${product.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>
          {canUpdateProducts ? (
            <Link to={`/admin/products/${product.id}/edit`}>
              <Button variant="outline" size="xs" icon={Edit}>
                Edit
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="xs" icon={Edit} disabled>
              Edit
            </Button>
          )}
          {canDeleteProducts && (
            <Button
              variant={product.status === 'Archived' ? 'success' : 'ghost'}
              size="xs"
              icon={product.status === 'Archived' ? CheckCircle2 : Archive}
              onClick={() => handleToggleStatus(product)}
            >
              {product.status === 'Archived' ? 'Activate' : 'Deactivate'}
            </Button>
          )}
        </div>
      )
    }
  ];

  const categoryColumns: Column<CategoryRow>[] = [
    {
      key: 'category',
      header: 'Category',
      accessor: (category) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{category.name}</div>
          <div className="text-xs text-slate-500">{category.description}</div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Products',
      accessor: (category) => (
        <div className="font-mono text-sm font-bold text-slate-900">
          {category.itemCount.toLocaleString()}
        </div>
      ),
      align: 'right'
    },
    {
      key: 'active',
      header: 'Active',
      accessor: (category) => <StatusBadge status={`${category.activeCount} Active`} size="sm" showDot={false} />
    },
    {
      key: 'alerts',
      header: 'Stock Alerts',
      accessor: (category) => (
        <StatusBadge
          status={category.lowStockCount > 0 ? `${category.lowStockCount} Needs Review` : 'In Stock'}
          size="sm"
          showDot={category.lowStockCount > 0}
        />
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (category) => <StatusBadge status={category.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (category) => (
        <div className="flex min-w-[220px] flex-wrap items-center gap-1.5">
          {canUpdateProducts && (
            <>
              <Button variant="outline" size="xs" icon={Edit} onClick={() => openCategoryModal(category)}>
                Edit
              </Button>
              <Button
                variant={category.status === 'Active' ? 'ghost' : 'success'}
                size="xs"
                icon={category.status === 'Active' ? Archive : CheckCircle2}
                onClick={() => toggleCategoryStatus(category)}
              >
                {category.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
            </>
          )}
          {canDeleteProducts && (
            <Button variant="ghost" size="xs" icon={Trash2} onClick={() => deleteCategory(category)}>
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  const pricingColumns: Column<Product>[] = [
    {
      key: 'product',
      header: 'SKU',
      accessor: (product) => (
        <div className="min-w-[240px]">
          <Link to={`/admin/products/${product.id}`} className="font-bold text-slate-900 hover:text-blue-700">
            {product.name}
          </Link>
          <div className="font-mono text-[11px] font-semibold text-blue-700">{product.sku}</div>
        </div>
      )
    },
    {
      key: 'moq',
      header: 'MOQ',
      accessor: (product) => (
        <span className="font-mono font-bold text-slate-900">
          {product.moq.toLocaleString()} {product.unit}
        </span>
      )
    },
    {
      key: 'base',
      header: 'Base Wholesale',
      accessor: (product) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(product.basePrice, product.currency)}
        </span>
      ),
      align: 'right'
    },
    {
      key: 'tiers',
      header: 'Tier Schedule',
      accessor: (product) => (
        <div className="grid min-w-[360px] gap-2 md:grid-cols-2">
          {product.tierPricing.map((tier) => (
            <div key={`${product.id}-${tier.minQty}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-slate-900">{tier.label || 'Wholesale Tier'}</div>
                <StatusBadge status={tier.status || 'Active'} size="sm" showDot={false} />
              </div>
              <div className="mt-0.5 text-slate-600">
                {formatTierRange(tier, product.unit)} at <span className="font-mono font-bold text-blue-700">{formatCurrency(tier.unitPrice, product.currency)}</span>
              </div>
              <div className="mt-1 text-[11px] font-semibold text-slate-500">
                Effective {tier.effectiveDate || 'immediately'}
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Management"
        subtitle="Manage wholesale SKUs, MOQ thresholds, tier pricing, catalog visibility, and stock readiness."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Products' }
        ]}
        actions={
          canCreateProducts ? (
            <Link to="/admin/products/new">
            <Button variant="primary" size="sm" icon={Plus}>
              Add Product
            </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Products" value={products.length} subtext={`${products.filter((product) => product.status === 'Active').length} active SKUs`} icon={Package} />
        <KPICard
          title="Inventory Value"
          value={canViewCostPrice ? formatCurrency(inventoryValue) : 'Restricted'}
          subtext={canViewCostPrice ? 'Available stock at cost' : 'Cost price permission required'}
          icon={canViewCostPrice ? DollarSign : LockKeyhole}
        />
        <KPICard title="Low Stock Products" value={lowStockCount} subtext="At or below reorder point" icon={AlertTriangle} badge={lowStockCount ? 'Review' : undefined} badgeVariant="amber" />
        <KPICard title="Out of Stock" value={outOfStockCount} subtext="Unavailable for quoting" icon={Warehouse} badge={outOfStockCount ? 'Action' : undefined} badgeVariant="danger" />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabOptions.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={activeTab === tab.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSearchParams(tab.id === 'products' ? {} : { tab: tab.id })}
            icon={tab.id === 'categories' ? Layers : tab.id === 'pricing' ? DollarSign : Package}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'categories' ? (
        <Card
          title="Product Categories"
          subtitle="Category coverage and stock-alert rollups for the wholesale catalog."
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => openCategoryModal()}>
              Add Category
            </Button>
          }
        >
          <DataTable columns={categoryColumns} data={categoryRows} />
        </Card>
      ) : activeTab === 'pricing' ? (
        <Card
          title="MOQ and Tier Pricing"
          subtitle="Wholesale schedule by SKU for buyer quoting and volume-order validation."
        >
          <DataTable columns={pricingColumns} data={filteredProducts} />
        </Card>
      ) : (
        <Card className="border-slate-200" noPadding>
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by product, SKU, brand, or category..."
                />
              </div>
              <FilterBar
                filters={[
                  {
                    id: 'category',
                    label: 'Category',
                    value: selectedCategory,
                    onChange: setSelectedCategory,
                    options: categories.map((category) => ({ label: category.name, value: category.name }))
                  },
                  {
                    id: 'catalog',
                    label: 'Catalog Status',
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: [
                      { label: 'Active', value: 'Active' },
                      { label: 'Draft', value: 'Draft' },
                      { label: 'Archived', value: 'Archived' }
                    ]
                  },
                  {
                    id: 'stock',
                    label: 'Stock Status',
                    value: stockFilter,
                    onChange: setStockFilter,
                    options: [
                      { label: 'In Stock', value: 'In Stock' },
                      { label: 'Low Stock', value: 'Low Stock' },
                      { label: 'Out of Stock', value: 'Out of Stock' }
                    ]
                  }
                ]}
                hasActiveFilters={selectedCategory !== 'ALL' || statusFilter !== 'ALL' || stockFilter !== 'ALL' || searchTerm !== ''}
                onReset={resetFilters}
                className="lg:w-auto"
              />
            </div>

            <DataTable columns={productColumns} data={filteredProducts} emptyMessage="No wholesale products match the selected filters." />
          </div>
        </Card>
      )}

      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategoryId ? 'Edit Category' : 'Add Category'}
        subtitle="Maintain category labels used across public, buyer, and admin catalog views."
        size="md"
      >
        <form onSubmit={saveCategory} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={categoryDraft.name}
            onChange={(event) =>
              setCategoryDraft((draft) => ({
                ...draft,
                name: event.target.value,
                slug: editingCategoryId ? draft.slug : buildSlug(event.target.value)
              }))
            }
          />
          <Input
            label="Slug"
            required
            value={categoryDraft.slug}
            onChange={(event) => setCategoryDraft((draft) => ({ ...draft, slug: buildSlug(event.target.value) }))}
          />
          <Input
            label="Icon Token"
            value={categoryDraft.iconName}
            onChange={(event) => setCategoryDraft((draft) => ({ ...draft, iconName: event.target.value }))}
            helperText="Used by category cards where an icon mapping is available."
          />
          <Textarea
            label="Description"
            rows={3}
            value={categoryDraft.description}
            onChange={(event) => setCategoryDraft((draft) => ({ ...draft, description: event.target.value }))}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              {editingCategoryId ? 'Save Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
