import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Employee, 
  PaginatedResponse, 
  AnalyticsSummary, 
  DepartmentAnalytics, 
  CountryAnalytics, 
  GenderPayGap, 
  Country, 
  Department,
  EmployeeFilterState,
  TopRole
} from '../types';

import * as api from '../services/api';

interface SalaryState {
  filters: EmployeeFilterState;
  employees: PaginatedResponse<Employee> | null;
  summary: AnalyticsSummary | null;
  departmentAnalytics: DepartmentAnalytics[];
  countryAnalytics: CountryAnalytics[];
  genderPayGap: GenderPayGap[];
  topRoles: TopRole[];
  countries: Country[];
  departments: Department[];
  loadingEmployees: boolean;
  loadingAnalytics: boolean;
  error: string | null;
  selectedEmployee: Employee | null;
}

const initialFilters: EmployeeFilterState = {
  page: 1,
  pageSize: 20,
  search: '',
  departmentId: null,
  countryId: null,
  gender: null,
  minSalaryUsd: null,
  maxSalaryUsd: null,
  sortBy: 'id',
  sortOrder: 'asc',
  displayCurrency: 'USD',
};

const initialState: SalaryState = {
  filters: initialFilters,
  employees: null,
  summary: null,
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
};

export const loadEmployees = createAsyncThunk(
  'salary/loadEmployees',
  async (_, { getState }) => {
    const state = getState() as { salary: SalaryState };
    return await api.fetchEmployees(state.salary.filters);
  }
);

export const loadAnalytics = createAsyncThunk(
  'salary/loadAnalytics',
  async () => {
    const [summary, deptAnalytics, countryAnalytics, payGap, topRoles] = await Promise.all([
      api.fetchAnalyticsSummary(),
      api.fetchDepartmentAnalytics(),
      api.fetchCountryAnalytics(),
      api.fetchGenderPayGap(),
      api.fetchTopRoles(),
    ]);
    return { summary, deptAnalytics, countryAnalytics, payGap, topRoles };
  }
);

export const loadMetadata = createAsyncThunk(
  'salary/loadMetadata',
  async () => {
    const [countries, departments] = await Promise.all([
      api.fetchCountries(),
      api.fetchDepartments(),
    ]);
    return { countries, departments };
  }
);

export const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<EmployeeFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload, page: action.payload.page || 1 };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    setDisplayCurrency: (state, action: PayloadAction<string>) => {
      state.filters.displayCurrency = action.payload;
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Employees
      .addCase(loadEmployees.pending, (state) => {
        state.loadingEmployees = true;
        state.error = null;
      })
      .addCase(loadEmployees.fulfilled, (state, action) => {
        state.loadingEmployees = false;
        state.employees = action.payload;
      })
      .addCase(loadEmployees.rejected, (state, action) => {
        state.loadingEmployees = false;
        state.error = action.error.message || 'Failed to load employee data';
      })

      // Analytics
      .addCase(loadAnalytics.pending, (state) => {
        state.loadingAnalytics = true;
      })
      .addCase(loadAnalytics.fulfilled, (state, action) => {
        state.loadingAnalytics = false;
        state.summary = action.payload.summary;
        state.departmentAnalytics = action.payload.deptAnalytics;
        state.countryAnalytics = action.payload.countryAnalytics;
        state.genderPayGap = action.payload.payGap;
        state.topRoles = action.payload.topRoles;
      })

      // Metadata
      .addCase(loadMetadata.fulfilled, (state, action) => {
        state.countries = action.payload.countries;
        state.departments = action.payload.departments;
      });
  },
});

export const { setFilter, resetFilters, setDisplayCurrency, setSelectedEmployee } = salarySlice.actions;
export default salarySlice.reducer;
