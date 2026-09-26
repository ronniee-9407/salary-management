import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { loadAnalytics, loadMetadata } from './store/salarySlice';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeModal } from './components/EmployeeModal';
import type { Employee } from './types';


const MainDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  useEffect(() => {
    dispatch(loadMetadata() as any);
    dispatch(loadAnalytics() as any);
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Summary Banner */}
        <section>
          <KpiCards />
        </section>

        {/* HR Analytics & Visualizations */}
        <section>
          <AnalyticsCharts />
        </section>

        {/* 10,000 Employee Interactive Table */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Employee Compensation Records</h2>
              <p className="text-xs text-slate-400">Search and filter across 10,000 global employee salary profiles</p>
            </div>
          </div>
          <EmployeeTable
            onOpenCreateModal={handleOpenCreateModal}
            onOpenEditModal={handleOpenEditModal}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        ACME Corp Employee Salary Management System &bull; Evaluated for Technical Assessment &bull; Powered by FastAPI & React
      </footer>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeToEdit={employeeToEdit}
      />
    </div>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <MainDashboard />
    </Provider>
  );
}
