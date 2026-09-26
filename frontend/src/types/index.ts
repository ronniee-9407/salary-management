export interface Country {
  id: number;
  name: string;
  code: string;
  currency_code: string;
  currency_symbol: string;
  exchange_rate_to_usd: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'Male' | 'Female' | 'Non-Binary';
  job_title: string;
  department_id: number;
  country_id: number;
  base_salary: number;
  bonus: number;
  created_at: string;
  updated_at: string;
  country: Country;
  department: Department;
  salary_in_usd: number;
  total_compensation_usd: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: T[];
}

export interface AnalyticsSummary {
  total_employees: number;
  total_payroll_usd: number;
  formatted_total_payroll_usd: string;
  average_salary_usd: number;
  formatted_average_salary_usd: string;
  median_salary_usd: number;
  formatted_median_salary_usd: string;
  total_bonus_usd: number;
  formatted_total_bonus_usd: string;
}


export interface DepartmentAnalytics {
  department_id: number;
  department_name: string;
  employee_count: number;
  total_payroll_usd: number;
  average_salary_usd: number;
}

export interface CountryAnalytics {
  country_id: number;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
  employee_count: number;
  total_payroll_local: number;
  total_payroll_usd: number;
  average_salary_usd: number;
}

export interface GenderPayGap {
  gender: string;
  count: number;
  avg_salary_usd: number;
  median_salary_usd: number;
  pay_ratio_vs_male: number;
}

export interface EmployeeFilterState {
  page: number;
  pageSize: number;
  search: string;
  departmentId: number | null;
  countryId: number | null;
  gender: string | null;
  minSalaryUsd: number | null;
  maxSalaryUsd: number | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  displayCurrency: string; // 'USD' or 'LOCAL'
}

export interface TopRole {
  job_title: string;
  employee_count: number;
  avg_salary_usd: number;
  max_salary_usd: number;
  total_payroll_usd: number;
}
