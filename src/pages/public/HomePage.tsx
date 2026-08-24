import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  CheckCircle2,
  CreditCard,
  FileQuestion,
  FileText,
  Package,
  ShieldCheck,
  Star,
  TrendingUp,
  Truck,
  Warehouse
} from 'lucide-react';
import { Button, Card, StatusBadge } from '../../components/ui';
import { mockCategories, mockProducts } from '../../data/mockData';
import { formatCurrency, formatTierRange, getBestTier, getRfqLoginPath } from '../../utils/pricing';
import { getCategorySummaries, getProductSupplier, getStockLabel } from '../../utils/publicCatalog';
import { applyPublicImageFallback } from '../../utils/publicImages';

export const HomePage: React.FC = () => {
  const categories = useMemo(() => getCategorySummaries(mockCategories, mockProducts), []);
  const featuredProducts = mockProducts.filter((product) => product.featured).slice(0, 4);
  const heroMarketplaceImage =
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=90';
  const heroProducts = useMemo(() => {
    const preferredCategories = [
      'Enterprise IT & Monitors',
      'Commercial Office Equipment',
      'Industrial Power & UPS',
      'Security & Surveillance'
    ];

    return preferredCategories
      .map((category) => mockProducts.find((product) => product.category === category))
      .filter((product): product is (typeof mockProducts)[number] => Boolean(product));
  }, []);

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-24 bg-slate-100" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:items-center lg:px-8 lg:py-10 xl:gap-10">
          <div className="flex flex-col justify-center">
            <div className="wh-fade-up inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Verified B2B Wholesale Marketplace
            </div>
            <h1 className="wh-fade-up mt-4 max-w-3xl text-3xl font-extrabold leading-[1.04] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              Wholesale products with better business pricing.
            </h1>
            <p className="wh-fade-up mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base lg:text-[17px]">
              Discover distributor-backed inventory with MOQ rules, tier pricing, negotiated RFQs,
              business credit workflows, purchase orders, invoices, and regional freight tracking.
            </p>

            <div className="wh-fade-up mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/register" className="block">
                <Button variant="outline" size="lg" icon={Building2} className="h-12 w-full sm:w-auto">
                  Create Business Account
                </Button>
              </Link>
              <Link to="/products" className="inline-flex items-center justify-center gap-1 text-sm font-extrabold text-slate-700 hover:text-slate-950">
                Browse all products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/categories" className="inline-flex items-center justify-center gap-1 text-sm font-extrabold text-blue-700 hover:text-blue-900">
                Explore categories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="wh-fade-up mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['480+', 'Verified buyers'],
                ['2,400+', 'Products available through suppliers'],
                ['Guided', 'Verification workflow']
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <div className="text-xl font-extrabold text-slate-950 lg:text-2xl">{value}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="wh-fade-up relative">
            <div className="rounded-[28px] border border-slate-200 bg-slate-100 p-3 shadow-xs sm:p-4">
              <div className="wh-float overflow-hidden rounded-3xl border border-white bg-white shadow-xl">
                <img
                  src={heroMarketplaceImage}
                  alt="Wholesale warehouse inventory and procurement operations"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(event) => applyPublicImageFallback(event, 'Warehouse inventory')}
                  className="h-48 w-full object-cover sm:h-56 lg:h-60"
                />
                <div className="p-4 pb-5 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Live wholesale catalog</div>
                      <div className="mt-1 text-lg font-extrabold text-slate-950">{mockProducts.length} featured SKUs</div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">
                        Marketplace coverage spans IT, office equipment, power, storage, and security.
                      </div>
                    </div>
                    <StatusBadge status="Verified" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {heroProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(event) => applyPublicImageFallback(event, product.name)}
                          className="h-14 w-full rounded-lg object-cover"
                        />
                        <div className="mt-2 truncate text-[10px] font-bold text-slate-700">{product.sku}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    <TrendingUp className="h-4 w-4" />
                    Tier savings
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-950">24.8%</div>
                  <div className="text-xs text-slate-500">average discount versus retail benchmarks</div>
                </div>
                <div className="hidden rounded-2xl border border-blue-200 bg-white p-3.5 shadow-lg sm:block">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-700">
                    <Warehouse className="h-4 w-4" />
                    Stock visibility
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-950">3 hubs</div>
                  <div className="text-xs text-slate-500">Phnom Penh, Siem Reap, Battambang</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {[
            { icon: BadgeCheck, label: 'Verified suppliers' },
            { icon: ShieldCheck, label: 'Secure purchasing' },
            { icon: TrendingUp, label: 'Wholesale pricing' },
            { icon: CreditCard, label: 'Flexible payment terms' },
            { icon: Truck, label: 'Shipment tracking' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Icon className="h-5 w-5 text-blue-700" />
                <span className="text-sm font-bold text-slate-800">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Featured Categories</h2>
            <p className="mt-1 text-sm text-slate-600">RFQ-ready category paths for corporate procurement teams.</p>
          </div>
          <Link to="/categories">
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              View All Categories
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="group rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Card className="h-full overflow-hidden rounded-2xl transition group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-lg">
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  {category.heroImage && (
                    <img
                      src={category.heroImage}
                      alt={`${category.name} wholesale category`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(event) => applyPublicImageFallback(event, category.name)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="text-base font-extrabold text-slate-950 group-hover:text-blue-700">{category.name}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {category.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-slate-700">{category.itemCount} products</span>
                    <span className="font-bold text-blue-700">Explore</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Featured Wholesale Products</h2>
              <p className="mt-1 text-sm text-slate-600">Published MOQ and tier pricing previews for high-volume demand items.</p>
            </div>
            <Link to="/products">
              <Button variant="primary" size="sm" icon={Package}>
                Browse Catalog
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => {
              const openingTier = product.tierPricing[0];
              const bestTier = getBestTier(product);
              const rfqPath = getRfqLoginPath(product, product.moq, openingTier?.unitPrice || product.basePrice);

              return (
                <Card key={product.id} className="group flex h-full flex-col overflow-hidden rounded-2xl transition hover:border-blue-200 hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(event) => applyPublicImageFallback(event, product.name)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                    <div className="absolute left-3 top-3">
                      <StatusBadge status={getStockLabel(product)} size="sm" />
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-white">
                      MOQ {product.moq}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider">
                      <span className="font-mono text-blue-700">{product.sku}</span>
                      <span className="truncate text-slate-500">{product.category}</span>
                    </div>
                    <h3 className="mt-2 text-base font-extrabold leading-snug text-slate-950">{product.name}</h3>
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {getProductSupplier(product)}
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Starting price</span>
                        <span className="font-extrabold text-blue-700">
                          {formatCurrency(openingTier?.unitPrice || product.basePrice, product.currency)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between gap-3 border-t border-slate-200 pt-2">
                        <span className="text-slate-500">{formatTierRange(bestTier, product.unit)}</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(bestTier.unitPrice, product.currency)}</span>
                      </div>
                    </div>
                    <div className="mt-auto grid grid-cols-1 gap-2 pt-5">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link to={rfqPath}>
                        <Button variant="primary" size="sm" className="w-full">
                          Request Quote
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">How WholesaleHub Works</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A business-first purchasing flow from company verification through RFQ negotiation, purchase orders,
              invoices, and shipment tracking.
            </p>
            <Link to="/how-it-works" className="mt-5 inline-flex">
              <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                See Workflow
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              ['Register your business', Building2],
              ['Complete verification', ShieldCheck],
              ['Explore wholesale pricing', TrendingUp],
              ['Request quote or place order', FileQuestion],
              ['Track invoices and shipments', Truck]
            ].map(([label, Icon], index) => {
              const StepIcon = Icon as typeof Building2;
              return (
                <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">Step {index + 1}</div>
                  <div className="mt-1 text-sm font-extrabold text-slate-950">{label as string}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-950">Business Benefits</h2>
            <p className="mt-1 text-sm text-slate-600">Built around commercial procurement requirements, not consumer checkout.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['MOQ and tier pricing', Boxes],
              ['Negotiated quotations', FileQuestion],
              ['Purchase-order management', FileText],
              ['Credit terms', CreditCard],
              ['Multi-warehouse availability', Warehouse],
              ['Shipment tracking', Truck]
            ].map(([label, Icon]) => {
              const BenefitIcon = Icon as typeof Boxes;
              return (
                <div key={label as string} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                    <BenefitIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-950">{label as string}</div>
                    <div className="mt-1 text-sm leading-relaxed text-slate-600">
                      Operational controls for verified companies buying at volume.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card title="Featured Suppliers & Partners" subtitle="Distributor-backed commercial product sources.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {['Dell Commercial', 'Cisco Distribution', 'APC Power Systems', 'HP Enterprise Print'].map((supplier) => (
                <div key={supplier} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-extrabold text-white">
                      {supplier.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-950">{supplier}</div>
                      <div className="text-xs font-semibold text-emerald-700">Verified supplier network</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="B2B Buyer Testimonials" subtitle="Procurement feedback from verified companies.">
            <div className="space-y-4">
              {[
                ['ABC Technology Ltd.', 'WholesaleHub consolidated RFQs, credit terms, and shipment tracking into one procurement workspace.'],
                ['Angkor Cloud Solutions', 'The tier-pricing previews helped our team plan server and storage purchases before negotiation.']
              ].map(([company, quote]) => (
                <div key={company} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">"{quote}"</p>
                  <div className="mt-3 text-xs font-extrabold uppercase tracking-wider text-blue-700">{company}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-200">
                <CheckCircle2 className="h-4 w-4" />
                Ready for verified B2B purchasing
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Register your company or browse the catalog today.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Start with public category discovery, then unlock quote workflows, credit review, purchase orders,
                invoices, and logistics after business verification.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Create Business Account
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg" className="w-full border-white/25 bg-white/10 text-white hover:bg-white/15 sm:w-auto">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
