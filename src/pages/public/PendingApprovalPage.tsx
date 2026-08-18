import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, Phone, Building2, Package, FileCheck } from 'lucide-react';
import { Button, Card, StatusBadge, Timeline } from '../../components/ui';

export const PendingApprovalPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="p-6 sm:p-10 text-center border-slate-200 shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Clock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center justify-center mb-3">
          <StatusBadge status="Under Review" size="sm" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Business Application Under Review
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Thank you for applying for a WholesaleHub Corporate Account. Compliance and Credit Risk
          teams are reviewing the submitted business license, tax registration, and requested credit limit.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Application ID
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">B2B-APP-2026-11029</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Target SLA
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">24 business hours</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Initial Credit Review
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">$30,000 USD</div>
          </div>
        </div>

        <div className="text-left bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 mb-8 max-w-2xl mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            Verification Roadmap
          </h3>
          <Timeline
            items={[
              {
                title: 'Application & Documents Received',
                subtitle: 'Business profile and uploaded document records captured',
                date: 'Just now',
                completed: true
              },
              {
                title: 'Corporate & Tax ID Verification',
                subtitle: 'Checking Ministry of Commerce registry and tax patent information',
                date: 'In progress',
                active: true
              },
              {
                title: 'Credit Limit & Tier Assignment',
                subtitle: 'Assigning payment terms, buyer group, and starting wholesale tier',
                date: 'Estimated within 24 hours'
              },
              {
                title: 'Account Executive Welcome Call',
                subtitle: 'Portal activation, RFQ onboarding, and first order planning',
                date: 'Pending'
              }
            ]}
          />
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-left text-xs text-blue-900 mb-8 max-w-2xl mx-auto">
          <div className="font-bold mb-2">Need to update your application?</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              enterprise@wholesalehub.com
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              +855 (0) 23 999 800
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/products" className="block">
            <Button variant="outline" size="md" icon={Package} className="w-full">
              Browse Catalog
            </Button>
          </Link>
          <Link to="/login" className="block">
            <Button variant="primary" size="md" icon={Building2} className="w-full">
              Sign In
            </Button>
          </Link>
          <Link to="/contact" className="block">
            <Button variant="outline" size="md" className="w-full">
              Contact Sales
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
