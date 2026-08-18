import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building2, Send, CheckCircle2 } from 'lucide-react';
import { Button, Input, Textarea, Card, PageHeader, Alert } from '../../components/ui';
import { useApp } from '../../context/AppContext';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title="About WholesaleHub"
        subtitle="Empowering B2B wholesale distribution, enterprise supply chain management, and commercial procurement in Southeast Asia"
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <Card className="p-8 border-slate-200 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Enterprise Mission</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          WholesaleHub was engineered to modernize business-to-business commerce. While retail e-commerce
          has flourished, enterprise procurement still suffers from disconnected email threads, manual PDF
          purchase orders, and fragmented credit management.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Our platform unifies the entire commercial transaction lifecycle—from dynamic tiered catalog pricing
          and formal RFQ counter-offers to warehouse dispatch tracking and revolving Net 30/60 corporate credit reconciliation.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Regional Logistics</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            3 fulfillment hubs across Phnom Penh, Siem Reap, and Battambang with same-day pallet dispatch.
          </p>
        </Card>

        <Card className="p-6 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Direct Factory Ties</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Authorized direct distributor for leading server, network, and commercial hardware brands.
          </p>
        </Card>

        <Card className="p-6 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Dedicated Reps</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every verified buyer receives an assigned Account Executive for custom pricing and credit expansion.
          </p>
        </Card>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Inquiry sent to Enterprise Key Accounts team', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title="Contact Enterprise Accounts"
        subtitle="Speak with our wholesale procurement specialists, corporate credit committee, or technical sales reps"
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <Card title="Send an Inquiry" className="p-6 border-slate-200">
            {submitted ? (
              <Alert type="success" title="Message Received">
                Thank you. An Enterprise Account Executive will contact your organization within 2 business hours.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Your Name" required placeholder="Keo Sovannarith" />
                  <Input label="Company Name" required placeholder="ABC Technology Ltd." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Corporate Email" type="email" required placeholder="name@company.com" />
                  <Input label="Direct Phone" type="tel" required placeholder="+855 (0) 23 999 800" />
                </div>
                <Textarea label="Procurement Requirements / Questions" required rows={4} placeholder="Describe quantities, target SKUs, or credit requirements..." />
                <Button type="submit" variant="primary" size="md" icon={Send} className="w-full justify-center">
                  Submit Enterprise Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>

        <div className="md:col-span-5 space-y-4">
          <Card title="Corporate Headquarters" className="p-6 border-slate-200 space-y-4 text-xs">
            <div className="flex items-start gap-3 text-slate-700">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Phnom Penh Tower (Level 18)</strong>
                #445 Monivong Blvd, Sangkat Boeung Keng Kang 1, Phnom Penh, Cambodia
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <strong className="block text-slate-900">Procurement Hotline</strong>
                +855 (0) 23 999 800 (Mon–Fri 8:00–18:00)
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <strong className="block text-slate-900">Commercial Inquiries</strong>
                enterprise@wholesalehub.com
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
