import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Employee } from '../types';
import * as api from '../services/api';
import { loadEmployees, loadAnalytics } from '../store/salarySlice';
import { X, FileText, Save, CheckCircle2, ShieldAlert, DollarSign, Globe } from 'lucide-react';

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
  const globalDisplayCurrency = useSelector((state: RootState) => state.salary.filters.displayCurrency);

  const [modalCurrency, setModalCurrency] = useState<'USD' | 'LOCAL'>(globalDisplayCurrency);
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [basicPay, setBasicPay] = useState<number>(0);
  const [hra, setHra] = useState<number>(0);
  const [medicalAllowance, setMedicalAllowance] = useState<number>(0);
  const [specialAllowance, setSpecialAllowance] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lock background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (employee) {
      const mode = globalDisplayCurrency;
      setModalCurrency(mode);

      const fxRate = employee.country.exchange_rate_to_usd || 1.0;
      const base = mode === 'USD' 
        ? Math.round(employee.base_salary * fxRate)
        : Math.round(employee.base_salary);
      const bns = mode === 'USD'
        ? Math.round((employee.bonus || 0) * fxRate)
        : Math.round(employee.bonus || 0);

      setBaseSalary(base);
      setBonus(bns);

      // Breakdown: 50% Basic, 30% HRA, 8% Medical, 12% Special
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
  }, [employee, isOpen, globalDisplayCurrency]);

  if (!isOpen || !employee) return null;

  const fxRate = employee.country.exchange_rate_to_usd || 1.0;
  const localSymbol = employee.country.currency_symbol;
  const localCode = employee.country.currency_code;

  const activeSymbol = modalCurrency === 'USD' ? '$' : localSymbol;
  const activeCode = modalCurrency === 'USD' ? 'USD' : localCode;

  // Toggle currency between USD and LOCAL in modal
  const handleToggleCurrency = (targetMode: 'USD' | 'LOCAL') => {
    if (targetMode === modalCurrency) return;

    if (targetMode === 'USD') {
      const newBase = Math.round(baseSalary * fxRate);
      const newBasic = Math.round(basicPay * fxRate);
      const newHra = Math.round(hra * fxRate);
      const newMed = Math.round(medicalAllowance * fxRate);
      const newSpecial = newBase - (newBasic + newHra + newMed);
      const newBonus = Math.round(bonus * fxRate);

      setBaseSalary(newBase);
      setBasicPay(newBasic);
      setHra(newHra);
      setMedicalAllowance(newMed);
      setSpecialAllowance(newSpecial);
      setBonus(newBonus);
    } else {
      const newBase = Math.round(baseSalary / fxRate);
      const newBasic = Math.round(basicPay / fxRate);
      const newHra = Math.round(hra / fxRate);
      const newMed = Math.round(medicalAllowance / fxRate);
      const newSpecial = newBase - (newBasic + newHra + newMed);
      const newBonus = Math.round(bonus / fxRate);

      setBaseSalary(newBase);
      setBasicPay(newBasic);
      setHra(newHra);
      setMedicalAllowance(newMed);
      setSpecialAllowance(newSpecial);
      setBonus(newBonus);
    }
    setModalCurrency(targetMode);
  };

  const formatCurrency = (amount: number) => {
    return `${activeSymbol}${Math.round(amount).toLocaleString('en-US')}`;
  };

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
  const isBalanced = Math.abs(totalAllowancesSum - baseSalary) < 2;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setError('Total of all allowances must strictly equal the Base Salary.');
      return;
    }

    setSaving(true);
    setError(null);

    const saveBaseLocal = modalCurrency === 'USD' ? roundTo(baseSalary / fxRate, 2) : roundTo(baseSalary, 2);
    const saveBonusLocal = modalCurrency === 'USD' ? roundTo(bonus / fxRate, 2) : roundTo(bonus, 2);

    try {
      await api.updateEmployee(employee.id, {
        base_salary: saveBaseLocal,
        bonus: saveBonusLocal,
      });
      dispatch(loadEmployees() as any);
      dispatch(loadAnalytics() as any);
      setSuccessMsg('Salary slip breakup saved to database!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update salary breakup');
    } finally {
      setSaving(false);
    }
  };

  const roundTo = (num: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  };

  const basicPct = baseSalary > 0 ? Math.round((basicPay / baseSalary) * 100) : 0;
  const hraPct = baseSalary > 0 ? Math.round((hra / baseSalary) * 100) : 0;
  const medPct = baseSalary > 0 ? Math.round((medicalAllowance / baseSalary) * 100) : 0;
  const specialPct = baseSalary > 0 ? Math.max(0, 100 - (basicPct + hraPct + medPct)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700/20 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold theme-heading">
                  {employee.first_name} {employee.last_name}
                </h2>
                <span className="text-[10px] font-mono font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {employee.employee_id || `ACM${employee.id.toString().padStart(5, '0')}`}
                </span>
              </div>
              <p className="text-[11px] theme-subtext flex items-center gap-1.5 mt-0.5">
                <span>{employee.job_title}</span> &bull; 
                <span className="text-sky-500 font-medium">{employee.department.name}</span> &bull; 
                <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-slate-400" /> {employee.country.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Modal Currency Toggle */}
            <div className="flex items-center rounded-lg glass-card p-0.5">
              <button
                type="button"
                onClick={() => handleToggleCurrency('USD')}
                className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md cursor-pointer transition-all ${
                  modalCurrency === 'USD'
                    ? 'bg-blue-600 text-white shadow'
                    : 'theme-subtext hover:theme-heading'
                }`}
              >
                <DollarSign className="h-3 w-3" /> USD
              </button>
              <button
                type="button"
                onClick={() => handleToggleCurrency('LOCAL')}
                className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md cursor-pointer transition-all ${
                  modalCurrency === 'LOCAL'
                    ? 'bg-blue-600 text-white shadow'
                    : 'theme-subtext hover:theme-heading'
                }`}
              >
                <Globe className="h-3 w-3" /> {localCode}
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1 theme-subtext hover:theme-heading hover:bg-slate-700/20 cursor-pointer transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-500 font-medium flex items-center gap-2 shrink-0">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-500 font-medium flex items-center gap-2 shrink-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="mt-3 flex-1 overflow-y-auto pr-1 space-y-3.5 text-xs">
          
          {/* Total Base Salary Banner */}
          <div className="glass-card rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-sky-500/20 bg-sky-500/5">
            <div>
              <span className="text-[10px] font-semibold uppercase theme-subtext tracking-wider">
                Total Base Salary ({activeCode})
              </span>
              <div className="text-lg font-bold theme-heading mt-0.5 font-mono">
                {formatCurrency(baseSalary)}
              </div>
              <p className="text-[10px] theme-subtext">
                Allowances below strictly balance to this total
              </p>
            </div>

            <div className="w-full sm:w-44">
              <label className="block font-medium theme-subtext text-[10px] mb-0.5">
                Edit Base ({activeSymbol})
              </label>
              <input
                type="number"
                min="1"
                value={baseSalary}
                onChange={(e) => handleBaseSalaryChange(Number(e.target.value))}
                className="w-full rounded-xl border p-1.5 text-xs theme-input focus:border-sky-500 focus:outline-none font-semibold font-mono"
              />
            </div>
          </div>

          {/* Visual Allowance Distribution Bar */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-medium theme-subtext">
              <span>Component Breakdown</span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> 100% ({formatCurrency(totalAllowancesSum)})
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full glass-card overflow-hidden flex">
              <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${basicPct}%` }} title={`Basic Pay: ${basicPct}%`} />
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${hraPct}%` }} title={`HRA: ${hraPct}%`} />
              <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${medPct}%` }} title={`Medical: ${medPct}%`} />
              <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: `${specialPct}%` }} title={`Special Allowance: ${specialPct}%`} />
            </div>

            <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] theme-subtext">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Basic ({basicPct}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> HRA ({hraPct}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> Medical ({medPct}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500 inline-block" /> Special ({specialPct}%)</span>
            </div>
          </div>

          {/* Allowance Breakdown Form Inputs */}
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider theme-heading border-b border-slate-700/20 pb-0.5">
              Allowance Breakdown Components ({activeCode})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Basic Pay */}
              <div className="glass-card p-2.5 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading text-[11px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Basic Pay
                  </label>
                  <span className="text-[11px] font-mono font-bold text-blue-500">
                    {formatCurrency(basicPay)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={basicPay}
                  onChange={(e) => handleBasicChange(Number(e.target.value))}
                  className="w-full rounded-xl border p-1.5 text-xs theme-input focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              {/* HRA */}
              <div className="glass-card p-2.5 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading text-[11px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> HRA (Rent)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-emerald-500">
                    {formatCurrency(hra)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={hra}
                  onChange={(e) => handleHraChange(Number(e.target.value))}
                  className="w-full rounded-xl border p-1.5 text-xs theme-input focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              {/* Medical & Conveyance */}
              <div className="glass-card p-2.5 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading text-[11px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Medical & Transport
                  </label>
                  <span className="text-[11px] font-mono font-bold text-amber-500">
                    {formatCurrency(medicalAllowance)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={medicalAllowance}
                  onChange={(e) => handleMedicalChange(Number(e.target.value))}
                  className="w-full rounded-xl border p-1.5 text-xs theme-input focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              {/* Special Allowance (Auto Balanced) */}
              <div className="glass-card p-2.5 rounded-xl border border-violet-500/20 bg-violet-500/5">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold theme-heading text-[11px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Special (Auto)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-violet-500">
                    {formatCurrency(specialAllowance)}
                  </span>
                </div>
                <input
                  type="number"
                  readOnly
                  value={specialAllowance}
                  className="w-full rounded-xl border p-1.5 text-xs theme-input bg-slate-800/40 text-slate-400 font-mono focus:outline-none cursor-not-allowed"
                />
                <p className="text-[9px] theme-subtext mt-0.5">
                  Auto-balances to equal base salary
                </p>
              </div>

            </div>
          </div>

          {/* Bonus & Total Compensation Footer Summary */}
          <div className="glass-card p-3 rounded-xl flex items-center justify-between gap-3 border-t border-slate-700/20">
            <div>
              <label className="block font-medium theme-subtext text-[10px] mb-0.5">
                Annual Bonus ({activeSymbol})
              </label>
              <input
                type="number"
                min="0"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="rounded-xl border p-1.5 text-xs theme-input focus:border-sky-500 focus:outline-none w-36 font-semibold font-mono"
              />
            </div>

            <div className="text-right">
              <span className="text-[10px] theme-subtext font-medium block">
                Total Compensation ({activeCode})
              </span>
              <span className="text-base font-bold text-emerald-500 font-mono">
                {formatCurrency(baseSalary + bonus)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-700/20 pt-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl glass-card px-4 py-1.5 font-semibold text-xs theme-subtext hover:theme-heading cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isBalanced}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Salary Slip'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
