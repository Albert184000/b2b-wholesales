import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  FileText,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button, Input, Select, Textarea, FileUpload, Checkbox, Card, Alert } from '../../components/ui';
import { useApp } from '../../context/AppContext';

const initialRegistrationData = {
  companyName: 'Angkor Cloud Solutions Inc.',
  businessType: 'Data Center Operator & MSP',
  taxId: 'KHM-TAX-77218390',
  registrationNumber: 'REG-KH-2024-11029',
  country: 'Cambodia',
  city: 'Siem Reap',
  address: 'Highway 6, Svay Dangkum, Siem Reap, Cambodia',
  postalCode: '17252',
  contactPerson: 'Borey Meng',
  designation: 'Procurement Director',
  businessEmail: 'procurement@angkorcloud.com',
  phone: '+855 (0) 63 963 888',
  requestedCreditLimit: '30000',
  estimatedMonthlySpend: '18000',
  password: 'business-password',
  confirmPassword: 'business-password',
  agreedToTerms: true
};

type RegistrationField = keyof typeof initialRegistrationData;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialRegistrationData);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string[]>>({});
  const [showPasswords, setShowPasswords] = useState(false);

  const steps = [
    { num: 1, title: 'Company Details' },
    { num: 2, title: 'Authorized Contact' },
    { num: 3, title: 'Tax & License Docs' },
    { num: 4, title: 'Account Security' },
    { num: 5, title: 'Review & Submit' }
  ];

  const updateField = (field: RegistrationField, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateDocumentList = (key: string, files: File[]) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [key]: files.map((file) => file.name)
    }));
  };

  const validateCurrentStep = () => {
    const requiredFieldsByStep: Record<number, RegistrationField[]> = {
      1: ['companyName', 'businessType', 'taxId', 'registrationNumber', 'country', 'city', 'address'],
      2: ['contactPerson', 'designation', 'businessEmail', 'phone'],
      4: ['password', 'confirmPassword']
    };

    const missingField = (requiredFieldsByStep[currentStep] || []).find((field) => {
      const value = formData[field];
      return typeof value === 'string' && value.trim() === '';
    });

    if (missingField) {
      showToast('Please complete all required fields before continuing.', 'warning');
      return false;
    }

    if (currentStep === 2 && !formData.businessEmail.includes('@')) {
      showToast('Please enter a valid corporate email address.', 'warning');
      return false;
    }

    if (currentStep === 4) {
      if (formData.password.length < 8) {
        showToast('Password must contain at least 8 characters.', 'warning');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        showToast('Password confirmation does not match.', 'warning');
        return false;
      }

      if (!formData.agreedToTerms) {
        showToast('Please accept the B2B terms before submitting.', 'warning');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    showToast('Business registration application submitted for corporate verification!', 'success');
    navigate('/registration-submitted');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
          <ShieldCheck className="w-4 h-4" /> B2B Buyer Onboarding
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Apply for a Wholesale Corporate Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
          Complete the application to unlock volume tier pricing, RFQ negotiation, and commercial credit review.
        </p>
      </div>

      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[550px] relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200" />
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center relative z-10 bg-slate-50 px-1">
              <div
                aria-current={step.num === currentStep ? 'step' : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                  step.num < currentStep
                    ? 'bg-emerald-600 text-white'
                    : step.num === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-white text-slate-400 border border-slate-300'
                }`}
              >
                {step.num < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${step.num === currentStep ? 'text-blue-600' : 'text-slate-500'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-5 sm:p-8 border-slate-200">
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Step 1: Company Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Registered Company Legal Name"
                  required
                  value={formData.companyName}
                  onChange={(event) => updateField('companyName', event.target.value)}
                />
              </div>

              <Select
                label="Business Entity Type"
                required
                value={formData.businessType}
                onChange={(event) => updateField('businessType', event.target.value)}
                options={[
                  { label: 'System Integrator & IT Reseller', value: 'System Integrator & IT Reseller' },
                  { label: 'Telecom Infrastructure Provider', value: 'Telecom Infrastructure Provider' },
                  { label: 'Data Center Operator & MSP', value: 'Data Center Operator & MSP' },
                  { label: 'Enterprise Corporation (End-User)', value: 'Enterprise Corporation (End-User)' },
                  { label: 'Government / Educational Institution', value: 'Government / Educational Institution' },
                  { label: 'Wholesale Distributor', value: 'Wholesale Distributor' }
                ]}
              />

              <Input
                label="VAT / Tax Identification Number"
                required
                value={formData.taxId}
                onChange={(event) => updateField('taxId', event.target.value)}
              />

              <Input
                label="Ministry of Commerce Registration No."
                required
                value={formData.registrationNumber}
                onChange={(event) => updateField('registrationNumber', event.target.value)}
              />

              <Select
                label="Country of Registration"
                required
                value={formData.country}
                onChange={(event) => updateField('country', event.target.value)}
                options={[
                  { label: 'Cambodia', value: 'Cambodia' },
                  { label: 'Vietnam', value: 'Vietnam' },
                  { label: 'Thailand', value: 'Thailand' },
                  { label: 'Singapore', value: 'Singapore' }
                ]}
              />

              <Input
                label="City / Province"
                required
                value={formData.city}
                onChange={(event) => updateField('city', event.target.value)}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Registered Headquarters Address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(event) => updateField('address', event.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Step 2: Authorized Procurement Officer
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Contact Name"
                required
                value={formData.contactPerson}
                onChange={(event) => updateField('contactPerson', event.target.value)}
              />

              <Input
                label="Job Designation / Department"
                required
                value={formData.designation}
                onChange={(event) => updateField('designation', event.target.value)}
              />

              <Input
                label="Official Corporate Email"
                type="email"
                required
                value={formData.businessEmail}
                onChange={(event) => updateField('businessEmail', event.target.value)}
                helperText="Use a company domain email for account verification."
              />

              <Input
                label="Business Direct Phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(event) => updateField('phone', event.target.value)}
              />

              <Input
                label="Requested Credit Limit"
                type="number"
                prefixText="$"
                value={formData.requestedCreditLimit}
                onChange={(event) => updateField('requestedCreditLimit', event.target.value)}
              />

              <Input
                label="Estimated Monthly Spend"
                type="number"
                prefixText="$"
                value={formData.estimatedMonthlySpend}
                onChange={(event) => updateField('estimatedMonthlySpend', event.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Step 3: Business Verification Documents
            </h3>

            <Alert type="info">
              Upload clear PDF copies where available. Selected filenames appear in the checklist before submission.
            </Alert>

            <div className="space-y-4">
              <FileUpload
                label="1. Certificate of Incorporation / Business License (PDF)*"
                helperText="MOC official incorporation certificate, max 10MB"
                onFilesSelected={(files) => updateDocumentList('license', files)}
              />

              <FileUpload
                label="2. VAT Patent / Tax Compliance Certificate (PDF)*"
                helperText="General Department of Taxation patent certificate, max 10MB"
                onFilesSelected={(files) => updateDocumentList('tax', files)}
              />

              <FileUpload
                label="3. Bank Reference or Audited Financial Statement"
                helperText="Recommended when requesting credit facilities above $50,000"
                onFilesSelected={(files) => updateDocumentList('finance', files)}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Step 4: Account Password & Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="registration-password"
                label="Account Password"
                type={showPasswords ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(event) => updateField('password', event.target.value)}
                autoComplete="new-password"
              />

              <Input
                id="registration-confirm-password"
                label="Confirm Password"
                type={showPasswords ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-lg px-1 text-xs font-bold text-blue-700 hover:text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-controls="registration-password registration-confirm-password"
              aria-pressed={showPasswords}
            >
              {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPasswords ? 'Hide passwords' : 'Show passwords'}
            </button>

            <div className="pt-2">
              <Checkbox
                required
                label="I agree to the WholesaleHub Enterprise B2B Terms of Supply, Credit Line Regulations, and Privacy Policy."
                checked={formData.agreedToTerms}
                onChange={(event) => updateField('agreedToTerms', event.target.checked)}
              />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step 5: Review Application Summary
            </h3>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Company Name</span>
                  <p className="font-bold text-slate-900 break-words">{formData.companyName}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Business Type</span>
                  <p className="font-bold text-slate-900 break-words">{formData.businessType}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Tax ID</span>
                  <p className="font-bold text-slate-900 break-words">{formData.taxId}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">MOC Registration</span>
                  <p className="font-bold text-slate-900 break-words">{formData.registrationNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Authorized Contact</span>
                  <p className="font-bold text-slate-900 break-words">{formData.contactPerson}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Official Email</span>
                  <p className="font-bold text-slate-900 break-words">{formData.businessEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 font-medium">Requested Credit</span>
                  <p className="font-bold text-slate-900">${Number(formData.requestedCreditLimit || 0).toLocaleString()} USD</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Documents</span>
                  <p className="font-bold text-slate-900 break-words">
                    {(uploadedDocs.license?.[0] || 'Business_License_AngkorCloud.pdf')},{' '}
                    {uploadedDocs.tax?.[0] || 'Patent_Tax_Certificate_2026.pdf'}
                  </p>
                </div>
              </div>
            </div>

            <Alert type="success" title="Ready for Review">
              Upon submission, an Account Executive will verify credentials and assign an initial pricing tier and Net 30 credit facility.
            </Alert>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button variant="outline" size="sm" onClick={handleBack} icon={ArrowLeft} className="w-full sm:w-auto">
              Back
            </Button>
          ) : (
            <Link to="/login" className="block w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Already registered? Sign In
              </Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            icon={currentStep === 5 ? CheckCircle2 : ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto"
          >
            {currentStep === 5 ? 'Submit Application for Review' : 'Save & Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
