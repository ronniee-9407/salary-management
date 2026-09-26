# System Architecture & Technical Design Document

**Project:** ACME Corp — Employee Salary Management Software  
**Stack:** Python FastAPI + PostgreSQL / SQLite + React (Vite + TypeScript + Redux Toolkit)

---

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite + TS)                       │
│  ┌──────────────────────┐   ┌─────────────────────┐   ┌──────────────┐ │
│  │  HR Analytics Dash   │   │  10k Data Table UI  │   │ Redux Store  │ │
│  └──────────┬───────────┘   └──────────┬──────────┘   └──────┬───────┘ │
└─────────────┼──────────────────────────┼─────────────────────┼─────────┘
              │                          │                     │
              └──────────────────────────┼─────────────────────┘
                                         │ REST APIs (JSON)
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend (Python 3.11+)                   │
│  ┌──────────────────────┐   ┌─────────────────────┐   ┌──────────────┐ │
│  │  Employees API       │   │  Analytics API      │   │ Seed Script  │ │
│  └──────────┬───────────┘   └──────────┬──────────┘   └──────┬───────┘ │
│             │                          │                     │         │
│             └──────────────────────────┼─────────────────────┘         │
│                                        ▼                               │
│                         SQLAlchemy 2.0 ORM / Core                      │
└────────────────────────────────────────┬───────────────────────────────┘
                                         │ Indexed SQL Queries
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Relational Database (PostgreSQL / SQLite)            │
│  Tables: employees, departments, countries, salaries                   │
│  Indexes: idx_emp_country_dept, idx_emp_salary, idx_emp_name           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Design & Indexing Strategy

### 2.1 Entity Relationship Model
- **`departments`**: `id`, `name`, `code`
- **`countries`**: `id`, `name`, `code`, `currency_code`, `currency_symbol`, `exchange_rate_to_usd`
- **`employees`**:
  - `id` (UUID / Integer Primary Key)
  - `first_name`, `last_name`, `email`
  - `gender`
  - `department_id` (FK to `departments.id`)
  - `country_id` (FK to `countries.id`)
  - `job_title`
  - `base_salary` (Numeric / Float - in local currency)
  - `bonus` (Numeric / Float - in local currency)
  - `created_at`, `updated_at`

### 2.2 Indexing Strategy for 10,000 Records
To achieve `< 50ms` response times for complex HR filtering across 10k rows:
1. **Compound Index `idx_emp_filter`**: `(country_id, department_id, base_salary)` for instant multi-faceted search filtering.
2. **Text Search Index `idx_emp_search`**: `(first_name, last_name, email)` for fast fuzzy searches.
3. **Foreign Key Indexes**: `department_id` and `country_id` to prevent table scans on join queries.

---

## 3. Data Seeding Strategy (10,000 Employees)

The `seed.py` script uses Faker to generate realistic global employee records across:
- **8 Countries**: United States (USD), United Kingdom (GBP), Germany (EUR), India (INR), Japan (JPY), Canada (CAD), Australia (AUD), Singapore (SGD).
- **6 Departments**: Engineering, Product, Sales, Marketing, HR, Finance.
- **Pay Bands**: Tailored by role seniority (Junior, Mid, Senior, Lead, Director) and localized to country economic baselines.

---

## 4. API Endpoints Blueprint

| Method | Path | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employees` | Paginated list of employees with search & filters | `page`, `page_size`, `search`, `department_id`, `country_id`, `min_salary`, `max_salary`, `sort_by`, `sort_order` |
| `GET` | `/api/v1/employees/{id}` | Detailed record of a single employee | None |
| `POST` | `/api/v1/employees` | Create a new employee record | Request body (JSON) |
| `PUT` | `/api/v1/employees/{id}` | Update employee salary/role | Request body (JSON) |
| `DELETE` | `/api/v1/employees/{id}` | Remove employee record | None |
| `GET` | `/api/v1/analytics/summary` | Executive HR KPIs (Total cost, avg, median) | `currency` (USD/local) |
| `GET` | `/api/v1/analytics/by-department` | Department salary aggregations & headcount | None |
| `GET` | `/api/v1/analytics/by-country` | Country cost breakdown & FX conversion | None |
| `GET` | `/api/v1/analytics/pay-gap` | Gender pay gap metrics & ratio analysis | None |
| `GET` | `/api/v1/meta/countries` | Country list with exchange rates | None |
| `GET` | `/api/v1/meta/departments` | Department list | None |
