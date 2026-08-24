import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Warehouse,
  ArrowLeft,
  FileQuestion,
  AlertCircle,
  BadgeCheck,
  Building2,
  ClipboardList,
  Download,
  Minus,
  Plus,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Package,
  Receipt,
  Star,
  Tag,
  Truck
} from 'lucide-react';
import { Button, Card, StatusBadge, PageHeader, Alert } from '../../components/ui';
import { mockCategories, mockProducts } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  formatCurrency,
  formatTierRange,
  getBestTier,
  getOrderEstimate,
  getRfqLoginPath,
  getTierSavingsPercent
} from '../../utils/pricing';
import {
  getCategorySlug,
  getProductCategorySlug,
  getProductSupplier,
  getRelatedProducts,
  getStockLabel
} from '../../utils/publicCatalog';
import { applyPublicImageFallback } from '../../utils/publicImages';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const product = mockProducts.find((item) => item.id === id);
  const activeProduct = product || mockProducts[0];
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState<number>(activeProduct.moq);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(activeProduct.moq);
  }, [activeProduct.id, activeProduct.moq]);

  const estimate = useMemo(
    () => getOrderEstimate(activeProduct, quantity),
    [activeProduct, quantity]
  );
  const bestTier = getBestTier(activeProduct);
  const rfqPath = getRfqLoginPath(activeProduct, quantity, estimate.unitPrice);
  const exceedsAvailableStock = quantity > activeProduct.availableStock;
  const category = mockCategories.find((item) => item.name === activeProduct.category);
  const categorySlug = category ? getCategorySlug(category) : getProductCategorySlug(activeProduct);
  const supplierName = getProductSupplier(activeProduct);
  const stockLabel = getStockLabel(activeProduct);
  const relatedProducts = useMemo(
    () => getRelatedProducts(activeProduct, mockProducts, 4),
    [activeProduct]
  );
  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewedIds
        .map((productId) => mockProducts.find((item) => item.id === productId))
        .filter((item): item is Product => Boolean(item)),
    [recentlyViewedIds]
  );

  useEffect(() => {
    if (!product) return;

    const storageKey = 'wholesalehub-recent-products';
    let existingIds: unknown = [];

    try {
      existingIds = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    } catch {
      existingIds = [];
    }

    const safeExistingIds = Array.isArray(existingIds) ? existingIds.filter((item) => typeof item === 'string') : [];
    const nextIds = [product.id, ...safeExistingIds.filter((productId) => productId !== product.id)].slice(0, 6);

    setRecentlyViewedIds(safeExistingIds.filter((productId) => productId !== product.id).slice(0, 4));
    window.localStorage.setItem(storageKey, JSON.stringify(nextIds));
  }, [product]);

  const setSafeQuantity = (value: number) => {
    const safeQuantity = Math.max(0, Math.min(99999, Math.floor(Number.isFinite(value) ? value : activeProduct.moq)));
    setQuantity(safeQuantity);
  };

  const stepQuantity = (direction: 1 | -1) => {
    const nextQuantity =
      direction === 1
        ? Math.max(activeProduct.moq, quantity + activeProduct.moq)
        : Math.max(0, quantity - activeProduct.moq);

    setSafeQuantity(nextQuantity);
  };

  const renderCompactProductCard = (item: Product) => {
    const openingTier = item.tierPricing[0] || getBestTier(item);

    return (
      <Card key={item.id} className="group border-slate-200 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
        <Link to={`/products/${item.id}`} className="block">
          <div className="overflow-hidden rounded-xl bg-slate-100">
            <img
              src={item.images[0]}
              alt={item.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(event) => applyPublicImageFallback(event, item.name)}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
            <span className="font-bold text-blue-600">{item.sku}</span>
            <StatusBadge status={getStockLabel(item)} size="sm" />
          </div>
          <h3 className="mt-2 min-h-10 text-sm font-extrabold leading-snug text-slate-900 line-clamp-2">
            {item.name}
          </h3>
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <span className="block text-slate-500">MOQ</span>
            <span className="font-bold text-slate-900">{item.moq} {item.unit}</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <span className="block text-slate-500">Starts at</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(openingTier.unitPrice, item.currency)}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
          {getProductSupplier(item)}
        </div>
        <div className="mt-4 flex gap-2">
          <Link to={`/products/${item.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full justify-center">
              Details
            </Button>
          </Link>
          <Link to={getRfqLoginPath(item, item.moq, openingTier.unitPrice)} className="flex-1">
            <Button variant="primary" size="sm" icon={Tag} className="w-full justify-center">
              RFQ
            </Button>
          </Link>
        </div>
      </Card>
    );
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 sm:p-10 text-center border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Product Not Found
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            This wholesale SKU is not available.
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-3 leading-relaxed">
            The item may have been archived, renamed, or moved into a contract-only catalog.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/products" className="block w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto" icon={ArrowLeft}>
                Back to Catalog
              </Button>
            </Link>
            <Link to="/contact" className="block w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Contact Sales
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={activeProduct.name}
        subtitle={`${supplierName} - SKU: ${activeProduct.sku} - ${stockLabel}`}
        breadcrumbs={[
          { label: 'Catalog', href: '/products' },
          { label: activeProduct.category, href: `/categories/${categorySlug}` },
          { label: activeProduct.sku }
        ]}
        actions={
          <Link to="/products">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Catalog
            </Button>
          </Link>
        }
      />

      <nav
        aria-label="Product page sections"
        className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-600 shadow-xs"
      >
        {[
          ['Overview', '#overview'],
          ['Specifications', '#specifications'],
          ['Tier Pricing', '#tier-pricing'],
          ['Shipping', '#shipping'],
          ['Documents', '#documents'],
          ['Supplier', '#supplier']
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="shrink-0 rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-4 overflow-hidden border-slate-200">
            <div className="h-80 sm:h-96 rounded-xl bg-slate-100 overflow-hidden relative mb-4">
              <img
                src={activeProduct.images[selectedImage] || activeProduct.images[0]}
                alt={activeProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(event) => applyPublicImageFallback(event, activeProduct.name)}
              />
              <div className="absolute top-3 left-3">
                <StatusBadge status={activeProduct.status} />
              </div>
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-mono px-2.5 py-1 rounded font-bold">
                MOQ: {activeProduct.moq} {activeProduct.unit}
              </div>
            </div>

            {activeProduct.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {activeProduct.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-all shrink-0 ${
                      selectedImage === index
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(event) => applyPublicImageFallback(event, activeProduct.name)}
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card id="overview" title="Overview" className="scroll-mt-28 border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">{activeProduct.description}</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Category', activeProduct.category],
                ['Supplier', supplierName],
                ['MOQ', `${activeProduct.moq} ${activeProduct.unit}`],
                ['Stock status', stockLabel]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
              Approved buyers see assigned group discounts, credit terms, and contract-specific pricing inside the buyer portal.
            </div>
          </Card>

          <Card id="specifications" title="Technical Specifications" className="scroll-mt-28 border-slate-200">
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
              {Object.entries(activeProduct.specifications).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row py-2.5 px-4 bg-white even:bg-slate-50/60 gap-1 sm:gap-4">
                  <span className="font-semibold text-slate-700 sm:w-1/3">{key}</span>
                  <span className="text-slate-600 sm:w-2/3">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card id="documents" title="Documents" subtitle="Available after buyer verification" className="scroll-mt-28 border-slate-200">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Product datasheet', 'PDF'],
                ['Warranty statement', 'PDF'],
                ['Compliance certificate', 'PDF'],
                ['Bulk packaging guide', 'PDF']
              ].map(([name, format]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => showToast(`${name} will be available after business account approval.`, 'info')}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs transition-colors hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="flex items-center gap-2 font-bold text-slate-800">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {name}
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500">
                    {format}
                    <Download className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card id="tier-pricing" className="scroll-mt-28 border-blue-200 shadow-md bg-white">
            <div className="p-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  B2B Volume Tier Pricing
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                  {activeProduct.availableStock.toLocaleString()} {activeProduct.unit} available
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Commercial Price Schedule</h3>
            </div>

            <div className="p-5 space-y-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Quantity Tier</th>
                      <th className="px-3 py-2">Wholesale Price</th>
                      <th className="px-3 py-2 text-right">Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProduct.tierPricing.map((tier) => {
                      const isCurrent = !estimate.isBelowMOQ && estimate.tier === tier;
                      const savings = getTierSavingsPercent(activeProduct, tier);

                      return (
                        <tr
                          key={`${activeProduct.id}-${tier.minQty}`}
                          className={`transition-colors ${
                            isCurrent ? 'bg-blue-50/80 font-bold text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <button
                              type="button"
                              onClick={() => setSafeQuantity(tier.minQty)}
                              className="text-left hover:text-blue-700"
                            >
                              {formatTierRange(tier, activeProduct.unit)}
                              {tier.label && (
                                <span className="block text-[10px] font-normal text-slate-400">
                                  {tier.label}
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">
                            {formatCurrency(tier.unitPrice, activeProduct.currency)}
                            <span className="text-[10px] text-slate-500 font-normal">/unit</span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-emerald-600">
                            {savings > 0 ? `-${savings}%` : 'Base'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Specify Order Quantity
                    </label>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Minimum order quantity is <strong>{activeProduct.moq} {activeProduct.unit}</strong>
                    </div>
                  </div>
                  {estimate.isBelowMOQ && (
                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 w-fit">
                      Below MOQ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepQuantity(-1)}
                    className="h-10 w-10 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                    aria-label="Decrease order quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(event) => setSafeQuantity(Number(event.target.value))}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-center text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Order quantity"
                  />
                  <button
                    type="button"
                    onClick={() => stepQuantity(1)}
                    className="h-10 w-10 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                    aria-label="Increase order quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {activeProduct.tierPricing.map((tier) => {
                    const active = !estimate.isBelowMOQ && estimate.tier === tier;

                    return (
                      <button
                        key={`${activeProduct.id}-quick-${tier.minQty}`}
                        type="button"
                        onClick={() => setSafeQuantity(tier.minQty)}
                        className={`rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors ${
                          active
                            ? 'border-blue-400 bg-blue-50 text-blue-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="block font-bold">{formatTierRange(tier, activeProduct.unit)}</span>
                        <span>{formatCurrency(tier.unitPrice, activeProduct.currency)}/unit</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-3 text-slate-600">
                    <span>Applied Unit Price</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(estimate.unitPrice, activeProduct.currency)} USD / unit
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-slate-600">
                    <span>Estimated Subtotal ({quantity} units)</span>
                    <span className="text-base font-extrabold text-blue-600">
                      {formatCurrency(estimate.subtotal, activeProduct.currency)} USD
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-slate-600">
                    <span>Best listed tier</span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(bestTier.unitPrice, activeProduct.currency)} / unit
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    Freight, VAT invoice, and credit terms are confirmed during official RFQ review.
                  </div>
                </div>
              </div>

              {estimate.isBelowMOQ && (
                <Alert type="warning" title="MOQ Required">
                  Increase quantity to at least {activeProduct.moq} {activeProduct.unit} before requesting a wholesale quotation.
                </Alert>
              )}

              {exceedsAvailableStock && !estimate.isBelowMOQ && (
                <Alert type="info" title="Large Quantity RFQ">
                  Selected quantity exceeds available stock. The RFQ can still be submitted for staged delivery or backorder confirmation.
                </Alert>
              )}

              <div className="space-y-2.5 pt-2">
                {estimate.isBelowMOQ ? (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center text-sm py-2.5"
                    onClick={() => setSafeQuantity(activeProduct.moq)}
                  >
                    Set Quantity to MOQ
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center text-sm py-2.5"
                    icon={FileQuestion}
                    onClick={() => navigate(rfqPath)}
                  >
                    Request Official Quotation
                  </Button>
                )}
                <Link to="/login?next=/buyer/dashboard" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Check Corporate Credit
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  icon={ClipboardList}
                  onClick={() => showToast(`${activeProduct.sku} added to RFQ draft. Sign in to continue the request.`, 'success')}
                >
                  Add to RFQ Draft
                </Button>
              </div>

              <div id="shipping" className="scroll-mt-28 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Warehouse className="w-4 h-4 text-blue-600" />
                  <span>Warehouse Hub Logistics</span>
                </div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  Location: <strong className="text-slate-800">{activeProduct.warehouseLocation}</strong>
                  <br />
                  Physical stock on hand:{' '}
                  <strong className="text-emerald-700">
                    {activeProduct.availableStock.toLocaleString()} units ready to ship
                  </strong>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Warranty
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Pallet freight
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    VAT invoice
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card id="supplier" title="Supplier Information" className="scroll-mt-28 border-slate-200">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-900">{supplierName}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Authorized B2B distributor with warranty-backed inventory and commercial logistics support.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                {[
                  ['Rating', '4.8/5'],
                  ['Lead time', '2-5 days'],
                  ['Terms', 'Net 30 review']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="font-bold uppercase tracking-wider text-slate-500">{label}</div>
                    <div className="mt-1 font-extrabold text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {activeProduct.buyerGroupPricing && (
            <Card title="Approved Buyer Group Discounts" className="border-slate-200">
              <div className="space-y-2 text-xs">
                {activeProduct.buyerGroupPricing.map((group) => (
                  <div
                    key={group.groupId}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="font-semibold text-slate-700">{group.groupName}</span>
                    <span className="font-bold text-emerald-700">
                      {group.discountPercentage}% off quoted tier after approval
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <section className="mt-10 space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <Package className="h-3.5 w-3.5" />
              Same Category
            </div>
            <h2 className="mt-2 text-xl font-extrabold text-slate-950">Related wholesale products</h2>
            <p className="mt-1 text-sm text-slate-500">
              Products sourced from {activeProduct.category} with comparable MOQ and volume tiers.
            </p>
          </div>
          <Link to={`/categories/${categorySlug}`} className="text-sm font-extrabold text-blue-700 hover:text-blue-900">
            View all in category
          </Link>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map(renderCompactProductCard)}
          </div>
        ) : (
          <Card className="border-slate-200">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Receipt className="h-5 w-5 text-blue-600" />
              This category has one featured SKU right now. Browse the full catalog for alternatives.
            </div>
          </Card>
        )}
      </section>

      {recentlyViewedProducts.length > 0 && (
        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-extrabold text-slate-950">Recently viewed products</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewedProducts.map(renderCompactProductCard)}
          </div>
        </section>
      )}
    </div>
  );
};
