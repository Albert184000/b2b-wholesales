import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Briefcase,
  ShoppingBag
} from 'lucide-react';
import { Button, Input, Checkbox } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentRole, showToast } = useApp();

  const [email, setEmail] = useState('keo.sovannarith@abctech.com.kh');
  const [password, setPassword] = useState('demo-password');
  const [rememberMe, setRememberMe] = useState(true);

  const nextRoute = useMemo(() => {
    const rawNext = searchParams.get('next') || '';
    return rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '';
  }, [searchParams]);

  const getRoleTarget = (role: UserRole, fallback: string) => {
    if (role === 'VERIFIED_BUYER' && nextRoute.startsWith('/buyer')) {
      return nextRoute;
    }

    if (
      (role === 'ADMIN' || role === 'SALES_MANAGER' || role === 'ACCOUNT_EXECUTIVE') &&
      nextRoute.startsWith('/admin')
    ) {
      return nextRoute;
    }

    return fallback;
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    if (email.includes('wholesalehub.com')) {
      setCurrentRole('ADMIN');
      navigate(getRoleTarget('ADMIN', '/admin/dashboard'));
    } else {
      setCurrentRole('VERIFIED_BUYER');
      navigate(getRoleTarget('VERIFIED_BUYER', '/buyer/dashboard'));
    }
  };

  const handleQuickLogin = (role: UserRole, fallbackRoute: string) => {
    setCurrentRole(role);
    navigate(getRoleTarget(role, fallbackRoute));
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                Wholesale<span className="text-blue-600">Hub</span>
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Business Portal Sign In</h2>
            <p className="text-xs text-slate-500 mb-6">
              Access corporate RFQs, purchase orders, invoices, credit lines, and account approvals.
            </p>

            {nextRoute && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                Sign in with an approved business account to continue to the requested portal action.
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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

              <Input
                label="Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                icon={Lock}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between gap-3 text-xs">
                <Checkbox
                  label="Remember this device"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <a
                  href="#forgot"
                  onClick={(event) => {
                    event.preventDefault();
                    showToast('Password reset link sent to registered business email', 'info');
                  }}
                  className="text-blue-600 font-semibold hover:underline whitespace-nowrap"
                >
                  Forgot Password?
                </a>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full justify-center mt-2">
                Sign In to Business Portal
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-center text-slate-500">
            Do not have a verified corporate account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Register Business
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Demo Access
            </div>

            <h3 className="text-lg font-bold mb-2">Instant Demo Perspective Login</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Select a business persona to preview the portal from a buyer, admin, or sales workflow.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('VERIFIED_BUYER', '/buyer/dashboard')}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Verified Buyer
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">ABC Technology Ltd. ($75k credit)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN', '/admin/dashboard')}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-rose-300">
                      Chief Admin
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">Procurement and ERP operations</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SALES_MANAGER', '/admin/rfqs')}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-violet-300">
                      Sales Manager
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">Marcus Vance (quote approvals)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ACCOUNT_EXECUTIVE', '/admin/rfqs')}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                      Account Executive
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">David Chen (sales rep)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-800">
            Protected by WholesaleHub multi-factor enterprise SSO protocol.
          </div>
        </div>
      </div>
    </div>
  );
};
