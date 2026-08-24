import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck,
  Home,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { Alert, Button, Card, StatusBadge } from '../../components/ui';
import { mockBuyerApplications } from '../../data/mockData';
import { formatCurrency } from '../../utils/pricing';

export const RegistrationSubmittedPage: React.FC = () => {
  const application = mockBuyerApplications[1] || mockBuyerApplications[0];
  const requestedCredit = application.creditProfile?.creditLimit || 0;

  const reviewSteps = [
    {
      title: 'Registration received',
      description: 'Your company profile, primary contact, and uploaded document records were captured for review.',
      icon: CheckCircle2,
      status: 'Complete'
    },
    {
      title: 'Document intake check',
      description: 'Staff compare business records, tax details, and uploaded files before moving the account into review.',
      icon: FileCheck,
      status: 'Pending Review'
    },
    {
      title: 'Buyer account decision',
      description: 'Approved companies receive buyer portal access, starting terms, and category eligibility.',
      icon: ShieldCheck,
      status: 'Pending'
    }
  ];

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <Card className="overflow-hidden border-slate-200 shadow-md" noPadding>
          <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-8 text-center sm:px-8 sm:py-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="mt-4 flex justify-center">
              <StatusBadge status="Submitted" size="sm" />
            </div>
            <h1 className="mx-auto mt-3 max-w-xs break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:max-w-none sm:text-3xl">
              Registration submitted successfully
            </h1>
            <p className="mx-auto mt-3 max-w-xs break-words text-sm leading-relaxed text-slate-600 sm:max-w-2xl">
              WholesaleHub has recorded the mock business application below. The account is not approved yet;
              it moves through document intake, verification, and buyer setup before portal access is opened.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              <section>
                <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-extrabold text-slate-900">Application reference</h2>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    Save for support
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    ['Application number', application.applicationNumber],
                    ['Company', application.companyName],
                    ['Submitted date', application.submittedDate],
                    ['Requested credit', formatCurrency(requestedCredit)]
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
                      <div className="mt-1 break-words text-sm font-extrabold text-slate-950">{value}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-extrabold text-slate-900">Document review status</h2>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {application.documents.map((document) => (
                    <div
                      key={document.id}
                      className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">{document.document}</div>
                        <div className="mt-1 truncate text-xs font-mono text-slate-500">{document.fileName}</div>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <StatusBadge status={document.verificationStatus} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Alert type="info" title="What happens next">
                Review timing depends on the completeness of company documents and staff availability. The
                pending status page shows the next mock review stage without implying live backend processing.
              </Alert>
            </div>

            <aside className="min-w-0 space-y-4">
              <Card title="Next steps" className="border-slate-200">
                <div className="space-y-4">
                  {reviewSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          {index < reviewSteps.length - 1 && <div className="mt-2 h-full w-px bg-slate-200" />}
                        </div>
                        <div className="min-w-0 pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900">{step.title}</h3>
                            <StatusBadge status={step.status} size="sm" />
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="border-slate-200 bg-slate-950 text-white">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold">Pending review is next</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      Use the status page to see the review roadmap and support contact information for this public demo.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-2">
                <Link to="/pending-approval" className="block">
                  <Button variant="primary" size="md" icon={ClipboardCheck} className="w-full justify-center">
                    View Pending Status
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="outline" size="md" icon={LogIn} className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link to="/" className="block">
                  <Button variant="ghost" size="md" icon={Home} className="w-full justify-center">
                    Return Home
                  </Button>
                </Link>
              </div>

              <Link
                to="/products"
                className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Browse public catalog while you wait <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </Card>
      </div>
    </div>
  );
};
