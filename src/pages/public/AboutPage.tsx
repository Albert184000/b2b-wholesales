import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileCheck,
  Package,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Warehouse
} from 'lucide-react';
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui';
import { mockCategories, mockProducts } from '../../data/mockData';
import { formatCurrency } from '../../utils/pricing';
import { getCategorySummaries } from '../../utils/publicCatalog';
import { applyPublicImageFallback } from '../../utils/publicImages';

const heroImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=90';

const workflowSteps = [
  {
    title: 'Discover wholesale inventory',
    description: 'Browse public categories, SKUs, MOQ rules, stock status, and starting volume tiers.',
    icon: Package
  },
  {
    title: 'Register the business',
    description: 'Submit company details and supporting documents before requesting portal access.',
    icon: FileCheck
  },
  {
    title: 'Request pricing',
    description: 'Verified buyers can move from catalog discovery into RFQs, quotations, and purchase orders.',
    icon: ClipboardList
  },
  {
    title: 'Track fulfillment',
    description: 'Purchase activity connects to invoices, contracts, warehouse allocation, and shipment status.',
    icon: Truck
  }
];

const buyerBenefits = [
  'MOQ-aware product discovery',
  'Starting wholesale tier previews',
  'RFQ-ready purchasing workflow',
  'Credit and payment-term visibility'
];

const supplierBenefits = [
  'Structured product presentation',
  'Verified business-buyer audience',
  'Cleaner quote and order handoff',
  'Category visibility for demand planning'
];

export const AboutPage: React.FC = () => {
  const categorySummaries = useMemo(() => getCategorySummaries(mockCategories, mockProducts), []);
  const supplierCount = useMemo(
    () => new Set(mockProducts.map((product) => product.brand)).size,
    []
  );
  const featuredCategories = categorySummaries.slice(0, 4);
  const openingPrice = Math.min(
    ...mockProducts.map((product) => product.tierPricing[0]?.unitPrice || product.basePrice)
  );

  const stats = [
    { label: 'Public catalog SKUs', value: mockProducts.length.toLocaleString(), icon: Boxes },
    { label: 'Wholesale categories', value: mockCategories.length, icon: Warehouse },
    { label: 'Supplier brands', value: supplierCount, icon: Users },
    { label: 'Opening tier from', value: formatCurrency(openingPrice), icon: TrendingUp }
  ];

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:px-8">
          <div>
            <div className="mb-5">
              <PageHeader
                title="About WholesaleHub"
                subtitle="A B2B wholesale marketplace UI for verified purchasing, quote workflows, tier pricing, and operational visibility."
                breadcrumbs={[{ label: 'About' }]}
                className="mb-0 border-b-0 pb-0"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Verified business commerce
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Wholesale buying should feel organized before the first quote.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              WholesaleHub brings product discovery, business verification, RFQs, pricing tiers, purchase
              orders, invoices, and shipment visibility into one consistent B2B purchasing experience.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="block">
                <Button variant="primary" size="lg" icon={Building2} className="w-full sm:w-auto">
                  Create Business Account
                </Button>
              </Link>
              <Link to="/products" className="block">
                <Button variant="outline" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src={heroImage}
              alt="Warehouse racks and wholesale inventory operations"
              loading="eager"
              referrerPolicy="no-referrer"
              onError={(event) => applyPublicImageFallback(event, 'Wholesale operations')}
              className="h-64 w-full object-cover sm:h-80 lg:h-96"
            />
            <div className="grid grid-cols-2 gap-0 border-t border-slate-200 bg-white">
              <div className="border-r border-slate-200 p-4">
                <div className="text-2xl font-extrabold text-slate-950">{mockProducts.length}</div>
                <div className="text-xs font-semibold text-slate-500">Mock wholesale SKUs</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-extrabold text-slate-950">3</div>
                <div className="text-xs font-semibold text-slate-500">Fulfillment hubs shown</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card title="Who We Are" className="border-slate-200">
            <p className="text-sm leading-relaxed text-slate-600">
              WholesaleHub is a public-facing B2B commerce experience for companies that buy in volume.
              It is designed around business accounts, document verification, MOQ thresholds, negotiated
              pricing, and post-order visibility.
            </p>
          </Card>
          <Card title="What WholesaleHub Does" className="border-slate-200">
            <p className="text-sm leading-relaxed text-slate-600">
              The platform connects public product discovery to buyer workflows such as RFQs, quotes,
              purchase orders, contracts, invoices, inventory allocation, and shipment tracking in the
              authenticated portals.
            </p>
          </Card>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Benefits for Buyers" className="border-slate-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {buyerBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Benefits for Suppliers" className="border-slate-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {supplierBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Platform Workflow</h2>
            <p className="mt-1 text-sm text-slate-600">A clear path from public discovery to verified buyer operations.</p>
          </div>
          <StatusBadge status="B2B Ready" showDot={false} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="border-slate-200">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
          <Card className="border-slate-200 bg-slate-950 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-blue-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold">Trust and verification</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Public browsing is open, while business purchasing actions are guided through account
              registration, document review, and buyer portal access.
            </p>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ['Business identity', 'Company names, registration numbers, tax records, and contact details are presented as part of onboarding.'],
              ['Document readiness', 'The registration flow captures licenses, tax documents, and optional finance files for staff review.'],
              ['Commercial controls', 'Pricing tiers, credit visibility, RFQ workflows, and purchase records are separated from casual browsing.'],
              ['Operational visibility', 'Inventory, invoices, contracts, and shipments are represented across buyer and staff workspaces.']
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-extrabold text-slate-900">{title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-extrabold text-slate-950">{stat.value}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</div>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-200 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="font-extrabold text-slate-900 group-hover:text-blue-700">{category.name}</div>
              <div className="mt-1 text-xs text-slate-500">{category.itemCount} products</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 text-white sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold">Ready to source for your business?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Start with public catalog discovery, then register when your team is ready for RFQs and buyer workflows.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="block">
              <Button variant="primary" size="lg" icon={Building2} className="w-full sm:w-auto">
                Register Business
              </Button>
            </Link>
            <Link to="/categories" className="block">
              <Button variant="outline" size="lg" icon={ArrowRight} iconPosition="right" className="w-full border-slate-600 bg-white/10 text-white hover:bg-white/15 sm:w-auto">
                Explore Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
