import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Truck
} from 'lucide-react';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { useApp } from '../../context/AppContext';

const supportOptions = [
  {
    title: 'Buyer onboarding',
    description: 'Business registration, buyer verification, account setup, and portal readiness.',
    icon: Building2
  },
  {
    title: 'RFQ support',
    description: 'Tender questions, product quantities, quote preparation, and commercial terms.',
    icon: MessageSquare
  },
  {
    title: 'Credit and invoicing',
    description: 'Payment terms, billing contacts, credit review questions, and invoice reconciliation.',
    icon: CreditCard
  },
  {
    title: 'Logistics',
    description: 'Warehouse pickup, carrier coordination, delivery status, and shipment documentation.',
    icon: Truck
  }
];

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    inquiryType: 'Wholesale Buyer Onboarding',
    message: ''
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    showToast('Inquiry received. A Senior Account Executive will review the mock request.', 'success');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Contact WholesaleHub</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Commercial Procurement Support & Sales Office
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          Get in touch with the public demo support team for buyer onboarding, RFQ planning,
          credit questions, supplier inquiries, or shipment coordination.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {supportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.title} className="border-slate-200">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">{option.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{option.description}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card className="space-y-6 border-slate-200 shadow-xs">
            <h2 className="border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
              Corporate Headquarters & Central Warehouse
            </h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <span className="block font-bold text-slate-900">Main Distribution Hub</span>
                  <span>Veng Sreng Blvd, Sangkat Choam Chao, Khan Por Senchey, Phnom Penh, Cambodia</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <span className="block font-bold text-slate-900">Direct Enterprise B2B Desk</span>
                  <span className="font-mono font-semibold text-slate-900">+855 (0) 23 998 811 / +855 12 888 123</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <span className="block font-bold text-slate-900">Commercial Inquiries</span>
                  <span className="break-words font-mono font-semibold text-blue-700">b2b-sales@wholesalehub.com.kh</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <span className="block font-bold text-slate-900">Warehouse Fulfillment Hours</span>
                  <span>Monday - Friday: 08:00 - 17:30 (ICT)</span>
                  <span className="block text-slate-500">Saturday: 08:00 - 12:00 (ICT)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-blue-800 bg-blue-900 text-white shadow-sm">
            <h2 className="text-base font-bold">Looking for institutional net terms?</h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              Wholesale buyers requesting large credit lines or custom annual volume agreements can ask for
              a procurement review after completing account intake.
            </p>
            <div className="mt-4">
              <span className="inline-block rounded-md border border-blue-700 bg-blue-800 px-3 py-1 text-xs font-semibold text-blue-100">
                Priority review path available after account intake
              </span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="border-slate-200 shadow-xs">
            {submitted ? (
              <div className="space-y-4 py-10 text-center sm:py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Commercial Inquiry Logged</h2>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600">
                  Thank you for reaching out. Ticket reference{' '}
                  <span className="font-mono font-bold text-blue-700">#INQ-2026-882</span> has been
                  assigned to the public demo support queue.
                </p>
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                  Submit Institutional Procurement Request
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Registered Business / Legal Entity Name"
                    required
                    placeholder="e.g. Mekong Technologies Co., Ltd."
                    value={formData.companyName}
                    onChange={(event) => setFormData({ ...formData, companyName: event.target.value })}
                  />

                  <Input
                    label="Contact Officer Full Name"
                    required
                    placeholder="e.g. Sophal Vong"
                    value={formData.contactName}
                    onChange={(event) => setFormData({ ...formData, contactName: event.target.value })}
                  />

                  <Input
                    label="Corporate Email Address"
                    type="email"
                    required
                    placeholder="e.g. sophal@mekongtech.com"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  />

                  <Input
                    label="Business Phone / WhatsApp / Telegram"
                    required
                    placeholder="e.g. +855 12 345 678"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="public-contact-inquiry-type" className="mb-1 block text-xs font-semibold text-slate-700">
                    Primary Inquiry Objective
                  </label>
                  <select
                    id="public-contact-inquiry-type"
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.inquiryType}
                    onChange={(event) => setFormData({ ...formData, inquiryType: event.target.value })}
                  >
                    <option value="Wholesale Buyer Onboarding">Wholesale Buyer Verification & Credit Line</option>
                    <option value="Custom Project RFQ / Tender">Custom Large-Scale Tender / Project RFQ</option>
                    <option value="Supplier / Brand Distribution Partnership">Brand Distribution / Vendor Listing</option>
                    <option value="Logistics & Dispatch Inquiry">Logistics & Outbound Freight</option>
                    <option value="Finance & Invoicing Reconciliation">Finance & Tax Invoicing Reconciliation</option>
                  </select>
                </div>

                <Textarea
                  label="Detailed Inquiry Specifications / Target Quantities"
                  required
                  rows={4}
                  placeholder="Include product categories, estimated monthly volume, or specific tender deadlines..."
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md" icon={Send} className="w-full justify-center sm:w-auto">
                    Transmit Commercial Inquiry
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
