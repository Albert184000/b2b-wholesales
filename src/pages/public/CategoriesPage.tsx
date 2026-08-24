import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Package, SearchX, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Button, Card, EmptyState, PageHeader, SearchBar, StatusBadge } from '../../components/ui';
import { mockCategories, mockProducts } from '../../data/mockData';
import { formatCurrency, getBestTier } from '../../utils/pricing';
import { getCategorySummaries } from '../../utils/publicCatalog';
import { applyPublicImageFallback } from '../../utils/publicImages';

export const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const categories = useMemo(() => getCategorySummaries(mockCategories, mockProducts), []);
  const query = searchTerm.trim().toLowerCase();
  const filteredCategories = categories.filter((category) =>
    [category.name, category.description, category.slug]
      .join(' ')
      .toLowerCase()
      .includes(query)
  );
  const popularCategories = categories
    .slice()
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 4);

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PageHeader
            title="Wholesale Categories"
            subtitle="Explore verified B2B product families with MOQ rules, published tiers, and RFQ-ready stock."
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Categories' }
            ]}
            className="mb-0 pb-0 border-b-0"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search categories, products, or supplier focus..."
              inputClassName="h-11"
            />
            <Link to="/products" className="block">
              <Button variant="primary" size="md" icon={Package} className="h-11 w-full">
                Browse All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Verified categories', value: categories.length, icon: ShieldCheck },
            { label: 'Wholesale SKUs', value: mockProducts.length, icon: Boxes },
            { label: 'Featured assortments', value: mockProducts.filter((product) => product.featured).length, icon: TrendingUp }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
                    <div className="text-xs font-semibold text-slate-500">{stat.label}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredCategories.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No categories found"
            description="Try searching for servers, networking, office equipment, power, storage, or security."
            actionText="Clear Search"
            actionIcon={Sparkles}
            onAction={() => setSearchTerm('')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => {
              const openingProduct = category.products[0];
              const openingPrice = openingProduct
                ? formatCurrency(openingProduct.tierPricing[0]?.unitPrice || openingProduct.basePrice, openingProduct.currency)
                : 'RFQ';

              return (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Card className="flex h-full flex-col overflow-hidden rounded-2xl transition-all group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-lg">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      {category.heroImage && (
                        <img
                          src={category.heroImage}
                          alt={`${category.name} category`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(event) => applyPublicImageFallback(event, category.name)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                        <StatusBadge status="Verified" size="sm" />
                        <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-slate-900 shadow-sm">
                          {category.itemCount} products
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700">{category.name}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                        {category.description}
                      </p>
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                        <div className="font-bold uppercase tracking-wider text-slate-500">Opening wholesale tier</div>
                        <div className="mt-1 text-base font-extrabold text-blue-700">{openingPrice}</div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {category.products.slice(0, 3).map((product) => (
                          <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                            <span className="min-w-0 truncate font-semibold text-slate-700">{product.name}</span>
                            <span className="shrink-0 font-mono text-slate-500">{product.sku}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-5">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                          Explore category <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Popular Category Paths</h2>
              <p className="text-sm text-slate-500">Fast paths for common corporate procurement teams.</p>
            </div>
            <Link to="/products" className="text-sm font-bold text-blue-700 hover:text-blue-900">
              View full catalog
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {popularCategories.map((category) => {
              const bestProduct = category.products[0];
              const bestTier = bestProduct ? getBestTier(bestProduct) : null;

              return (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="text-sm font-extrabold text-slate-900">{category.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{category.itemCount} products available</div>
                  {bestProduct && bestTier && (
                    <div className="mt-3 text-xs text-slate-600">
                      Best tier from{' '}
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(bestTier.unitPrice, bestProduct.currency)}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
