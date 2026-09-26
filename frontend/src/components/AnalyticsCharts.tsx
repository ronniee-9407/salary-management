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
import { PieChart as PieIcon, BarChart3, Scale, Trophy } from 'lucide-react';

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
      <div className="glass-panel rounded-xl p-3 text-xs shadow-xl backdrop-blur-md">
        <div className="font-bold theme-heading flex items-center gap-1.5">
          <span>{data.country_name}</span>
          <span className="text-[10px] text-sky-500 font-medium">({data.currency_code})</span>
        </div>
        <div className="mt-1 text-emerald-500 font-semibold">
          Payroll: {formatCompactUsd(data.total_payroll_usd)}
        </div>
        <div className="text-[11px] theme-subtext mt-0.5">
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
      <div className="glass-panel rounded-xl p-3 text-xs shadow-xl backdrop-blur-md">
        <div className="font-bold theme-heading">
          {data.department_name} Department
        </div>
        <div className="mt-1 text-sky-500 font-semibold">
          Payroll: {formatCompactUsd(data.total_payroll_usd)}
        </div>
        <div className="text-[11px] theme-subtext mt-0.5">
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
  const topRoles = useSelector((state: RootState) => state.salary.topRoles);
  const loading = useSelector((state: RootState) => state.salary.loadingAnalytics);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel h-80 animate-pulse rounded-2xl p-6" />
        <div className="glass-panel h-80 animate-pulse rounded-2xl p-6" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Department Breakdown */}
        <div className="glass-panel lg:col-span-2 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-semibold theme-heading">Department Payroll & Headcount</h3>
            </div>
            <span className="text-xs theme-subtext">Total Expenditure (USD)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAnalytics} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="department_name" stroke="var(--chart-axis)" tick={{ fontSize: 11 }} interval={0} />
                <YAxis
                  stroke="var(--chart-axis)"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
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
          <div className="glass-panel flex-1 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold theme-heading">Country Cost Share</h3>
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
          <div className="glass-panel rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-semibold theme-heading">Gender Pay Parity Ratio</h3>
            </div>
            <div className="space-y-2">
              {genderPayGap.map((item) => {
                const isMale = item.gender === 'Male';
                const ratio = item.pay_ratio_vs_male;
                let badgeClass = '';
                let badgeLabel = '';
                if (isMale) {
                  badgeClass = 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
                  badgeLabel = 'Baseline';
                } else if (ratio >= 100) {
                  badgeClass = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
                  badgeLabel = `${ratio.toFixed(1)}% ↑ parity`;
                } else if (ratio >= 98) {
                  badgeClass = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
                  badgeLabel = `${ratio.toFixed(1)}% ratio`;
                } else {
                  badgeClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                  badgeLabel = `${ratio.toFixed(1)}% ratio`;
                }
                return (
                  <div key={item.gender} className="flex items-center justify-between text-xs">
                    <span className="theme-subtext font-medium">{item.gender} ({item.count.toLocaleString()})</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold theme-heading">${Math.round(item.avg_salary_usd).toLocaleString()}</span>
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

      {/* Top 5 Highest-Paid Roles */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl mt-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-semibold theme-heading">Top 5 Highest-Paid Roles</h3>
          <span className="ml-auto text-xs theme-subtext">Average Base Salary (USD)</span>
        </div>
        <div className="space-y-3">
          {topRoles.map((role, idx) => {
            const maxAvg = topRoles[0]?.avg_salary_usd || 1;
            const pct = Math.round((role.avg_salary_usd / maxAvg) * 100);
            const barColors = ['from-amber-500 to-yellow-400', 'from-sky-500 to-cyan-400', 'from-violet-500 to-purple-400', 'from-emerald-500 to-teal-400', 'from-pink-500 to-rose-400'];
            return (
              <div key={role.job_title} className="flex items-center gap-3">
                <span className="text-xs font-bold theme-subtext w-4">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold theme-heading">{role.job_title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] theme-subtext">{role.employee_count.toLocaleString()} employees</span>
                      <span className="text-xs font-bold text-amber-400">${Math.round(role.avg_salary_usd).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full glass-card overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${barColors[idx]} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
