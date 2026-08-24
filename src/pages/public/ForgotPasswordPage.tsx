import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailCheck, ShieldCheck } from 'lucide-react';
import { Alert, Button, Card, Input, PageHeader } from '../../components/ui';
import { useApp } from '../../context/AppContext';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    showToast('Password reset instructions sent to the registered business email.', 'success');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Reset Portal Password"
        subtitle="Request secure password recovery instructions for an approved buyer or staff account."
        breadcrumbs={[
          { label: 'Sign In', href: '/login' },
          { label: 'Forgot Password' }
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="border-slate-200 lg:col-span-7">
          {submitted ? (
            <div className="space-y-5">
              <Alert type="success" title="Reset Instructions Sent">
                Check {email || 'your registered business email'} for the reset link and account verification steps.
              </Alert>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                For security, reset links expire after 30 minutes and can only be used once by the registered account holder.
              </div>
              <Link to="/login">
                <Button variant="primary" size="md" icon={ArrowLeft}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Business Email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                icon={Mail}
                autoComplete="email"
              />
              <Button type="submit" variant="primary" size="md" icon={MailCheck} className="w-full justify-center sm:w-auto">
                Send Reset Instructions
              </Button>
            </form>
          )}
        </Card>

        <Card title="Account Recovery Checks" className="border-slate-200 lg:col-span-5">
          <div className="space-y-3 text-sm text-slate-700">
            {[
              'Email must match a registered buyer or staff account.',
              'High-risk account changes may require approval from the business administrator.',
              'Support can verify urgent access requests during business hours.'
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
