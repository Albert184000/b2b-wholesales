import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Layers,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Menu,
  X,
  User,
  Globe,
  FileCheck
} from 'lucide-react';
import { Button } from '../components/ui';
import { RoleSwitcher } from '../components/common/RoleSwitcher';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/products#categories' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const isActiveLink = (href: string) => {
    const [path, hash] = href.split('#');

    if (hash) {
      return location.pathname === path && location.hash === `#${hash}`;
    }

    if (href === '/products') {
      return location.pathname.startsWith('/products') && location.hash !== '#categories';
    }

    return location.pathname === href;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <RoleSwitcher />

      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 min-w-0">
            <span className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified B2B Wholesale Portal
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Direct factory tiers and Net 30/60 credit lines
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300 whitespace-nowrap">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> +855 (0) 23 999 800
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> enterprise@wholesalehub.com
            </span>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            <Link to="/" className="flex items-center gap-3 group min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-700 transition-colors shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                    Wholesale<span className="text-blue-600">Hub</span>
                  </span>
                  <span className="hidden min-[360px]:inline text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    B2B
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-tight truncate">
                  Enterprise Wholesale &amp; ERP
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const active = isActiveLink(link.href);

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`text-sm font-semibold transition-colors ${
                      active ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <div className="hidden xl:flex items-center gap-2">
                <Link to="/login?next=/buyer/dashboard">
                  <Button variant="ghost" size="sm" icon={Building2}>
                    Buyer Portal
                  </Button>
                </Link>
                <Link to="/login?next=/admin/dashboard">
                  <Button variant="ghost" size="sm" icon={ShieldCheck}>
                    Admin Portal
                  </Button>
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-1" />
              </div>
              <Link to="/login">
                <Button variant="outline" size="sm" icon={User}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Create Business Account
                </Button>
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <Link to="/login" className="hidden min-[420px]:block">
                <Button variant="outline" size="xs">
                  Sign In
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle public navigation"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-lg">
            <nav className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const active = isActiveLink(link.href);

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link to="/login" className="block">
                <Button variant="outline" size="sm" className="w-full justify-center" icon={User}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="block">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  Create Business Account
                </Button>
              </Link>
              <Link to="/login?next=/buyer/dashboard" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-center" icon={Building2}>
                  Buyer Portal
                </Button>
              </Link>
              <Link to="/login?next=/admin/dashboard" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-center" icon={ShieldCheck}>
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  Wholesale<span className="text-blue-400">Hub</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Enterprise wholesale procurement infrastructure for verified commercial buyers,
                system integrators, and distributors ordering against MOQ and tier pricing rules.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Phnom Penh Central Hub</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified business onboarding</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Wholesale Catalog
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/products?category=Enterprise+IT+%26+Monitors" className="hover:text-white transition-colors">
                    Enterprise IT &amp; Monitors
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Servers+%26+Networking" className="hover:text-white transition-colors">
                    Servers &amp; Networking
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Commercial+Office+Equipment" className="hover:text-white transition-colors">
                    Commercial Office Equipment
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Industrial+Power+%26+UPS" className="hover:text-white transition-colors">
                    Industrial Power &amp; UPS
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-white transition-colors text-blue-400 font-semibold">
                    Browse all wholesale categories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                B2B Services
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Business account registration
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Submit request for quote
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Corporate credit application
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Purchase order tracking
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition-colors">
                    B2B purchasing workflow
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Enterprise Support
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About WholesaleHub
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact key account team
                  </Link>
                </li>
                <li>
                  <Link to="/login?next=/admin/dashboard" className="hover:text-white transition-colors">
                    Staff and admin sign in
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400">Headquarters: Phnom Penh, Cambodia</span>
                </li>
                <li>
                  <span className="text-slate-400">Logistics hubs: REP, BTB, PNH</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>&copy; 2026 WholesaleHub Enterprise Commerce Systems. All rights reserved.</div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="hover:text-slate-400 cursor-pointer">B2B Terms of Supply</span>
              <span className="hover:text-slate-400 cursor-pointer">Credit Agreement SLA</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacy &amp; Data Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
