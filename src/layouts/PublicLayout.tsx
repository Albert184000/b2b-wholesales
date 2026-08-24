import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  CreditCard,
  DollarSign,
  FileCheck,
  Globe,
  Layers,
  Mail,
  Menu,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Truck,
  User,
  X
} from 'lucide-react';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import { mockCategories } from '../data/mockData';
import { getCategorySlug } from '../utils/publicCatalog';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currency, setCurrency] = useState('USD');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'How It Works', href: '/how-it-works' }
  ];

  const footerCategories = useMemo(() => mockCategories.slice(0, 5), []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const isActiveLink = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href === '/products') return location.pathname.startsWith('/products');
    if (href === '/categories') return location.pathname.startsWith('/categories');
    return location.pathname === href;
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const query = globalSearch.trim();

    if (query) params.set('q', query);
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory);

    setMobileMenuOpen(false);
    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const email = newsletterEmail.trim();

    if (!email || !email.includes('@')) {
      showToast('Enter a valid business email to join updates.', 'warning');
      return;
    }

    showToast('Wholesale updates subscription saved.', 'success');
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <header
        className={`sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md transition-all duration-200 ${
          isScrolled ? 'border-slate-200 shadow-md' : 'border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="hidden border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-300 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Verified B2B marketplace
              </span>
              <span className="hidden items-center gap-1.5 whitespace-nowrap text-slate-400 xl:flex">
                <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                MOQ tiers, RFQs, Net 30/60 workflows
              </span>
              <span className="hidden items-center gap-1.5 whitespace-nowrap text-slate-400 2xl:flex">
                <Truck className="h-3.5 w-3.5 text-emerald-400" />
                Multi-warehouse shipment tracking
              </span>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap xl:gap-4">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-500" /> +855 (0) 23 999 800
              </span>
              <span className="hidden text-slate-700 2xl:inline">|</span>
              <span className="hidden items-center gap-1 2xl:flex">
                <Mail className="h-3 w-3 text-slate-500" /> enterprise@wholesalehub.com
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2.5 lg:w-[220px] xl:w-[230px] 2xl:w-auto 2xl:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-colors group-hover:bg-blue-700">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-slate-950 2xl:text-xl">
                    Wholesale<span className="text-blue-600">Hub</span>
                  </span>
                  <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 min-[420px]:inline">
                    B2B
                  </span>
                </div>
                <span className="hidden whitespace-nowrap text-[10px] font-semibold text-slate-500 xl:block">
                  Enterprise wholesale marketplace
                </span>
              </div>
            </Link>

            <nav className="hidden min-w-0 items-center gap-2 lg:flex xl:gap-3 2xl:gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`whitespace-nowrap text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 xl:text-sm ${
                    isActiveLink(link.href) ? 'text-blue-700' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <form
              role="search"
              onSubmit={handleSearch}
              className="hidden min-w-0 flex-1 items-center rounded-xl border border-slate-300 bg-white shadow-xs transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 md:flex lg:hidden"
            >
              <Search className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search wholesale products..."
                aria-label="Search wholesale products"
                className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Submit product search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            <div className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex xl:gap-2">
              <label htmlFor="public-currency" className="sr-only">
                Currency
              </label>
              <div className="relative hidden lg:block">
                <DollarSign className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  id="public-currency"
                  value={currency}
                  onChange={(event) => {
                    setCurrency(event.target.value);
                    showToast(`Currency preview set to ${event.target.value}.`, 'info');
                  }}
                  className="h-9 appearance-none rounded-lg border border-slate-300 bg-white pl-8 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="KHR">KHR</option>
                  <option value="THB">THB</option>
                  <option value="SGD">SGD</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              <Link to="/login">
                <Button variant="outline" size="sm" icon={User}>
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  <span className="hidden xl:inline">Create Business Account</span>
                  <span className="xl:hidden">Register</span>
                </Button>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((open) => !open);
              }}
              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:ml-0 lg:hidden"
              aria-label="Toggle public navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="hidden border-t border-slate-200 bg-white lg:block">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <form
              role="search"
              onSubmit={handleSearch}
              className="flex min-w-0 items-center rounded-xl border border-slate-300 bg-white shadow-xs transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
            >
              <div className="flex min-w-0 flex-1 items-center px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={globalSearch}
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  placeholder="Search wholesale products..."
                  aria-label="Search products and categories"
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="relative shrink-0 border-l border-slate-200">
                <label htmlFor="public-category-search" className="sr-only">
                  Category
                </label>
                <select
                  id="public-category-search"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-10 w-[220px] appearance-none bg-white pl-3 pr-9 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Categories</option>
                  {mockCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              <button
                type="submit"
                className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Submit product search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <form role="search" onSubmit={handleSearch} className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search wholesale products..."
              aria-label="Search wholesale products"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Public navigation menu"
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-slate-950">
                    Wholesale<span className="text-blue-600">Hub</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Close public navigation"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <label htmlFor="public-mobile-currency" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Currency
                  </label>
                  <select
                    id="public-mobile-currency"
                    value={currency}
                    onChange={(event) => {
                      setCurrency(event.target.value);
                      showToast(`Currency preview set to ${event.target.value}.`, 'info');
                    }}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="KHR">KHR</option>
                    <option value="THB">THB</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>

                <nav className="mt-4 grid grid-cols-1 gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-3 py-3 text-sm font-bold ${
                        isActiveLink(link.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="grid grid-cols-1 gap-2 border-t border-slate-100 p-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="outline" size="sm" className="h-11 w-full justify-center" icon={User}>
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="primary" size="sm" className="h-11 w-full justify-center">
                    Create Business Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="min-h-[70vh]">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 text-sm text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Wholesale<span className="text-blue-400">Hub</span>
                </span>
              </div>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
                Premium B2B wholesale marketplace for verified commercial buyers sourcing MOQ-based inventory,
                negotiated RFQs, purchase orders, invoices, and multi-warehouse shipments.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3 text-xs text-slate-400 sm:grid-cols-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-400" />
                  Phnom Penh Primary Hub
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  Verified buyer onboarding
                </div>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="mt-6">
                <label htmlFor="footer-newsletter" className="mb-2 block text-xs font-bold uppercase tracking-wider text-white">
                  Wholesale market updates
                </label>
                <div className="flex gap-2">
                  <input
                    id="footer-newsletter"
                    type="email"
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="procurement@company.com"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="submit" variant="primary" size="sm" icon={Send} aria-label="Subscribe to updates">
                    Join
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Products</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/products" className="hover:text-white">All Products</Link></li>
                <li><Link to="/products?availability=In+Stock" className="hover:text-white">In-Stock Deals</Link></li>
                <li><Link to="/products?sort=price-low" className="hover:text-white">Opening Tier Pricing</Link></li>
                <li><Link to="/login?next=/buyer/rfqs/new" className="hover:text-white">Request a Quote</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Categories</h4>
              <ul className="space-y-2 text-xs">
                {footerCategories.map((category) => (
                  <li key={category.id}>
                    <Link to={`/categories/${getCategorySlug(category)}`} className="hover:text-white">
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/categories" className="font-semibold text-blue-400 hover:text-blue-300">
                    Browse all categories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Buyer Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/register" className="hover:text-white">Create Business Account</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white">How Purchasing Works</Link></li>
                <li><Link to="/login?next=/buyer/dashboard" className="hover:text-white">Buyer Portal</Link></li>
                <li><Link to="/forgot-password" className="hover:text-white">Account Recovery</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Help & Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/about" className="hover:text-white">About WholesaleHub</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Support</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
              </ul>
              <div className="mt-5 flex items-center gap-2">
                {[Globe, Mail, Phone].map((Icon, index) => (
                  <Link
                    key={index}
                    to={index === 0 ? '/about' : '/contact'}
                    aria-label={index === 0 ? 'Company profile' : index === 1 ? 'Email support' : 'Call support'}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
            <div>&copy; 2026 WholesaleHub Enterprise Commerce Systems. All rights reserved.</div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link to="/terms" className="hover:text-slate-300">Terms & Conditions</Link>
              <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-slate-300">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
