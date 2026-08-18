import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Grid,
  List,
  Package,
  Tag,
  Minus,
  Plus,
  SearchX,
  Warehouse,
  TrendingDown
} from 'lucide-react';
import {
  Button,
  Card,
  StatusBadge,
  SearchBar,
  FilterBar,
  Pagination,
  PageHeader,
  EmptyState
} from '../../components/ui';
import { mockProducts, mockCategories } from '../../data/mockData';
import { Product } from '../../types';
import {
  formatCurrency,
  formatTierRange,
  getBestTier,
  getOrderEstimate,
  getRfqLoginPath,
  getTierSavingsPercent
} from '../../utils/pricing';

export const ProductCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'ALL';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    mockProducts.reduce<Record<string, number>>((acc, product) => {
      acc[product.id] = product.moq;
      return acc;
    }, {})
  );
  const pageSize = 6;

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrand, sortBy]);

  const brands = useMemo(() => {
    const brandSet = new Set(mockProducts.map((product) => product.brand));
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const matchingProducts = mockProducts.filter((product) => {
      const searchableText = [
        product.name,
        product.sku,
        product.brand,
        product.category,
        product.description
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = query === '' || searchableText.includes(query);
      const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === 'ALL' || product.brand === selectedBrand;

      return matchesSearch && matchesCategory && matchesBrand;
    });

    return [...matchingProducts].sort((a, b) => {
      const aBestTier = getBestTier(a);
      const bBestTier = getBestTier(b);
      const aOpeningPrice = a.tierPricing[0]?.unitPrice || a.basePrice;
      const bOpeningPrice = b.tierPricing[0]?.unitPrice || b.basePrice;

      switch (sortBy) {
        case 'moq-low':
          return a.moq - b.moq;
        case 'price-low':
          return aOpeningPrice - bOpeningPrice;
        case 'price-high':
          return bOpeningPrice - aOpeningPrice;
        case 'savings-high':
          return getTierSavingsPercent(b, bBestTier) - getTierSavingsPercent(a, aBestTier);
        case 'stock-high':
          return b.availableStock - a.availableStock;
        case 'popular':
        default:
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.availableStock - a.availableStock;
      }
    });
  }, [searchTerm, selectedCategory, selectedBrand, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateCategory = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === 'ALL') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', value);
    }

    setSelectedCategory(value);
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setSortBy('popular');
    setSearchParams({});
  };

  const setProductQuantity = (product: Product, value: number) => {
    const safeQuantity = Math.max(0, Math.min(9999, Math.floor(Number.isFinite(value) ? value : product.moq)));

    setQuantities((prev) => ({
      ...prev,
      [product.id]: safeQuantity
    }));
  };

  const stepProductQuantity = (product: Product, direction: 1 | -1) => {
    const currentQuantity = quantities[product.id] ?? product.moq;
    const nextQuantity =
      direction === 1
        ? Math.max(product.moq, currentQuantity + product.moq)
        : Math.max(0, currentQuantity - product.moq);

    setProductQuantity(product, nextQuantity);
  };

  const renderQuantityPanel = (product: Product, compact = false) => {
    const quantity = quantities[product.id] ?? product.moq;
    const estimate = getOrderEstimate(product, quantity);
    const selectedTier = estimate.tier;
    const rfqPath = getRfqLoginPath(product, quantity, estimate.unitPrice);

    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 ${compact ? 'p-3' : 'p-3.5'} space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Order Quantity
            </div>
            <div className="text-xs text-slate-500">
              MOQ <span className="font-bold text-slate-800">{product.moq} {product.unit}</span>
            </div>
          </div>
          {estimate.isBelowMOQ && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              Below MOQ
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => stepProductQuantity(product, -1)}
            className="h-9 w-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
            aria-label={`Decrease quantity for ${product.sku}`}
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(event) => setProductQuantity(product, Number(event.target.value))}
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-center text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Quantity for ${product.sku}`}
          />
          <button
            type="button"
            onClick={() => stepProductQuantity(product, 1)}
            className="h-9 w-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
            aria-label={`Increase quantity for ${product.sku}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {product.tierPricing.map((tier) => {
            const active = !estimate.isBelowMOQ && selectedTier === tier;

            return (
              <button
                type="button"
                key={`${product.id}-${tier.minQty}`}
                onClick={() => setProductQuantity(product, tier.minQty)}
                className={`rounded-lg border px-2 py-1.5 text-left text-[11px] transition-colors ${
                  active
                    ? 'border-blue-400 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="block font-bold">{formatTierRange(tier, product.unit)}</span>
                <span className="block">{formatCurrency(tier.unitPrice, product.currency)}/unit</span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between gap-3 text-slate-600">
            <span>Applied tier</span>
            <span className="font-bold text-slate-900 text-right">
              {estimate.isBelowMOQ ? 'MOQ required' : selectedTier?.label || 'Wholesale'}
            </span>
          </div>
          <div className="flex justify-between gap-3 text-slate-600">
            <span>Estimated subtotal</span>
            <span className="font-extrabold text-blue-600 text-right">
              {formatCurrency(estimate.subtotal, product.currency)}
            </span>
          </div>
        </div>

        {estimate.isBelowMOQ ? (
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-center"
            onClick={() => setProductQuantity(product, product.moq)}
          >
            Set to MOQ
          </Button>
        ) : (
          <Link to={rfqPath} className="block">
            <Button variant="primary" size="sm" className="w-full justify-center" icon={Tag}>
              Request Quote
            </Button>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Wholesale Product Catalog"
        subtitle="Browse enterprise hardware, server equipment, and commercial supplies with MOQ-based tier pricing."
        breadcrumbs={[{ label: 'Catalog', href: '/products' }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-500'
                }`}
                title="Grid View"
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-500'
                }`}
                title="List View"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Link to="/login?next=/buyer/rfqs/new">
              <Button variant="primary" size="sm" icon={Tag}>
                Create RFQ
              </Button>
            </Link>
          </div>
        }
      />

      <div id="categories" className="mb-6 space-y-3 scroll-mt-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search products by name, SKU, brand, or category..."
            />
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Sort: Featured and Stock</option>
              <option value="moq-low">MOQ: Low to High</option>
              <option value="price-low">Opening Tier: Low to High</option>
              <option value="price-high">Opening Tier: High to Low</option>
              <option value="savings-high">Best Tier Savings</option>
              <option value="stock-high">Available Stock</option>
            </select>
          </div>
        </div>

        <FilterBar
          filters={[
            {
              id: 'cat',
              label: 'Category',
              value: selectedCategory,
              onChange: updateCategory,
              options: mockCategories.map((category) => ({ label: category.name, value: category.name }))
            },
            {
              id: 'brand',
              label: 'Brand',
              value: selectedBrand,
              onChange: setSelectedBrand,
              options: brands.map((brand) => ({ label: brand, value: brand }))
            }
          ]}
          hasActiveFilters={selectedCategory !== 'ALL' || selectedBrand !== 'ALL' || searchTerm !== ''}
          onReset={resetFilters}
          extraActions={
            <span className="text-xs text-slate-500 font-medium">
              Found <strong className="text-slate-900">{filteredProducts.length}</strong> wholesale SKUs
            </span>
          }
        />
      </div>

      {paginatedProducts.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching wholesale products"
          description="Try another SKU, brand, or category. MOQ and tier-price filters reset with the catalog search."
          actionText="Reset Filters"
          onAction={resetFilters}
          actionIcon={Package}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => {
            const quantity = quantities[product.id] ?? product.moq;
            const estimate = getOrderEstimate(product, quantity);
            const bestTier = getBestTier(product);

            return (
              <Card
                key={product.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200"
              >
                <div>
                  <div className="h-48 bg-slate-100 rounded-lg overflow-hidden relative mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2">
                      <StatusBadge status={product.status} size="sm" />
                    </div>
                    <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded font-semibold">
                      MOQ: {product.moq} {product.unit}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-slate-500 mb-1">
                    <span className="font-semibold text-blue-600">{product.sku}</span>
                    <span className="truncate">{product.brand}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{product.name}</h3>

                  <div className="mt-3 bg-white rounded-lg border border-slate-200 text-xs overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Volume Tier Pricing
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <TrendingDown className="w-3 h-3" />
                        Best {formatCurrency(bestTier.unitPrice, product.currency)}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {product.tierPricing.map((tier) => {
                        const active = !estimate.isBelowMOQ && estimate.tier === tier;

                        return (
                          <button
                            type="button"
                            key={`${product.id}-grid-${tier.minQty}`}
                            onClick={() => setProductQuantity(product, tier.minQty)}
                            className={`w-full px-3 py-2 flex items-center justify-between gap-3 text-left transition-colors ${
                              active ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span>
                              <span className="font-semibold">{formatTierRange(tier, product.unit)}</span>
                              {tier.label && <span className="block text-[10px] text-slate-400">{tier.label}</span>}
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatCurrency(tier.unitPrice, product.currency)}/unit
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                      Available Stock
                    </span>
                    <span className="font-semibold text-slate-800">
                      {product.availableStock.toLocaleString()} {product.unit}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {renderQuantityPanel(product)}
                  <Link to={`/products/${product.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      View Product Detail
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedProducts.map((product) => {
            const quantity = quantities[product.id] ?? product.moq;
            const estimate = getOrderEstimate(product, quantity);
            const bestTier = getBestTier(product);

            return (
              <Card key={product.id} className="p-4 hover:shadow-sm transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
                  <div className="flex flex-col sm:flex-row gap-4 min-w-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-lg border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-blue-600">{product.sku}</span>
                        <span>{product.brand}</span>
                        <StatusBadge status={product.status} size="sm" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{product.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                          <span className="block text-slate-500">MOQ</span>
                          <span className="font-bold text-slate-900">{product.moq} {product.unit}</span>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                          <span className="block text-slate-500">Best Tier</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(bestTier.unitPrice, product.currency)}/unit
                          </span>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                          <span className="block text-slate-500">Selected Total</span>
                          <span className="font-bold text-blue-600">
                            {formatCurrency(estimate.subtotal, product.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {product.tierPricing.map((tier) => {
                          const active = !estimate.isBelowMOQ && estimate.tier === tier;

                          return (
                            <button
                              type="button"
                              key={`${product.id}-list-${tier.minQty}`}
                              onClick={() => setProductQuantity(product, tier.minQty)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                active
                                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {formatTierRange(tier, product.unit)} at {formatCurrency(tier.unitPrice, product.currency)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {renderQuantityPanel(product, true)}
                    <Link to={`/products/${product.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Details and Specs
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
