import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Building2, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button, Input, Textarea, Card, PageHeader } from '../../components/ui';
import { useApp } from '../../context/AppContext';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Inquiry received. A Senior Account Executive will respond within 4 business hours.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Commercial Procurement Support & Sales Office
        </h1>
        <p className="text-base text-slate-600">
          Get in touch with our institutional sales reps, vendor compliance team, or logistics coordination hubs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Corporate Headquarters & Central Warehouse
            </h3>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Main Distribution Hub</span>
                  <span>Veng Sreng Blvd, Sangkat Choam Chao, Khan Por Senchey, Phnom Penh, Cambodia</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Direct Enterprise B2B Desk</span>
                  <span className="font-mono text-slate-900 font-semibold">+855 (0) 23 998 811 / +855 12 888 123</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Commercial Inquiries</span>
                  <span className="font-mono text-blue-600 font-semibold">b2b-sales@wholesalehub.com.kh</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Warehouse Fulfillment Hours</span>
                  <span>Monday – Friday: 08:00 – 17:30 (ICT)</span>
                  <span className="block text-slate-400">Saturday: 08:00 – 12:00 (ICT)</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-blue-900 text-white rounded-xl p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-base">Looking for Institutional Net Terms?</h4>
            <p className="text-xs text-blue-200 leading-relaxed">
              Wholesale buyers requiring credit lines exceeding $100,000 USD or custom annual volume agreements can schedule an in-person procurement review.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-blue-800 border border-blue-700 rounded-md text-xs font-semibold text-blue-100">
                Priority Underwriting SLA: 24h
              </span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8 border-slate-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Commercial Inquiry Logged</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out. Ticket reference <span className="font-mono font-bold text-blue-600">#INQ-2026-882</span> has been assigned to our Key Account Manager.
                </p>
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Submit Institutional Procurement Request
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Registered Business / Legal Entity Name"
                    required
                    placeholder="e.g. Mekong Technologies Co., Ltd."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />

                  <Input
                    label="Contact Officer Full Name"
                    required
                    placeholder="e.g. Sophal Vong"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />

                  <Input
                    label="Corporate Email Address"
                    type="email"
                    required
                    placeholder="e.g. sophal@mekongtech.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />

                  <Input
                    label="Business Phone / WhatsApp / Telegram"
                    required
                    placeholder="e.g. +855 12 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Inquiry Objective
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md" icon={Send} className="w-full sm:w-auto">
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
