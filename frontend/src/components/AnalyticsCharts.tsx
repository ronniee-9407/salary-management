import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PieChart, Pie, Cell as PieCell } from 'recharts';
import { PieChart as PieIcon, BarChart3, Scale } from 'lucide-react';

const COLORS = [
  '#38bdf8', // sky-400
  '#34d399', // emerald-400
  '#a78bfa', // violet-400
  '#fb923c', // orange-400
  '#f472b6', // pink-400
  '#facc15', // yellow-400
  '#60a5fa', // blue-400
  '#4ade80', // green-400
];

const formatCompactUsd = (num: number): string => {
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)} Billion`;
  if (abs >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)} Million`;
  return `$${num.toLocaleString()}`;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel rounded-xl p-3 border border-slate-700 text-xs shadow-xl bg-slate-900/95">
        <div className="font-bold text-white flex items-center gap-1.5">
          <span>{data.country_name}</span>
          <span className="text-[10px] text-sky-400 font-normal">({data.currency_code})</span>
        </div>
        <div className="mt-1 text-emerald-400 font-semibold">
          Payroll: {formatCompactUsd(data.total_payroll_usd)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {data.employee_count?.toLocaleString()} Employees &bull; Avg ${Math.round(data.average_salary_usd).toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel rounded-xl p-3 border border-slate-700 text-xs shadow-xl bg-slate-900/95">
        <div className="font-bold text-white">
          {data.department_name} Department
        </div>
        <div className="mt-1 text-sky-400 font-semibold">
          Payroll: {formatCompactUsd(data.total_payroll_usd)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {data.employee_count?.toLocaleString()} Employees &bull; Avg ${Math.round(data.average_salary_usd).toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsCharts: React.FC = () => {
  const deptAnalytics = useSelector((state: RootState) => state.salary.departmentAnalytics);
  const countryAnalytics = useSelector((state: RootState) => state.salary.countryAnalytics);
  const genderPayGap = useSelector((state: RootState) => state.salary.genderPayGap);
  const loading = useSelector((state: RootState) => state.salary.loadingAnalytics);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel h-80 animate-pulse rounded-2xl p-6 border border-slate-800" />
        <div className="glass-panel h-80 animate-pulse rounded-2xl p-6 border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

      {/* Department Breakdown */}
      <div className="glass-panel lg:col-span-2 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Department Payroll & Headcount</h3>
          </div>
          <span className="text-xs text-slate-400">Total Expenditure (USD)</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptAnalytics} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="department_name" stroke="#64748b" tick={{ fontSize: 11 }} interval={0} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="total_payroll_usd" radius={[8, 8, 0, 0]}>
                {deptAnalytics.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Country Distribution & Gender Gap */}
      <div className="flex flex-col gap-6">
        {/* Country Breakdown */}
        <div className="glass-panel flex-1 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-white">Country Cost Share</h3>
            </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryAnalytics}
                  dataKey="total_payroll_usd"
                  nameKey="country_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={35}
                  paddingAngle={4}
                >
                  {countryAnalytics.map((_, index) => (
                    <PieCell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Gender Pay Ratio */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-white">Gender Pay Parity Ratio</h3>
          </div>
          <div className="space-y-2">
            {genderPayGap.map((item) => {
              const isMale = item.gender === 'Male';
              const ratio = item.pay_ratio_vs_male;
              let badgeClass = '';
              let badgeLabel = '';
              if (isMale) {
                badgeClass = 'bg-sky-950 text-sky-400 border border-sky-800';
                badgeLabel = 'Baseline';
              } else if (ratio >= 100) {
                badgeClass = 'bg-emerald-950 text-emerald-400 border border-emerald-800';
                badgeLabel = `${ratio.toFixed(1)}% ↑ parity`;
              } else if (ratio >= 98) {
                badgeClass = 'bg-emerald-950 text-emerald-400 border border-emerald-800';
                badgeLabel = `${ratio.toFixed(1)}% ratio`;
              } else {
                badgeClass = 'bg-amber-950 text-amber-400 border border-amber-800';
                badgeLabel = `${ratio.toFixed(1)}% ratio`;
              }
              return (
                <div key={item.gender} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.gender} ({item.count.toLocaleString()})</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">${Math.round(item.avg_salary_usd).toLocaleString()}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
