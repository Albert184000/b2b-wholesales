import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, Package, Search } from 'lucide-react';
import { Button, Card } from '../../components/ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="p-8 sm:p-10 text-center border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
          404 / Page Not Found
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          This procurement page is not available.
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-3 leading-relaxed">
          The route may have moved, the product may no longer be active, or the portal link may
          require a verified business account.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/" className="block">
            <Button variant="outline" size="md" icon={Home} className="w-full">
              Home
            </Button>
          </Link>
          <Link to="/products" className="block">
            <Button variant="primary" size="md" icon={Package} className="w-full">
              Catalog
            </Button>
          </Link>
          <Link to="/contact" className="block">
            <Button variant="outline" size="md" icon={Search} className="w-full">
              Contact Sales
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
