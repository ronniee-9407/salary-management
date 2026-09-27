import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Employee } from '../types';
import * as api from '../services/api';
import { loadEmployees, loadAnalytics } from '../store/salarySlice';
import { X, FileText, Save, CheckCircle2, ShieldAlert, Sparkles, Building2, Globe } from 'lucide-react';

interface SalaryBreakupModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const SalaryBreakupModal: React.FC<SalaryBreakupModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const dispatch = useDispatch();
  const displayCurrency = useSelector((state: RootState) => state.salary.filters.displayCurrency);

  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [basicPay, setBasicPay] = useState<number>(0);
  const [hra, setHra] = useState<number>(0);
  const [medicalAllowance, setMedicalAllowance] = useState<number>(0);
  const [specialAllowance, setSpecialAllowance] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      const base = employee.base_salary;
      setBaseSalary(base);
      setBonus(employee.bonus || 0);

      // Default breakdown: 50% Basic, 30% HRA, 8% Medical, 12% Special
      const b = Math.round(base * 0.5);
      const h = Math.round(base * 0.3);
      const m = Math.round(base * 0.08);
      const s = base - (b + h + m);

      setBasicPay(b);
      setHra(h);
      setMedicalAllowance(m);
      setSpecialAllowance(s);
      setError(null);
      setSuccessMsg(null);
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const symbol = employee.country.currency_symbol;
  const rate = employee.country.exchange_rate_to_usd;

  const formatCurrency = (amount: number) => {
    if (displayCurrency === 'LOCAL') {
      return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
    }
    const usd = amount * rate;
    return `$${Math.round(usd).toLocaleString('en-US')}`;
  };

  // Recalculate Special Allowance whenever Basic, HRA, or Medical changes
  const handleBasicChange = (val: number) => {
    const newBasic = Math.max(0, val);
    setBasicPay(newBasic);
    setSpecialAllowance(Math.max(0, baseSalary - (newBasic + hra + medicalAllowance)));
  };

  const handleHraChange = (val: number) => {
    const newHra = Math.max(0, val);
    setHra(newHra);
    setSpecialAllowance(Math.max(0, baseSalary - (basicPay + newHra + medicalAllowance)));
  };

  const handleMedicalChange = (val: number) => {
    const newMed = Math.max(0, val);
    setMedicalAllowance(newMed);
    setSpecialAllowance(Math.max(0, baseSalary - (basicPay + hra + newMed)));
  };

  const handleBaseSalaryChange = (val: number) => {
    const newBase = Math.max(0, val);
    setBaseSalary(newBase);
    const b = Math.round(newBase * 0.5);
    const h = Math.round(newBase * 0.3);
    const m = Math.round(newBase * 0.08);
    const s = newBase - (b + h + m);
    setBasicPay(b);
    setHra(h);
    setMedicalAllowance(m);
    setSpecialAllowance(s);
  };

  const totalAllowancesSum = basicPay + hra + medicalAllowance + specialAllowance;
  const isBalanced = Math.abs(totalAllowancesSum - baseSalary) < 1;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setError('Total of all allowances must strictly equal the Base Salary.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.updateEmployee(employee.id, {
        base_salary: baseSalary,
        bonus: bonus,
      });
      dispatch(loadEmployees() as any);
      dispatch(loadAnalytics() as any);
      setSuccessMsg('Salary breakup updated & saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update salary breakup');
    } finally {
      setSaving(false);
    }
  };

  // Percentage calculations
  const basicPct = baseSalary > 0 ? Math.round((basicPay / baseSalary) * 100) : 0;
  const hraPct = baseSalary > 0 ? Math.round((hra / baseSalary) * 100) : 0;
  const medPct = baseSalary > 0 ? Math.round((medicalAllowance / baseSalary) * 100) : 0;
  const specialPct = baseSalary > 0 ? Math.max(0, 100 - (basicPct + hraPct + medPct)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold theme-heading">
                  {employee.first_name} {employee.last_name}
                </h2>
                <span className="text-xs font-mono font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {employee.employee_id || `ACM${employee.id.toString().padStart(5, '0')}`}
                </span>
              </div>
              <p className="text-xs theme-subtext flex items-center gap-2 mt-0.5">
                <span>{employee.job_title}</span> &bull; 
                <span className="text-sky-500 font-medium">{employee.department.name}</span> &bull; 
                <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-slate-400" /> {employee.country.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 theme-subtext hover:theme-heading hover:bg-slate-700/20 cursor-pointer transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500 font-medium flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-500 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Salary Slip Content */}
        <form onSubmit={handleSave} className="mt-5 space-y-5 text-xs">
          
          {/* Total Base Salary Banner */}
          <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-sky-500/20 bg-sky-500/5">
            <div>
              <span className="text-xs font-semibold uppercase theme-subtext tracking-wider">
                Total Base Salary
              </span>
              <div className="text-xl font-bold theme-heading mt-0.5">
                {formatCurrency(baseSalary)}
              </div>
              <p className="text-[11px] theme-subtext mt-0.5">
                Sum of all individual allowances strictly balances to this total
              </p>
            </div>

            <div className="w-full sm:w-48">
              <label className="block font-medium theme-subtext mb-1">
                Edit Total Base ({symbol})
              </label>
              <input
                type="number"
                min="1"
                value={baseSalary}
                onChange={(e) => handleBaseSalaryChange(Number(e.target.value))}
                className="w-full rounded-xl border p-2 text-xs theme-input focus:border-sky-500 focus:outline-none font-semibold"
              />
            </div>
          </div>

          {/* Visual Allowance Distribution Bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs font-medium theme-subtext">
              <span>Salary Component Distribution</span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Total = 100% ({formatCurrency(totalAllowancesSum)})
              </span>
            </div>

            <div className="h-3 w-full rounded-full glass-card overflow-hidden flex">
              <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${basicPct}%` }} title={`Basic Pay: ${basicPct}%`} />
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${hraPct}%` }} title={`HRA: ${hraPct}%`} />
              <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${medPct}%` }} title={`Medical: ${medPct}%`} />
              <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: `${specialPct}%` }} title={`Special Allowance: ${specialPct}%`} />
            </div>

            <div className="flex flex-wrap gap-4 mt-2 text-[11px] theme-subtext">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Basic Pay ({basicPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> HRA ({hraPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> Medical ({medPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500 inline-block" /> Special ({specialPct}%)</span>
            </div>
          </div>

          {/* Allowance Breakdown Form Inputs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider theme-heading border-b border-slate-700/20 pb-1">
              Allowance Breakdown Components
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Basic Pay */}
              <div className="glass-card p-3 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Basic Salary (50%)
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-500">
                    {formatCurrency(basicPay)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={basicPay}
                  onChange={(e) => handleBasicChange(Number(e.target.value))}
                  className="w-full rounded-xl border p-2 theme-input focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* HRA */}
              <div className="glass-card p-3 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> HRA (House Rent) (30%)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    {formatCurrency(hra)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={hra}
                  onChange={(e) => handleHraChange(Number(e.target.value))}
                  className="w-full rounded-xl border p-2 theme-input focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Medical & Conveyance */}
              <div className="glass-card p-3 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Medical & Transport (8%)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {formatCurrency(medicalAllowance)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={medicalAllowance}
                  onChange={(e) => handleMedicalChange(Number(e.target.value))}
                  className="w-full rounded-xl border p-2 theme-input focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Special Allowance (Auto Balanced) */}
              <div className="glass-card p-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" /> Special Allowance (Auto)
                  </label>
                  <span className="text-xs font-mono font-bold text-violet-500">
                    {formatCurrency(specialAllowance)}
                  </span>
                </div>
                <input
                  type="number"
                  readOnly
                  value={specialAllowance}
                  className="w-full rounded-xl border p-2 theme-input bg-slate-800/40 text-slate-400 font-mono focus:outline-none cursor-not-allowed"
                />
                <p className="text-[10px] theme-subtext mt-1">
                  Auto-calculated to balance total base salary
                </p>
              </div>

            </div>
          </div>

          {/* Bonus & Total Compensation Footer Summary */}
          <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700/20">
            <div>
              <label className="block font-medium theme-subtext mb-1">
                Annual Performance Bonus ({symbol})
              </label>
              <input
                type="number"
                min="0"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="rounded-xl border p-2 text-xs theme-input focus:border-sky-500 focus:outline-none w-44 font-semibold"
              />
            </div>

            <div className="text-right">
              <span className="text-xs theme-subtext font-medium block">
                Total Annual Compensation (Base + Bonus)
              </span>
              <span className="text-lg font-bold text-emerald-500 font-mono">
                {formatCurrency(baseSalary + bonus)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-700/20 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl glass-card px-4 py-2 font-semibold theme-subtext hover:theme-heading cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isBalanced}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2 font-semibold text-white shadow-lg shadow-sky-500/20 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Salary Slip'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
