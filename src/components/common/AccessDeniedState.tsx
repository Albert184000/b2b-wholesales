import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { Button, Card } from '../ui';
import { getRoleDisplayName } from '../../utils/rbac';

interface AccessDeniedStateProps {
  currentRole?: string;
  returnTo?: string;
  returnLabel?: string;
  className?: string;
}

export const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({
  currentRole,
  returnTo = '/',
  returnLabel = 'Return to Dashboard',
  className = ''
}) => {
  return (
    <Card className={`mx-auto max-w-2xl border-rose-100 bg-white ${className}`}>
      <div className="flex flex-col items-center px-2 py-8 text-center sm:px-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
          You do not have permission to access this page
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
          Your current role is{' '}
          <span className="font-bold text-slate-900">{getRoleDisplayName(currentRole)}</span>. Switch demo
          perspective or return to an allowed dashboard to continue.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to={returnTo}>
            <Button variant="primary" size="sm" icon={LayoutDashboard}>
              {returnLabel}
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Public Website
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

