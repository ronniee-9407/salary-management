import axios from 'axios';
import type { 
  Employee, 
  PaginatedResponse, 
  AnalyticsSummary, 
  DepartmentAnalytics, 
  CountryAnalytics, 
  GenderPayGap, 
  Country, 
  Department,
  EmployeeFilterState 
} from '../types';


const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchEmployees = async (filters: Partial<EmployeeFilterState>): Promise<PaginatedResponse<Employee>> => {
  const params: Record<string, any> = {
    page: filters.page || 1,
    page_size: filters.pageSize || 20,
    sort_by: filters.sortBy || 'id',
    sort_order: filters.sortOrder || 'asc',
  };

  if (filters.search) params.search = filters.search;
  if (filters.departmentId) params.department_id = filters.departmentId;
  if (filters.countryId) params.country_id = filters.countryId;
  if (filters.gender) params.gender = filters.gender;
  if (filters.minSalaryUsd) params.min_salary_usd = filters.minSalaryUsd;
  if (filters.maxSalaryUsd) params.max_salary_usd = filters.maxSalaryUsd;

  const response = await api.get<PaginatedResponse<Employee>>('/employees', { params });
  return response.data;
};

export const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await api.get<AnalyticsSummary>('/analytics/summary');
  return response.data;
};

export const fetchDepartmentAnalytics = async (): Promise<DepartmentAnalytics[]> => {
  const response = await api.get<DepartmentAnalytics[]>('/analytics/by-department');
  return response.data;
};

export const fetchCountryAnalytics = async (): Promise<CountryAnalytics[]> => {
  const response = await api.get<CountryAnalytics[]>('/analytics/by-country');
  return response.data;
};

export const fetchGenderPayGap = async (): Promise<GenderPayGap[]> => {
  const response = await api.get<GenderPayGap[]>('/analytics/pay-gap');
  return response.data;
};

export const fetchCountries = async (): Promise<Country[]> => {
  const response = await api.get<Country[]>('/meta/countries');
  return response.data;
};

export const fetchDepartments = async (): Promise<Department[]> => {
  const response = await api.get<Department[]>('/meta/departments');
  return response.data;
};

export const createEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  const response = await api.post<Employee>('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id: number, employeeData: Partial<Employee>): Promise<Employee> => {
  const response = await api.put<Employee>(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await api.delete(`/employees/${id}`);
};
