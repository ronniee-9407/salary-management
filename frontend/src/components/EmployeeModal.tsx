import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Employee } from '../types';

import * as api from '../services/api';
import { loadEmployees, loadAnalytics } from '../store/salarySlice';
import { X, Save, UserCheck } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employeeToEdit }) => {
  const dispatch = useDispatch();
  const { countries, departments } = useSelector((state: RootState) => state.salary);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gender: 'Male' as 'Male' | 'Female' | 'Non-Binary',
    job_title: '',
    department_id: 1,
    country_id: 1,
    base_salary: 75000,
    bonus: 10000,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        first_name: employeeToEdit.first_name,
        last_name: employeeToEdit.last_name,
        email: employeeToEdit.email,
        gender: employeeToEdit.gender,
        job_title: employeeToEdit.job_title,
        department_id: employeeToEdit.department_id,
        country_id: employeeToEdit.country_id,
        base_salary: employeeToEdit.base_salary,
        bonus: employeeToEdit.bonus,
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        gender: 'Male',
        job_title: 'Software Engineer',
        department_id: departments[0]?.id || 1,
        country_id: countries[0]?.id || 1,
        base_salary: 85000,
        bonus: 10000,
      });
    }
  }, [employeeToEdit, countries, departments, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (employeeToEdit) {
        await api.updateEmployee(employeeToEdit.id, formData);
      } else {
        await api.createEmployee(formData);
      }
      dispatch(loadEmployees() as any);
      dispatch(loadAnalytics() as any);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save employee data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">
              {employeeToEdit ? `Edit Employee #${employeeToEdit.id}` : 'Add New Employee'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-950/60 border border-red-800 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Country</label>
              <select
                value={formData.country_id}
                onChange={(e) => setFormData({ ...formData, country_id: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.currency_code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Base Salary (Local Currency)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Annual Bonus (Local Currency)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2 font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white shadow-lg shadow-sky-500/20 hover:bg-brand-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
