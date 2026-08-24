import React from 'react';
import {
  Building2,
  Clock,
  Cookie,
  Database,
  Eye,
  FileCheck,
  LockKeyhole,
  Mail,
  Server,
  Share2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Alert, Card, PageHeader, StatusBadge } from '../../components/ui';

const sections = [
  {
    id: 'information-collected',
    title: 'Information Collected',
    icon: Database,
    body:
      'WholesaleHub collects information entered into public forms, registration steps, product searches, account recovery forms, and contact requests. This may include company names, contact details, procurement interests, and message content.'
  },
  {
    id: 'business-account-data',
    title: 'Business Account Data',
    icon: Building2,
    body:
      'Business registration UI may capture legal entity name, business type, registration number, tax ID, country, city, address, primary contact, role, business email, phone number, requested credit limit, and estimated purchasing volume.'
  },
  {
    id: 'company-documents',
    title: 'Uploaded Company Documents',
    icon: FileCheck,
    body:
      'The onboarding UI supports company document upload fields such as business licenses, tax registration files, and optional financial statements. Uploaded file names and review states are shown in mock/local UI for demonstration.'
  },
  {
    id: 'usage-data',
    title: 'Usage Data',
    icon: Eye,
    body:
      'The frontend may use local browser behavior such as search parameters, selected filters, recently viewed products, and public navigation state to make the interface easier to use.'
  },
  {
    id: 'cookies',
    title: 'Cookies and Local Storage',
    icon: Cookie,
    body:
      'This public UI may use local storage for convenience features such as recently viewed products. A production deployment may use cookies or similar technologies for security, preferences, and analytics, depending on final configuration.'
  },
  {
    id: 'data-usage',
    title: 'How Data Is Used',
    icon: UserCheck,
    body:
      'Business data is presented for account intake, buyer verification, quote readiness, credit review, support follow-up, order visibility, and marketplace operations. Public catalog browsing does not require a buyer account.'
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    icon: Share2,
    body:
      'Business information may be displayed to authorized staff roles in the buyer approval, finance, sales, warehouse, and support workflows. This UI does not add external data sharing or third-party integrations.'
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    icon: Clock,
    body:
      'Commercial records are shown as retained for business continuity, audit review, account support, and transaction history. Actual retention periods should be configured by the operating business before launch.'
  },
  {
    id: 'security',
    title: 'Security',
    icon: LockKeyhole,
    body:
      'The UI is designed around account roles, clear status labels, document review states, and separated public, buyer, and admin experiences. Real security controls require backend enforcement in production.'
  },
  {
    id: 'user-rights',
    title: 'User Rights and Updates',
    icon: ShieldCheck,
    body:
      'Authorized company contacts should be able to request corrections to account details, document updates, contact changes, or account support through official business channels.'
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: Mail,
    body:
      'Privacy and data questions can be routed to privacy@wholesalehub.com or through the Contact page. Include the company name and application or account reference when available.'
  }
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Privacy Policy"
          subtitle="How the public B2B marketplace UI presents company data, document records, usage behavior, and support channels."
          badge={<StatusBadge status="Current" showDot={false} />}
          breadcrumbs={[{ label: 'Privacy Policy' }]}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <Card title="Contents" subtitle="Policy sections" className="border-slate-200">
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
            <Card className="border-slate-200 bg-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Last updated</div>
                  <div className="mt-1 text-xl font-extrabold text-slate-950">August 24, 2026</div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                    This page is UI content for the WholesaleHub demo storefront. It describes the information
                    categories represented in the interface and should be reviewed by counsel before production use.
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                  <Server className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Alert type="info" title="No unimplemented compliance claim">
              This public UI does not claim a specific legal certification, regulatory framework, or backend
              data-processing guarantee. Production legal language should match the deployed system.
            </Alert>

            <div className="space-y-4">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} id={section.id} className="scroll-mt-32 border-slate-200">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-extrabold text-slate-900">{section.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.body}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card title="Privacy Request Channel" className="border-slate-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</div>
                  <div className="mt-1 break-words text-sm font-extrabold text-blue-700">privacy@wholesalehub.com</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Support path</div>
                  <div className="mt-1 text-sm font-extrabold text-slate-900">Contact page or buyer account contact</div>
                </div>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};
