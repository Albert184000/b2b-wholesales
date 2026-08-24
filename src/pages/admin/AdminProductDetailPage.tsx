import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Edit,
  Layers,
  LockKeyhole,
  Package,
  Warehouse
} from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  Input,
  KPICard,
  PageHeader,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { InventoryItem, TierPrice } from '../../types';
import { formatCurrency, formatTierRange, getOrderEstimate } from '../../utils/pricing';
import { hasPermission } from '../../utils/rbac';

const getStockStatus = (available: number, reorderPoint: number) => {
  if (available <= 0) return 'Out of Stock';
  if (available <= reorderPoint) return 'Low Stock';
  return 'In Stock';
};

export const AdminProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, products, inventory, updateProductStatus, showToast } = useApp();
  const product = products.find((item) => item.id === id);
  const productInventory = inventory.filter((item) => item.productId === id);
  const [previewQty, setPreviewQty] = useState(product?.moq || 1);
  const canViewCostPrice = hasPermission(currentUser.role, 'products.view_cost_price');

  const priceEstimate = useMemo(
    () => (product ? getOrderEstimate(product, previewQty) : undefined),
    [product, previewQty]
  );

  if (!product) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Product Not Found"
          subtitle="The requested product record is not available in the current admin catalog."
          breadcrumbs={[
            { label: 'Products', href: '/admin/products' },
            { label: 'Not Found' }
          ]}
          actions={
            <Link to="/admin/products">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Products
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const stockStatus = getStockStatus(product.availableStock, product.reorderPoint);
  const marginPercent =
    product.basePrice > 0 ? Math.round(((product.basePrice - product.costPrice) / product.basePrice) * 100) : 0;

  const handleToggleStatus = () => {
    const nextStatus = product.status === 'Archived' ? 'Active' : 'Archived';
    updateProductStatus(product.id, nextStatus);
    showToast(`${product.sku} ${nextStatus === 'Active' ? 'reactivated' : 'deactivated'} in admin catalog.`, nextStatus === 'Active' ? 'success' : 'warning');
  };

  const tierColumns: Column<TierPrice>[] = [
    {
      key: 'label',
      header: 'Tier',
      accessor: (tier) => (
        <div className="min-w-[180px]">
          <div className="font-bold text-slate-900">{tier.label || 'Wholesale Tier'}</div>
          <div className="text-xs text-slate-500">{formatTierRange(tier, product.unit)}</div>
        </div>
      )
    },
    {
      key: 'unit',
      header: 'Unit Price',
      align: 'right',
      accessor: (tier) => (
        <span className="font-mono text-sm font-bold text-slate-900">
          {formatCurrency(tier.unitPrice, product.currency)}
        </span>
      )
    },
    {
      key: 'savings',
      header: 'Discount vs Base',
      accessor: (tier) => (
        <StatusBadge
          status={`${Math.max(0, Math.round(((product.basePrice - tier.unitPrice) / product.basePrice) * 100))}% Savings`}
          size="sm"
          showDot={false}
        />
      )
    }
  ];

  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'warehouse',
      header: 'Warehouse',
      accessor: (item) => (
        <div className="min-w-[220px]">
          <div className="font-bold text-slate-900">{item.warehouseName}</div>
          <div className="font-mono text-xs text-slate-500">Bin {item.locationBin || item.location || 'Unassigned'}</div>
        </div>
      )
    },
    {
      key: 'onHand',
      header: 'On Hand',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{item.onHand.toLocaleString()}</span>
    },
    {
      key: 'reserved',
      header: 'Reserved',
      align: 'right',
      accessor: (item) => <span className="font-mono text-slate-700">{item.reserved.toLocaleString()}</span>
    },
    {
      key: 'available',
      header: 'Available',
      align: 'right',
      accessor: (item) => <span className="font-mono font-bold text-slate-900">{item.available.toLocaleString()}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (item) => <StatusBadge status={getStockStatus(item.available, item.reorderPoint)} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.sku}
        subtitle={product.name}
        breadcrumbs={[
          { label: 'Products', href: '/admin/products' },
          { label: product.sku }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/products">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Link to={`/admin/products/${product.id}/edit`}>
              <Button variant="primary" size="sm" icon={Edit}>
                Edit Product
              </Button>
            </Link>
            <Button
              variant={product.status === 'Archived' ? 'success' : 'outline'}
              size="sm"
              icon={product.status === 'Archived' ? CheckCircle2 : Archive}
              onClick={handleToggleStatus}
            >
              {product.status === 'Archived' ? 'Activate' : 'Deactivate'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Base Price"
          value={formatCurrency(product.basePrice, product.currency)}
          subtext={canViewCostPrice ? `${marginPercent}% estimated margin` : 'Cost price restricted for this role'}
          icon={DollarSign}
        />
        <KPICard title="MOQ" value={`${product.moq} ${product.unit}`} subtext="Minimum order quantity" icon={Package} />
        <KPICard title="Available Stock" value={product.availableStock.toLocaleString()} subtext={`${product.reservedStock.toLocaleString()} reserved`} icon={Warehouse} />
        <KPICard title="Catalog Status" value={product.status} subtext={stockStatus} icon={Layers} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Product Profile" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
            <img
              src={product.images[0]}
              alt={product.name}
              className="aspect-[4/3] w-full rounded-xl border border-slate-200 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={product.status} size="sm" />
                  <StatusBadge status={stockStatus} size="sm" />
                </div>
                <h2 className="mt-3 text-xl font-extrabold text-slate-900">{product.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Brand</div>
                  <div className="mt-1 font-semibold text-slate-900">{product.brand}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Category</div>
                  <div className="mt-1 font-semibold text-slate-900">{product.category}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Primary Warehouse</div>
                  <div className="mt-1 font-semibold text-slate-900">{product.warehouseLocation}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Reorder Point</div>
                  <div className="mt-1 font-mono font-semibold text-slate-900">{product.reorderPoint.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Cost Price</div>
                  {canViewCostPrice ? (
                    <div className="mt-1 font-mono font-semibold text-slate-900">
                      {formatCurrency(product.costPrice, product.currency)}
                    </div>
                  ) : (
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                      <LockKeyhole className="h-3.5 w-3.5" />
                      Restricted
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="MOQ Price Preview">
          <div className="space-y-4">
            <Input
              label="Preview Quantity"
              type="number"
              min={1}
              value={previewQty}
              onChange={(event) => setPreviewQty(parseInt(event.target.value, 10) || 1)}
            />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Matched Tier</span>
                {priceEstimate?.isBelowMOQ && <StatusBadge status="Below MOQ" size="sm" showDot={false} />}
              </div>
              <div className="mt-2 font-bold text-slate-900">{priceEstimate?.tier?.label || 'Base Wholesale'}</div>
              <div className="mt-1 text-xs text-slate-500">
                {priceEstimate?.tier ? formatTierRange(priceEstimate.tier, product.unit) : 'No tier matched'}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-bold uppercase tracking-wide text-slate-500">Unit Price</div>
                  <div className="mt-1 font-mono text-lg font-extrabold text-slate-900">
                    {formatCurrency(priceEstimate?.unitPrice || product.basePrice, product.currency)}
                  </div>
                </div>
                <div>
                  <div className="font-bold uppercase tracking-wide text-slate-500">Subtotal</div>
                  <div className="mt-1 font-mono text-lg font-extrabold text-slate-900">
                    {formatCurrency(priceEstimate?.subtotal || 0, product.currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Wholesale Tier Schedule">
          <DataTable columns={tierColumns} data={product.tierPricing} compact />
        </Card>

        <Card title="Warehouse Inventory">
          <DataTable columns={inventoryColumns} data={productInventory} compact emptyMessage="No warehouse stock rows are attached to this product." />
        </Card>
      </div>

      <Card title="Commercial Specifications">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(product.specifications || {}).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
              <div className="mt-1 font-semibold text-slate-900">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
