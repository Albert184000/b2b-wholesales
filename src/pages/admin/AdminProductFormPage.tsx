import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Save, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { mockCategories } from '../../data/mockData';
import { Product, TierPrice } from '../../types';
import { formatCurrency, formatTierRange } from '../../utils/pricing';

const warehouseOptions = [
  {
    id: 'wh-pp-01',
    name: 'Phnom Penh Main Distribution Hub',
    location: 'Phnom Penh Main Hub (Rack A-12)',
    bin: 'A-12-04'
  },
  {
    id: 'wh-sr-01',
    name: 'Siem Reap Logistics Depot',
    location: 'Siem Reap Logistics Depot (Rack S-04)',
    bin: 'S-04-01'
  },
  {
    id: 'wh-btb-01',
    name: 'Battambang Regional Depot',
    location: 'Battambang Regional Depot (Bay C-01)',
    bin: 'C-01-08'
  }
];

const defaultImage =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

const createProductId = (sku: string) =>
  `prod-${sku.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()}`;

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, inventory, saveProduct, showToast } = useApp();

  const existingProduct = useMemo(
    () => (id ? products.find((product) => product.id === id) : undefined),
    [id, products]
  );
  const primaryInventory = existingProduct
    ? inventory.find((item) => item.productId === existingProduct.id)
    : undefined;
  const isEditing = Boolean(existingProduct);

  const [name, setName] = useState(existingProduct?.name || '');
  const [sku, setSku] = useState(existingProduct?.sku || '');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [category, setCategory] = useState(existingProduct?.category || mockCategories[0].name);
  const [status, setStatus] = useState(existingProduct?.status || 'Active');
  const [moq, setMoq] = useState(existingProduct?.moq || 10);
  const [unit, setUnit] = useState(existingProduct?.unit || 'Units');
  const [costPrice, setCostPrice] = useState(existingProduct?.costPrice || 100);
  const [basePrice, setBasePrice] = useState(existingProduct?.basePrice || 150);
  const [reorderPoint, setReorderPoint] = useState(existingProduct?.reorderPoint || 20);
  const [stockQty, setStockQty] = useState(primaryInventory?.onHand || existingProduct?.inStock || 100);
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [imageUrl, setImageUrl] = useState(existingProduct?.images[0] || defaultImage);
  const [warehouseId, setWarehouseId] = useState(primaryInventory?.warehouseId || warehouseOptions[0].id);
  const [locationBin, setLocationBin] = useState(primaryInventory?.locationBin || primaryInventory?.location || warehouseOptions[0].bin);
  const [tierPricing, setTierPricing] = useState<TierPrice[]>(
    existingProduct?.tierPricing || [
      { minQty: 10, maxQty: 49, unitPrice: 140, label: 'Standard Wholesale' },
      { minQty: 50, maxQty: 199, unitPrice: 128, label: 'Volume Tier' },
      { minQty: 200, maxQty: null, unitPrice: 115, label: 'Contract Tier' }
    ]
  );

  const selectedWarehouse = warehouseOptions.find((warehouse) => warehouse.id === warehouseId) || warehouseOptions[0];
  const reservedStock = primaryInventory?.reserved || existingProduct?.reservedStock || 0;
  const availableStock = Math.max(0, stockQty - reservedStock);

  const addTier = () => {
    const lastTier = tierPricing[tierPricing.length - 1];
    const nextMinQty = (lastTier?.maxQty || lastTier?.minQty || moq) + 1;

    setTierPricing([
      ...tierPricing,
      {
        minQty: nextMinQty,
        maxQty: null,
        unitPrice: Math.max(1, Math.round(basePrice * 0.85)),
        label: 'Custom Volume Tier'
      }
    ]);
  };

  const removeTier = (index: number) => {
    setTierPricing(tierPricing.filter((_, tierIndex) => tierIndex !== index));
  };

  const updateTier = <K extends keyof TierPrice>(index: number, field: K, value: TierPrice[K]) => {
    setTierPricing((current) =>
      current.map((tier, tierIndex) => (tierIndex === index ? { ...tier, [field]: value } : tier))
    );
  };

  const handleWarehouseChange = (nextWarehouseId: string) => {
    const nextWarehouse = warehouseOptions.find((warehouse) => warehouse.id === nextWarehouseId);
    setWarehouseId(nextWarehouseId);
    if (nextWarehouse) {
      setLocationBin(nextWarehouse.bin);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedTiers = tierPricing
      .filter((tier) => tier.minQty > 0 && tier.unitPrice > 0)
      .sort((a, b) => a.minQty - b.minQty);
    const productId = existingProduct?.id || createProductId(sku);
    const productRecord: Product = {
      id: productId,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      brand: brand.trim(),
      description: description.trim(),
      specifications: existingProduct?.specifications || {
        Warranty: 'Commercial wholesale warranty',
        Packaging: 'Factory carton / pallet-ready',
        'Lead Time': 'Ready for allocation from regional warehouse'
      },
      moq,
      unit,
      currency: existingProduct?.currency || 'USD',
      costPrice,
      basePrice,
      tierPricing: normalizedTiers,
      buyerGroupPricing: existingProduct?.buyerGroupPricing,
      inStock: stockQty,
      reservedStock,
      availableStock,
      reorderPoint,
      warehouseLocation: selectedWarehouse.location,
      status,
      images: [imageUrl || defaultImage, ...(existingProduct?.images.slice(1) || [])],
      featured: existingProduct?.featured
    };

    saveProduct(productRecord, {
      warehouseId: selectedWarehouse.id,
      warehouseName: selectedWarehouse.name,
      locationBin,
      onHand: stockQty
    });
    showToast(`${productRecord.sku} ${isEditing ? 'updated' : 'created'} in admin catalog.`, 'success');
    navigate(`/admin/products/${productRecord.id}`);
  };

  if (id && !existingProduct) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Product Not Found"
          subtitle="The requested admin product record is not available in the current catalog workspace."
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={isEditing ? `Edit ${existingProduct?.sku}` : 'Add Product'}
        subtitle="Configure wholesale catalog details, MOQ, tier pricing, and initial inventory quantity."
        breadcrumbs={[
          { label: 'Products', href: '/admin/products' },
          { label: isEditing ? 'Edit Product' : 'New Product' }
        ]}
        actions={
          <Link to="/admin/products">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card title="Product Details" className="xl:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Product Name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Lenovo ThinkCentre M90q Gen 5 Tiny Desktop"
                />
              </div>
              <Input
                label="SKU"
                required
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="e.g. PC-M90Q-G5"
              />
              <Input
                label="Brand"
                required
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="e.g. Lenovo"
              />
              <Select
                label="Category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                options={mockCategories.map((item) => ({ label: item.name, value: item.name }))}
              />
              <Select
                label="Catalog Status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Archived', value: 'Archived' }
                ]}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Commercial Description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Technical overview, target B2B use case, packaging, warranty, and lead-time notes."
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Primary Image URL"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  helperText="Paste a stable product image URL for catalog preview."
                />
              </div>
            </div>
          </Card>

          <Card title="Preview" className="h-fit">
            <div className="space-y-4">
              <img
                src={imageUrl || defaultImage}
                alt={name || 'Product preview'}
                className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="line-clamp-2 font-bold text-slate-900">{name || 'New wholesale SKU'}</div>
                <div className="mt-1 font-mono text-xs font-semibold text-blue-700">{sku || 'SKU-PENDING'}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={status} size="sm" />
                <StatusBadge status={availableStock <= 0 ? 'Out of Stock' : availableStock <= reorderPoint ? 'Low Stock' : 'In Stock'} size="sm" />
              </div>
            </div>
          </Card>
        </div>

        <Card title="MOQ, Cost, and Inventory">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Minimum Order Quantity"
              type="number"
              min={1}
              required
              value={moq}
              onChange={(event) => setMoq(parseInt(event.target.value, 10) || 1)}
            />
            <Input
              label="Unit"
              required
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="Units / Cartons / Pallets"
            />
            <Input
              label="Cost Price"
              type="number"
              min={0}
              step="0.01"
              required
              prefixText="$"
              value={costPrice}
              onChange={(event) => setCostPrice(parseFloat(event.target.value) || 0)}
            />
            <Input
              label="Base Wholesale Price"
              type="number"
              min={0}
              step="0.01"
              required
              prefixText="$"
              value={basePrice}
              onChange={(event) => setBasePrice(parseFloat(event.target.value) || 0)}
            />
            <Select
              label="Primary Warehouse"
              value={warehouseId}
              onChange={(event) => handleWarehouseChange(event.target.value)}
              options={warehouseOptions.map((warehouse) => ({ label: warehouse.name, value: warehouse.id }))}
            />
            <Input
              label="Bin / Bay"
              value={locationBin}
              onChange={(event) => setLocationBin(event.target.value)}
            />
            <Input
              label="Physical On-Hand"
              type="number"
              min={0}
              required
              value={stockQty}
              onChange={(event) => setStockQty(parseInt(event.target.value, 10) || 0)}
            />
            <Input
              label="Reorder Point"
              type="number"
              min={0}
              required
              value={reorderPoint}
              onChange={(event) => setReorderPoint(parseInt(event.target.value, 10) || 0)}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-3">
            <div>
              <div className="font-semibold uppercase tracking-wide text-slate-500">Available</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">{availableStock.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-semibold uppercase tracking-wide text-slate-500">Reserved</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">{reservedStock.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-semibold uppercase tracking-wide text-slate-500">Margin Estimate</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                {basePrice > 0 ? `${Math.round(((basePrice - costPrice) / basePrice) * 100)}%` : '0%'}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Wholesale Tier Pricing"
          subtitle="The buyer storefront and RFQ flow use this schedule for MOQ and quantity-based price previews."
          action={
            <Button type="button" variant="outline" size="xs" icon={Plus} onClick={addTier}>
              Add Tier
            </Button>
          }
        >
          <div className="space-y-3">
            {tierPricing.map((tier, index) => (
              <div key={`${index}-${tier.minQty}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                  <Input
                    label="Tier Label"
                    value={tier.label || ''}
                    onChange={(event) => updateTier(index, 'label', event.target.value)}
                    className="md:col-span-2"
                  />
                  <Input
                    label="Min Qty"
                    type="number"
                    min={1}
                    value={tier.minQty}
                    onChange={(event) => updateTier(index, 'minQty', parseInt(event.target.value, 10) || 1)}
                  />
                  <Input
                    label="Max Qty"
                    type="number"
                    min={0}
                    value={tier.maxQty ?? ''}
                    placeholder="No limit"
                    onChange={(event) => updateTier(index, 'maxQty', event.target.value ? parseInt(event.target.value, 10) : null)}
                  />
                  <div className="flex items-end gap-2">
                    <Input
                      label="Unit Price"
                      type="number"
                      min={0}
                      step="0.01"
                      prefixText="$"
                      value={tier.unitPrice}
                      onChange={(event) => updateTier(index, 'unitPrice', parseFloat(event.target.value) || 0)}
                    />
                    {tierPricing.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => removeTier(index)}
                        title="Remove tier"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <Package className="h-3.5 w-3.5" />
                  <span>
                    {formatTierRange(tier, unit)} at {formatCurrency(tier.unitPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <Link to="/admin/products">
            <Button type="button" variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Product
          </Button>
        </div>
      </form>
    </div>
  );
};
