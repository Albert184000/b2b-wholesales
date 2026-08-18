import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Package,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Boxes,
  Warehouse,
  FileQuestion,
  Receipt,
  Truck
} from 'lucide-react';
import { Button, Card, KPICard, StatusBadge } from '../../components/ui';
import { mockProducts, mockCategories } from '../../data/mockData';
import {
  formatCurrency,
  formatTierRange,
  getBestTier,
  getRfqLoginPath
} from '../../utils/pricing';

export const HomePage: React.FC = () => {
  const featuredProducts = mockProducts.filter((product) => product.featured).slice(0, 3);
  const heroImage = mockProducts[1]?.images[0] || mockProducts[0]?.images[0];

  return (
    <div className="space-y-14 sm:space-y-16 py-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white min-h-[520px] sm:min-h-[500px] shadow-xl border border-slate-800">
          <img
            src={heroImage}
            alt="Enterprise wholesale hardware distribution"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-950/75" />

          <div className="relative z-10 h-full min-h-[520px] sm:min-h-[500px] flex flex-col justify-center p-6 sm:p-10 lg:p-16">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Verified B2B Wholesale Infrastructure
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Wholesale purchasing built for modern businesses.
              </h1>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl">
                Procure enterprise IT, industrial equipment, servers, and commercial components
                with MOQ enforcement, live tier-pricing estimates, RFQ negotiation, revolving
                credit terms, and regional freight coordination.
              </p>

              <div className="flex flex-col min-[520px]:flex-row gap-3 pt-2">
                <Link to="/products" className="block">
                  <Button variant="primary" size="lg" icon={Package} className="w-full min-[520px]:w-auto">
                    Browse Wholesale Catalog
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full min-[520px]:w-auto bg-white/10 text-white border-white/25 hover:bg-white/15"
                  >
                    Create Business Account
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 max-w-3xl">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-xs">
                  <div className="text-xl font-extrabold">$10M+</div>
                  <div className="text-xs text-slate-300 mt-1">Open corporate credit lines</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-xs">
                  <div className="text-xl font-extrabold">2,400+</div>
                  <div className="text-xs text-slate-300 mt-1">Wholesale SKUs and contract items</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-xs">
                  <div className="text-xl font-extrabold">24h</div>
                  <div className="text-xs text-slate-300 mt-1">Standard buyer verification SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Enterprise Buyers"
            value="480+"
            subtext="Verified corporations"
            icon={Building2}
          />
          <KPICard
            title="Wholesale Catalog"
            value="2,400+"
            subtext="Distributor-backed SKUs"
            icon={Boxes}
          />
          <KPICard
            title="Regional Hubs"
            value="3"
            subtext="PNH, REP, and BTB stock points"
            icon={Warehouse}
          />
          <KPICard
            title="Average Savings"
            value="24.8%"
            subtext="Compared with retail benchmarks"
            icon={TrendingUp}
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Wholesale Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Distributor categories with published MOQ thresholds and RFQ-ready volume pricing.
            </p>
          </div>
          <Link to="/products">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View Catalog
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{cat.itemCount} Enterprise SKUs</span>
                <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Browse <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Wholesale Products</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              High-volume demand items with published MOQ and tier-pricing schedules.
            </p>
          </div>
          <Link to="/products">
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              See All Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => {
            const bestTier = getBestTier(product);
            const rfqPath = getRfqLoginPath(product, product.moq, product.tierPricing[0]?.unitPrice || product.basePrice);

            return (
              <Card key={product.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="h-48 bg-slate-100 rounded-lg overflow-hidden relative mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2">
                      <StatusBadge status="Active" size="sm" />
                    </div>
                    <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                      MOQ: {product.moq} {product.unit}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11px] font-mono font-semibold uppercase">
                    <span className="text-blue-600">{product.sku}</span>
                    <span className="text-slate-500 truncate">{product.brand}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">{product.name}</h3>

                  <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                      Published Volume Pricing
                    </div>
                    {product.tierPricing.slice(0, 3).map((tier) => (
                      <div key={`${product.id}-${tier.minQty}`} className="flex justify-between gap-3 text-slate-600">
                        <span>{formatTierRange(tier, product.unit)}</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(tier.unitPrice, product.currency)}/unit
                        </span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Best listed tier</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(bestTier.unitPrice, product.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link to={`/products/${product.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      View Specs
                    </Button>
                  </Link>
                  <Link to={rfqPath} className="block">
                    <Button variant="primary" size="sm" className="w-full">
                      Request Quote
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">How B2B Purchasing Works</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Streamlined commercial procurement from account approval to freight delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Apply for Account',
                copy: 'Submit business registration and tax certificate details for buyer verification.'
              },
              {
                icon: FileQuestion,
                title: 'Request Quote',
                copy: 'Choose MOQ-compliant quantities and submit target prices for account review.'
              },
              {
                icon: Receipt,
                title: 'Confirm PO',
                copy: 'Convert approved quotes to purchase orders against Net 30/60 facilities.'
              },
              {
                icon: Truck,
                title: 'Track Delivery',
                copy: 'Monitor pallet dispatch, invoices, and proof-of-delivery from regional hubs.'
              }
            ].map((step, index) => {
              const StepIcon = step.icon;

              return (
                <div key={step.title} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                    Step {index + 1}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4" /> Corporate credit and buyer verification
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Ready to streamline company procurement?</h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Join corporations and system integrators sourcing contract hardware through WholesaleHub.
            </p>
          </div>
          <Link to="/register" className="block w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 border-transparent font-bold">
              Apply for Business Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
