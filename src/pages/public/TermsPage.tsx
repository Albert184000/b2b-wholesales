import React from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ClipboardList,
  CreditCard,
  FileQuestion,
  FileText,
  Mail,
  Package,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { Alert, Card, PageHeader, StatusBadge } from '../../components/ui';

const sections = [
  {
    id: 'account-eligibility',
    title: 'Account Eligibility',
    icon: BadgeCheck,
    body:
      'WholesaleHub is designed for businesses, institutions, resellers, contractors, and other commercial buyers. Public catalog browsing is available before approval, but buyer portal purchasing workflows require an eligible business account.'
  },
  {
    id: 'business-registration',
    title: 'Business Registration',
    icon: Building2,
    body:
      'Applicants should provide accurate company details, contact information, tax or registration identifiers, and supporting business documents. Incomplete or inconsistent submissions may remain pending until corrected.'
  },
  {
    id: 'buyer-verification',
    title: 'Buyer Verification',
    icon: ShieldCheck,
    body:
      'Verification may include business identity review, document review, contact confirmation, buyer group assignment, and credit profile setup. Approval is not guaranteed by submitting the public form.'
  },
  {
    id: 'product-information',
    title: 'Product Information',
    icon: Package,
    body:
      'Product names, SKUs, images, availability labels, specifications, and documents are shown for UI demonstration and catalog planning. Final product details should be confirmed in the quote or order record.'
  },
  {
    id: 'wholesale-pricing',
    title: 'Wholesale Pricing',
    icon: CreditCard,
    body:
      'Public prices are starting wholesale tier previews. Buyer-specific pricing, discounts, taxes, freight, and payment terms may be confirmed through RFQs, quotations, contracts, or purchase orders.'
  },
  {
    id: 'moq',
    title: 'Minimum Order Quantity',
    icon: ShoppingBag,
    body:
      'Each SKU may have a minimum order quantity and volume tier thresholds. Quantities below MOQ may require adjustment before a quotation or purchase order can be processed.'
  },
  {
    id: 'rfq-quotations',
    title: 'RFQs and Quotations',
    icon: FileQuestion,
    body:
      'Requests for quotation allow buyers and staff to clarify items, quantities, requested delivery dates, notes, and commercial terms. A quotation should be reviewed for validity period, line pricing, taxes, and shipping terms before acceptance.'
  },
  {
    id: 'purchase-orders',
    title: 'Purchase Orders',
    icon: ClipboardList,
    body:
      'Purchase orders represent buyer intent to purchase according to accepted terms. Orders may require approval, inventory allocation, credit checks, and fulfillment confirmation before shipment.'
  },
  {
    id: 'payments',
    title: 'Payments and Credit',
    icon: FileText,
    body:
      'Payment methods, invoice due dates, credit limits, and temporary credit holds are managed through account and finance workflows. Buyers are responsible for keeping billing contacts current.'
  },
  {
    id: 'shipments',
    title: 'Shipments and Delivery',
    icon: Truck,
    body:
      'Shipment status depends on stock availability, warehouse preparation, carrier pickup, delivery location, and order-specific handling requirements. Tracking information is informational until confirmed by operations.'
  },
  {
    id: 'cancellations',
    title: 'Cancellations and Changes',
    icon: AlertTriangle,
    body:
      'Cancellation or change requests may be limited after quote acceptance, order approval, inventory allocation, carrier handoff, or special procurement commitments.'
  },
  {
    id: 'prohibited-use',
    title: 'Prohibited Use',
    icon: ShieldAlert,
    body:
      'Users should not submit false business information, misuse account access, attempt unauthorized portal access, copy confidential pricing, interfere with system operation, or use the platform for unlawful transactions.'
  },
  {
    id: 'account-suspension',
    title: 'Account Suspension',
    icon: ShieldAlert,
    body:
      'Accounts may be placed on hold or suspended for inaccurate records, unpaid balances, suspected misuse, document issues, credit risk, or violation of commercial terms.'
  },
  {
    id: 'limitations',
    title: 'Limitations and Disclaimer',
    icon: Scale,
    body:
      'This frontend is a UI implementation and mock-data experience. Production terms should be reviewed by legal counsel and aligned with live backend behavior, supplier agreements, finance controls, and regional law.'
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    icon: FileText,
    body:
      'Terms may be updated as product workflows, buyer policies, payment options, fulfillment rules, or marketplace operations change. The last-updated date should reflect the active production version.'
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: Mail,
    body:
      'Questions about these terms can be routed through the Contact page or sent to legal@wholesalehub.com with the company name and account or application reference when available.'
  }
];

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Terms & Conditions"
          subtitle="Commercial terms for business registration, wholesale catalog use, RFQs, purchase orders, payments, shipments, and account conduct."
          badge={<StatusBadge status="Current" showDot={false} />}
          breadcrumbs={[{ label: 'Terms & Conditions' }]}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <Card title="Contents" subtitle="B2B terms sections" className="border-slate-200">
              <nav className="grid grid-cols-1 gap-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </Card>
          </aside>

          <main className="min-w-0 space-y-6">
            <Card className="border-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Last updated</div>
                  <div className="mt-1 text-xl font-extrabold text-slate-950">August 24, 2026</div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                    These UI terms describe the intended B2B marketplace experience. They are not a substitute
                    for final production legal terms, supplier contracts, or finance policy documentation.
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                  <Scale className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Alert type="warning" title="Production review required">
              The wording on this page is polished UI content. It should be reviewed and adapted before a live
              commerce launch, especially for payments, credit, cancellations, taxes, and delivery obligations.
            </Alert>

            <div className="grid grid-cols-1 gap-4">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} id={section.id} className="scroll-mt-32 border-slate-200">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Section {String(index + 1).padStart(2, '0')}
                        </div>
                        <h2 className="mt-1 text-lg font-extrabold text-slate-900">{section.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.body}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card title="Terms Contact" className="border-slate-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</div>
                  <div className="mt-1 break-words text-sm font-extrabold text-blue-700">legal@wholesalehub.com</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Public support</div>
                  <div className="mt-1 text-sm font-extrabold text-slate-900">Use the Contact page for commercial questions</div>
                </div>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};
