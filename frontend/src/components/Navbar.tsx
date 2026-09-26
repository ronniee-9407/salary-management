import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';

import { setDisplayCurrency, loadAnalytics, loadEmployees } from '../store/salarySlice';
import { Building2, UserCheck, RefreshCw, DollarSign, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const displayCurrency = useSelector((state: RootState) => state.salary.filters.displayCurrency);
  const loading = useSelector((state: RootState) => state.salary.loadingEmployees);

  const handleRefresh = () => {
    dispatch(loadAnalytics() as any);
    dispatch(loadEmployees() as any);
  };

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-800 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 shadow-lg shadow-sky-500/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              ACME Corp <span className="text-xs font-normal text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800">Compensation Engine</span>
            </h1>
            <p className="text-xs text-slate-400">10,000 Employee Global Salary Management</p>
          </div>
        </div>

        {/* Controls & Persona */}
        <div className="flex items-center gap-4">
          {/* Currency Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => dispatch(setDisplayCurrency('USD'))}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                displayCurrency === 'USD'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" /> USD (Normalized)
            </button>
            <button
              onClick={() => dispatch(setDisplayCurrency('LOCAL'))}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                displayCurrency === 'LOCAL'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Local Currency
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition"
            title="Refresh analytics & data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            Refresh
          </button>

          {/* User Persona Badge */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300">
              <UserCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white">Sarah Jenkins</div>
              <div className="text-[10px] text-emerald-400 font-medium">HR Manager</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
