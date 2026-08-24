import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Boxes, Grid2X2, SearchX, SlidersHorizontal, Warehouse } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Pagination,
  SearchBar,
  Select,
  StatusBadge
} from '../../components/ui';
import { mockCategories, mockProducts } from '../../data/mockData';
import { Product } from '../../types';
import { formatCurrency, formatTierRange, getBestTier, getRfqLoginPath } from '../../utils/pricing';
import {
  findCategoryBySlug,
  getCategoryHeroImage,
  getCategorySlug,
  getProductSupplier,
  getStockLabel
} from '../../utils/publicCatalog';
import { applyPublicImageFallback } from '../../utils/publicImages';

const pageSize = 6;

const CategoryProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const bestTier = getBestTier(product);
  const startingTier = product.tierPricing[0];
  const rfqPath = getRfqLoginPath(product, product.moq, startingTier?.unitPrice || product.basePrice);

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl transition hover:border-blue-200 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => applyPublicImageFallback(event, product.name)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatusBadge status={getStockLabel(product)} size="sm" />
          <StatusBadge status="Verified" size="sm" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider">
          <span className="font-mono text-blue-700">{product.sku}</span>
          <span className="truncate text-slate-500">{getProductSupplier(product)}</span>
        </div>
        <h2 className="mt-2 text-base font-extrabold leading-snug text-slate-900">{product.name}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="text-slate-500">MOQ</div>
            <div className="font-bold text-slate-900">
              {product.moq} {product.unit}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="text-slate-500">Starts at</div>
            <div className="font-bold text-blue-700">
              {formatCurrency(startingTier?.unitPrice || product.basePrice, product.currency)}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 bg-white text-xs">
          {product.tierPricing.slice(0, 3).map((tier) => (
            <div key={`${product.id}-${tier.minQty}`} className="flex justify-between gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0">
              <span className="text-slate-600">{formatTierRange(tier, product.unit)}</span>
              <span className="font-bold text-slate-900">{formatCurrency(tier.unitPrice, product.currency)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Warehouse className="h-3.5 w-3.5 text-blue-700" />
            Available
          </span>
          <span className="font-bold text-slate-900">
            {product.availableStock.toLocaleString()} {product.unit}
          </span>
        </div>
        <div className="mt-auto grid grid-cols-1 gap-2 pt-5 sm:grid-cols-2">
          <Link to={`/products/${product.id}`} className="block">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          <Link to={rfqPath} className="block">
            <Button variant="primary" size="sm" className="w-full">
              Request Quote
            </Button>
          </Link>
        </div>
        <div className="mt-2 text-[11px] font-semibold text-emerald-700">
          Best listed tier: {formatCurrency(bestTier.unitPrice, product.currency)}
        </div>
      </div>
    </Card>
  );
};

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = findCategoryBySlug(mockCategories, slug);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [maxMoq, setMaxMoq] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  const categoryProducts = useMemo(
    () => (category ? mockProducts.filter((product) => product.category === category.name) : []),
    [category]
  );
  const suppliers = useMemo(
    () => Array.from(new Set(categoryProducts.map(getProductSupplier))).sort(),
    [categoryProducts]
  );
  const heroImage = category ? getCategoryHeroImage(category, mockProducts) : '';
  const relatedCategories = mockCategories.filter((item) => item.id !== category?.id).slice(0, 4);

  useEffect(() => {
    setCurrentPage(1);
  }, [availabilityFilter, maxMoq, searchTerm, sortBy, supplierFilter, slug]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const moqLimit = Number(maxMoq);

    return categoryProducts
      .filter((product) => {
        const searchable = [product.name, product.sku, product.brand, product.description].join(' ').toLowerCase();
        const matchesSearch = !query || searchable.includes(query);
        const matchesSupplier = supplierFilter === 'ALL' || getProductSupplier(product) === supplierFilter;
        const matchesAvailability = availabilityFilter === 'ALL' || getStockLabel(product) === availabilityFilter;
        const matchesMoq = !maxMoq || product.moq <= moqLimit;

        return matchesSearch && matchesSupplier && matchesAvailability && matchesMoq;
      })
      .sort((a, b) => {
        const aPrice = a.tierPricing[0]?.unitPrice || a.basePrice;
        const bPrice = b.tierPricing[0]?.unitPrice || b.basePrice;

        switch (sortBy) {
          case 'price-low':
            return aPrice - bPrice;
          case 'price-high':
            return bPrice - aPrice;
          case 'moq-low':
            return a.moq - b.moq;
          case 'stock-high':
            return b.availableStock - a.availableStock;
          case 'newest':
            return b.id.localeCompare(a.id);
          default:
            return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || aPrice - bPrice;
        }
      });
  }, [availabilityFilter, categoryProducts, maxMoq, searchTerm, sortBy, supplierFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const resetFilters = () => {
    setSearchTerm('');
    setSupplierFilter('ALL');
    setAvailabilityFilter('ALL');
    setMaxMoq('');
    setSortBy('relevance');
  };

  if (!category) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={SearchX}
          title="Category not found"
          description="This wholesale category may have moved or been archived. Browse all active product categories instead."
          actionText="View Categories"
          actionIcon={Grid2X2}
          onAction={() => {
            window.location.href = '/categories';
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        {heroImage && (
          <img
            src={heroImage}
            alt={`${category.name} wholesale category`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => applyPublicImageFallback(event, category.name)}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <PageHeader
            title={category.name}
            subtitle={category.description}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Categories', href: '/categories' },
              { label: category.name }
            ]}
            className="mb-0 border-b-0 pb-0 [&_h1]:text-white [&_p]:text-slate-200 [&_a]:text-blue-200 [&_span]:text-slate-300"
            actions={
              <Link to="/categories">
                <Button variant="outline" size="sm" icon={ArrowLeft} className="bg-white/10 text-white border-white/25 hover:bg-white/15">
                  All Categories
                </Button>
              </Link>
            }
          />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <div className="text-2xl font-extrabold">{categoryProducts.length}</div>
              <div className="text-xs text-slate-300">Wholesale products</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <div className="text-2xl font-extrabold">{suppliers.length}</div>
              <div className="text-xs text-slate-300">Verified suppliers</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <div className="text-2xl font-extrabold">{categoryProducts.filter((product) => product.featured).length}</div>
              <div className="text-xs text-slate-300">Featured items</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] xl:items-end">
            <div>
              <label htmlFor="category-product-search" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Search
              </label>
              <SearchBar
                id="category-product-search"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search products, SKUs, or specs..."
                inputClassName="h-10"
              />
            </div>
            <Select
              label="Supplier"
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
              options={[{ label: 'All Suppliers', value: 'ALL' }, ...suppliers.map((supplier) => ({ label: supplier, value: supplier }))]}
              className="h-10"
            />
            <Select
              label="Availability"
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              options={[
                { label: 'All Stock', value: 'ALL' },
                { label: 'In Stock', value: 'In Stock' },
                { label: 'Low Stock', value: 'Low Stock' },
                { label: 'Out of Stock', value: 'Out of Stock' }
              ]}
              className="h-10"
            />
            <Input
              type="number"
              label="Max MOQ"
              min={0}
              value={maxMoq}
              onChange={(event) => setMaxMoq(event.target.value)}
              placeholder="Any"
              className="h-10"
            />
            <Select
              label="Sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              options={[
                { label: 'Relevance', value: 'relevance' },
                { label: 'Newest', value: 'newest' },
                { label: 'Price: Low to High', value: 'price-low' },
                { label: 'Price: High to Low', value: 'price-high' },
                { label: 'MOQ: Low to High', value: 'moq-low' },
                { label: 'Stock: High to Low', value: 'stock-high' }
              ]}
              className="h-10"
            />
            <Button type="button" variant="outline" size="sm" icon={SlidersHorizontal} onClick={resetFilters} className="h-10">
              Reset
            </Button>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-600">
            Showing <span className="font-extrabold text-slate-900">{filteredProducts.length}</span> products in {category.name}
          </div>
          <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900">
            Open in full catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {paginatedProducts.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No products match these filters"
            description="Reset filters or search another SKU, supplier, or MOQ range."
            actionText="Reset Filters"
            actionIcon={Boxes}
            onAction={resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product) => (
              <CategoryProductCard key={product.id} product={product} />
            ))}
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
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="text-xl font-extrabold text-slate-900">Related Categories</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCategories.map((item) => (
              <Link
                key={item.id}
                to={`/categories/${getCategorySlug(item)}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="font-bold text-slate-900">{item.name}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
