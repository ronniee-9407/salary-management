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

const COLORS = ['#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

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
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total Payroll (USD)']}
              />
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
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Payroll']}
                />
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
            {genderPayGap.map((item) => (
              <div key={item.gender} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{item.gender} ({item.count})</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">${item.avg_salary_usd.toLocaleString()}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      item.pay_ratio_vs_male >= 98
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {item.pay_ratio_vs_male}% ratio
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
