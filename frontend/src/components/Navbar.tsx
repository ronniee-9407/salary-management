import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setDisplayCurrency, loadAnalytics, loadEmployees } from '../store/salarySlice';
import { useTheme } from '../context/ThemeContext';
import { Building2, UserCheck, RefreshCw, DollarSign, Globe, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const displayCurrency = useSelector((state: RootState) => state.salary.filters.displayCurrency);
  const loading = useSelector((state: RootState) => state.salary.loadingEmployees);

  const handleRefresh = () => {
    dispatch(loadAnalytics() as any);
    dispatch(loadEmployees() as any);
  };

  return (
    <header className="glass-panel sticky top-0 z-40 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 shadow-lg shadow-sky-500/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold theme-heading tracking-tight flex items-center gap-2">
              ACME Corp{' '}
              <span className="text-xs font-semibold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                Compensation Engine
              </span>
            </h1>
            <p className="text-xs theme-subtext">10,000 Employee Global Salary Management</p>
          </div>
        </div>

        {/* Controls & Persona */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Currency Toggle */}
          <div className="flex items-center rounded-lg glass-card p-1">
            <button
              onClick={() => dispatch(setDisplayCurrency('USD'))}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                displayCurrency === 'USD'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'theme-subtext hover:theme-heading'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" /> USD
            </button>
            <button
              onClick={() => dispatch(setDisplayCurrency('LOCAL'))}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                displayCurrency === 'LOCAL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'theme-subtext hover:theme-heading'
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Local
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg glass-card hover:scale-105 active:scale-95 transition-all shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg glass-card px-3 py-1.5 text-xs theme-subtext hover:theme-heading transition-all"
            title="Refresh analytics & data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User Persona Badge */}
          <div className="flex items-center gap-2 border-l border-slate-700/30 pl-3 sm:pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full glass-card text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold theme-heading">Sarah Jenkins</div>
              <div className="text-[10px] text-emerald-500 font-medium">HR Manager</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
