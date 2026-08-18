import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, List, Package, SearchX, Tag, Warehouse } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  FilterBar,
  PageHeader,
  Pagination,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { BuyerProductCard } from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { mockBuyerWarehouseAvailability, mockCategories } from '../../data/mockData';
import { Product } from '../../types';
import {
  formatCurrency,
  formatTierRange,
  getBuyerPriceRange,
  getBuyerUnitPriceForTier
} from '../../utils/pricing';

const pageSize = 6;

export const BuyerProductCatalogPage: React.FC = () => {
  const { products, currentBuyer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [priceRangeFilter, setPriceRangeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const buyerGroup = currentBuyer.buyerGroup;

  const brands = useMemo(
    () => Array.from(new Set<string>(products.map((product) => product.brand))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const getAvailabilityTotal = (product: Product) => {
    const availability = mockBuyerWarehouseAvailability[product.id] || [];
    return availability.reduce((sum, item) => sum + item.available, 0) || product.availableStock;
  };

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const matchesPriceRange = (product: Product) => {
      const range = getBuyerPriceRange(product, buyerGroup);

      switch (priceRangeFilter) {
        case 'under-250':
          return range.min < 250;
        case '250-1000':
          return range.min >= 250 && range.min <= 1000;
        case 'over-1000':
          return range.min > 1000;
        default:
          return true;
      }
    };

    const matchesAvailability = (product: Product) => {
      const totalAvailable = getAvailabilityTotal(product);

      switch (availabilityFilter) {
        case 'ready':
          return totalAvailable >= product.moq;
        case 'deep-stock':
          return totalAvailable >= product.moq * 10;
        case 'low':
          return totalAvailable > 0 && totalAvailable < product.moq * 5;
        default:
          return true;
      }
    };

    return products
      .filter((product) => {
        const searchText = [
          product.name,
          product.sku,
          product.brand,
          product.category,
          product.description
        ]
          .join(' ')
          .toLowerCase();

        return (
          (query === '' || searchText.includes(query)) &&
          (selectedCategory === 'ALL' || product.category === selectedCategory) &&
          (selectedBrand === 'ALL' || product.brand === selectedBrand) &&
          matchesAvailability(product) &&
          matchesPriceRange(product)
        );
      })
      .sort((a, b) => {
        const aRange = getBuyerPriceRange(a, buyerGroup);
        const bRange = getBuyerPriceRange(b, buyerGroup);

        switch (sortBy) {
          case 'price-low':
            return aRange.min - bRange.min;
          case 'price-high':
            return bRange.min - aRange.min;
          case 'moq-low':
            return a.moq - b.moq;
          case 'stock-high':
            return getAvailabilityTotal(b) - getAvailabilityTotal(a);
          case 'recommended':
          default:
            return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || getAvailabilityTotal(b) - getAvailabilityTotal(a);
        }
      });
  }, [availabilityFilter, buyerGroup, priceRangeFilter, products, searchTerm, selectedBrand, selectedCategory, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrand, availabilityFilter, priceRangeFilter, sortBy]);

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

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setAvailabilityFilter('ALL');
    setPriceRangeFilter('ALL');
    setSortBy('recommended');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Product Catalog"
        subtitle={`Personalized wholesale pricing for ${currentBuyer.companyName} (${buyerGroup} group).`}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Products' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-500'
                }`}
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
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Link to="/buyer/rfqs">
              <Button variant="primary" size="sm" icon={Tag}>
                Request Quote
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="border-slate-200">
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search buyer catalog by SKU, product, brand, or category..."
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price-low">Buyer Price: Low to High</option>
              <option value="price-high">Buyer Price: High to Low</option>
              <option value="moq-low">MOQ: Low to High</option>
              <option value="stock-high">Warehouse Stock</option>
            </select>
          </div>

          <FilterBar
            filters={[
              {
                id: 'category',
                label: 'Category',
                value: selectedCategory,
                onChange: setSelectedCategory,
                options: mockCategories.map((category) => ({ label: category.name, value: category.name }))
              },
              {
                id: 'brand',
                label: 'Brand',
                value: selectedBrand,
                onChange: setSelectedBrand,
                options: brands.map((brand) => ({ label: brand, value: brand }))
              },
              {
                id: 'availability',
                label: 'Availability',
                value: availabilityFilter,
                onChange: setAvailabilityFilter,
                options: [
                  { label: 'MOQ Ready', value: 'ready' },
                  { label: 'Deep Stock', value: 'deep-stock' },
                  { label: 'Low Stock', value: 'low' }
                ]
              },
              {
                id: 'price',
                label: 'Price',
                value: priceRangeFilter,
                onChange: setPriceRangeFilter,
                options: [
                  { label: 'Under $250', value: 'under-250' },
                  { label: '$250 to $1,000', value: '250-1000' },
                  { label: 'Over $1,000', value: 'over-1000' }
                ]
              }
            ]}
            hasActiveFilters={
              searchTerm !== '' ||
              selectedCategory !== 'ALL' ||
              selectedBrand !== 'ALL' ||
              availabilityFilter !== 'ALL' ||
              priceRangeFilter !== 'ALL'
            }
            onReset={resetFilters}
            extraActions={
              <span className="text-xs text-slate-500 font-medium">
                <strong className="text-slate-900">{filteredProducts.length}</strong> buyer-priced SKUs
              </span>
            }
          />
        </div>
      </Card>

      {paginatedProducts.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No buyer products match these filters"
          description="Reset the filters or search another SKU to continue browsing your personalized catalog."
          actionText="Reset Filters"
          onAction={resetFilters}
          actionIcon={Package}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
            <BuyerProductCard
              key={product.id}
              product={product}
              buyerGroup={buyerGroup}
              availability={mockBuyerWarehouseAvailability[product.id] || []}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedProducts.map((product) => {
            const range = getBuyerPriceRange(product, buyerGroup);
            const availability = mockBuyerWarehouseAvailability[product.id] || [];
            const totalAvailable = availability.reduce((sum, item) => sum + item.available, 0) || product.availableStock;

            return (
              <Card key={product.id} className="border-slate-200">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
                  <div className="flex flex-col sm:flex-row gap-4 min-w-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-40 w-full sm:h-28 sm:w-28 rounded-lg border border-slate-200 object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-bold text-blue-600">{product.sku}</span>
                        <span>{product.brand}</span>
                        <StatusBadge status={product.status} size="sm" />
                      </div>
                      <h3 className="mt-1 text-base font-extrabold text-slate-900">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{product.description}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {product.tierPricing.slice(0, 3).map((tier) => {
                          const buyerPrice = getBuyerUnitPriceForTier(product, tier, buyerGroup);

                          return (
                            <span
                              key={`${product.id}-${tier.minQty}`}
                              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                            >
                              {formatTierRange(tier, product.unit)}: {formatCurrency(buyerPrice.unitPrice, product.currency)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        Corporate Buyer Price
                      </span>
                      <strong className="mt-1 block text-lg text-slate-900">
                        From {formatCurrency(range.min, product.currency)}/unit
                      </strong>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                        Available
                      </span>
                      <strong className="block text-sm text-slate-900">
                        {totalAvailable.toLocaleString()} {product.unit}
                      </strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/buyer/products/${product.id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full">
                          Details
                        </Button>
                      </Link>
                      <Link to="/buyer/rfqs" className="block">
                        <Button variant="primary" size="sm" className="w-full">
                          Request
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
