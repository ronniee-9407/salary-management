import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

export const KpiCards: React.FC = () => {
  const summary = useSelector((state: RootState) => state.salary.summary);
  const loading = useSelector((state: RootState) => state.salary.loadingAnalytics);

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card h-28 animate-pulse rounded-2xl p-5 border border-slate-800" />
        ))}
      </div>
    );
  }



  const kpis = [
    {
      title: 'Global Workforce',
      value: summary.total_employees.toLocaleString(),
      subtitle: 'Across 8 Countries',
      icon: Users,
      color: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-cyan-500/10',
    },
    {
      title: 'Total Payroll Cost',
      value: summary.formatted_total_payroll_usd,
      subtitle: `+${summary.formatted_total_bonus_usd} in bonuses`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-400',
      shadow: 'shadow-emerald-500/10',
    },
    {
      title: 'Average Base Salary',
      value: summary.formatted_average_salary_usd,
      subtitle: 'Per Employee / Year',
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-400',
      shadow: 'shadow-purple-500/10',
    },
    {
      title: 'Median Base Salary',
      value: summary.formatted_median_salary_usd,
      subtitle: 'Org Midpoint Baseline',
      icon: Award,
      color: 'from-amber-500 to-orange-400',
      shadow: 'shadow-amber-500/10',
    },
  ];



  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`glass-panel relative overflow-hidden rounded-2xl p-5 shadow-xl ${kpi.shadow} transition-all duration-200 hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold theme-subtext uppercase tracking-wider">{kpi.title}</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight theme-heading">{kpi.value}</h3>
                <p className="mt-1 text-[11px] font-medium theme-subtext">{kpi.subtitle}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
