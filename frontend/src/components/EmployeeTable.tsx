import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setFilter, loadEmployees } from '../store/salarySlice';
import type { Employee } from '../types';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserPlus,
  Edit2,
  Globe,
} from 'lucide-react';


interface EmployeeTableProps {
  onOpenCreateModal: () => void;
  onOpenEditModal: (emp: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ onOpenCreateModal, onOpenEditModal }) => {
  const dispatch = useDispatch();
  const { filters, employees, countries, departments, loadingEmployees } = useSelector(
    (state: RootState) => state.salary
  );

  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilter({ search: searchInput, page: 1 }));
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput, filters.search, dispatch]);

  // Load employees whenever filters change
  useEffect(() => {
    dispatch(loadEmployees() as any);
  }, [filters, dispatch]);

  const handleSort = (field: string) => {
    const isAsc = filters.sortBy === field && filters.sortOrder === 'asc';
    dispatch(
      setFilter({
        sortBy: field,
        sortOrder: isAsc ? 'desc' : 'asc',
      })
    );
  };

  const formatMoney = (amount: number, symbol: string, rate: number) => {
    if (filters.displayCurrency === 'LOCAL') {
      return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    const usdAmount = amount * rate;
    return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 10,000 employees..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filters.departmentId || ''}
            onChange={(e) => dispatch(setFilter({ departmentId: e.target.value ? Number(e.target.value) : null, page: 1 }))}
            className="rounded-xl border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-300 focus:border-sky-500 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Country Filter */}
          <select
            value={filters.countryId || ''}
            onChange={(e) => dispatch(setFilter({ countryId: e.target.value ? Number(e.target.value) : null, page: 1 }))}
            className="rounded-xl border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-300 focus:border-sky-500 focus:outline-none"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.currency_code})</option>
            ))}
          </select>
        </div>

        {/* Action button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 hover:from-brand-500 hover:to-sky-400 transition"
        >
          <UserPlus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Employee Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1">ID <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('first_name')}>
                <div className="flex items-center gap-1">Employee <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4">Role & Dept</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('base_salary')}>
                <div className="flex items-center gap-1">Base Salary <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4">Bonus</th>
              <th className="py-3.5 px-4 font-bold text-white">Total Comp ({filters.displayCurrency})</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loadingEmployees ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-4 px-4"><div className="h-4 bg-slate-800/60 rounded" /></td>
                </tr>
              ))
            ) : employees?.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No employee records matched your filter criteria.
                </td>
              </tr>
            ) : (
              employees?.items.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">#{emp.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{emp.first_name} {emp.last_name}</div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{emp.job_title}</div>
                    <div className="text-[10px] text-sky-400 font-semibold">{emp.department.name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Globe className="h-3.5 w-3.5 text-slate-500" />
                      {emp.country.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {formatMoney(emp.base_salary, emp.country.currency_symbol, emp.country.exchange_rate_to_usd)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {formatMoney(emp.bonus, emp.country.currency_symbol, emp.country.exchange_rate_to_usd)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {formatMoney(emp.base_salary + emp.bonus, emp.country.currency_symbol, emp.country.exchange_rate_to_usd)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenEditModal(emp)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      title="Edit Salary / Role"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {employees && (
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/40 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{((employees.page - 1) * employees.page_size) + 1}</span> to{' '}
            <span className="font-bold text-white">{Math.min(employees.page * employees.page_size, employees.total)}</span> of{' '}
            <span className="font-bold text-white">{employees.total.toLocaleString()}</span> employees
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(setFilter({ page: employees.page - 1 }))}
              disabled={employees.page <= 1}
              className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-800 text-white transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="px-2 font-medium text-slate-300">
              Page {employees.page} of {employees.total_pages}
            </span>
            <button
              onClick={() => dispatch(setFilter({ page: employees.page + 1 }))}
              disabled={employees.page >= employees.total_pages}
              className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-800 text-white transition"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
