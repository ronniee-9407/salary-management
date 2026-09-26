import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import salaryReducer from '../store/salarySlice';
import { ThemeProvider } from '../context/ThemeContext';
import { KpiCards } from '../components/KpiCards';

const createMockStore = (overrides = {}) =>
  configureStore({
    reducer: { salary: salaryReducer },
    preloadedState: {
      salary: {
        filters: {
          page: 1,
          pageSize: 20,
          search: '',
          departmentId: null,
          countryId: null,
          gender: null,
          minSalaryUsd: null,
          maxSalaryUsd: null,
          sortBy: 'id',
          sortOrder: 'asc' as const,
          displayCurrency: 'USD',
        },
        employees: null,
        summary: {
          total_employees: 10000,
          total_payroll_usd: 1079183566.52,
          formatted_total_payroll_usd: '$1.08 Billion',
          average_salary_usd: 107918.36,
          formatted_average_salary_usd: '$107,918',
          median_salary_usd: 106019.83,
          formatted_median_salary_usd: '$106,020',
          total_bonus_usd: 114637967.54,
          formatted_total_bonus_usd: '$114.64 Million',
        },
        departmentAnalytics: [],
        countryAnalytics: [],
        genderPayGap: [],
        topRoles: [],
        countries: [],
        departments: [],
        loadingEmployees: false,
        loadingAnalytics: false,
        error: null,
        selectedEmployee: null,
        ...overrides,
      },
    },
  });

describe('KpiCards', () => {
  it('renders all 4 KPI cards with formatted data', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ThemeProvider>
          <KpiCards />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText('Global Workforce')).toBeInTheDocument();
    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText('Total Payroll Cost')).toBeInTheDocument();
    expect(screen.getByText('$1.08 Billion')).toBeInTheDocument();
    expect(screen.getByText('Average Base Salary')).toBeInTheDocument();
    expect(screen.getByText('$107,918')).toBeInTheDocument();
    expect(screen.getByText('Median Base Salary')).toBeInTheDocument();
    expect(screen.getByText('$106,020')).toBeInTheDocument();
  });

  it('renders loading skeleton when analytics are loading', () => {
    const store = createMockStore({ loadingAnalytics: true });
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider>
          <KpiCards />
        </ThemeProvider>
      </Provider>
    );

    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBe(4);
  });

  it('displays bonus subtitle text', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ThemeProvider>
          <KpiCards />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText('+$114.64 Million in bonuses')).toBeInTheDocument();
  });
});
