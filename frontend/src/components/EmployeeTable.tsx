import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setFilter, loadEmployees } from '../store/salarySlice';
import type { Employee } from '../types';
import * as api from '../services/api';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserPlus,
  Edit2,
  Globe,
  Download,
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
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await api.exportEmployeesCsv();
    } catch (err) {
      console.error('CSV export failed', err);
    } finally {
      setExporting(false);
    }
  };

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
    <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-700/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 theme-subtext" />
            <input
              type="text"
              placeholder="Search 10,000 employees..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border py-2 pl-9 pr-4 text-xs theme-input focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filters.departmentId || ''}
            onChange={(e) => dispatch(setFilter({ departmentId: e.target.value ? Number(e.target.value) : null, page: 1 }))}
            className="rounded-xl border py-2 px-3 text-xs theme-input cursor-pointer focus:border-sky-500 focus:outline-none"
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
            className="rounded-xl border py-2 px-3 text-xs theme-input cursor-pointer focus:border-sky-500 focus:outline-none"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.currency_code})</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl glass-card px-4 py-2 text-xs font-semibold theme-subtext hover:theme-heading hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 hover:from-blue-500 hover:to-sky-400 hover:scale-105 active:scale-95 cursor-pointer transition"
          >
            <UserPlus className="h-4 w-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="theme-table-header theme-subtext uppercase font-semibold border-b border-slate-700/20">
            <tr>
              <th className="py-3.5 px-4 cursor-pointer hover:theme-heading select-none" onClick={() => handleSort('employee_id')}>
                <div className="flex items-center gap-1">Emp ID <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:theme-heading select-none" onClick={() => handleSort('first_name')}>
                <div className="flex items-center gap-1">Employee <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4">Role & Dept</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 cursor-pointer hover:theme-heading select-none" onClick={() => handleSort('base_salary')}>
                <div className="flex items-center gap-1">Base Salary <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="py-3.5 px-4">Bonus</th>
              <th className="py-3.5 px-4 font-bold theme-heading">Total Comp ({filters.displayCurrency})</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {loadingEmployees ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-4 px-4"><div className="h-4 glass-card rounded" /></td>
                </tr>
              ))
            ) : employees?.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center theme-muted">
                  No employee records matched your filter criteria.
                </td>
              </tr>
            ) : (
              employees?.items.map((emp) => (
                <tr key={emp.id} className="theme-table-row">
                  <td className="py-3.5 px-4 font-mono text-sky-500 font-semibold">{emp.employee_id || `ACM${emp.id.toString().padStart(5, '0')}`}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold theme-heading">{emp.first_name} {emp.last_name}</div>
                    <div className="text-[11px] theme-subtext">{emp.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium theme-heading">{emp.job_title}</div>
                    <div className="text-[10px] text-sky-500 font-semibold">{emp.department.name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 theme-subtext">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      {emp.country.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium theme-heading">
                    {formatMoney(emp.base_salary, emp.country.currency_symbol, emp.country.exchange_rate_to_usd)}
                  </td>
                  <td className="py-3.5 px-4 theme-subtext">
                    {formatMoney(emp.bonus, emp.country.currency_symbol, emp.country.exchange_rate_to_usd)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-500">
                    {formatMoney(emp.base_salary + emp.bonus, emp.country.currency_symbol, emp.country.exchange_rate_to_usd)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenEditModal(emp)}
                      className="rounded-lg p-1.5 theme-subtext hover:theme-heading hover:bg-sky-500/10 cursor-pointer transition"
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
        <div className="p-4 border-t border-slate-700/20 flex items-center justify-between text-xs theme-subtext">
          <div>
            Showing <span className="font-bold theme-heading">{((employees.page - 1) * employees.page_size) + 1}</span> to{' '}
            <span className="font-bold theme-heading">{Math.min(employees.page * employees.page_size, employees.total)}</span> of{' '}
            <span className="font-bold theme-heading">{employees.total.toLocaleString()}</span> employees
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(setFilter({ page: employees.page - 1 }))}
              disabled={employees.page <= 1}
              className="flex items-center gap-1 rounded-lg glass-card px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:theme-heading theme-subtext transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="px-2 font-medium theme-subtext">
              Page {employees.page} of {employees.total_pages}
            </span>
            <button
              onClick={() => dispatch(setFilter({ page: employees.page + 1 }))}
              disabled={employees.page >= employees.total_pages}
              className="flex items-center gap-1 rounded-lg glass-card px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:theme-heading theme-subtext transition"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
