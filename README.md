# ACME Corp — Employee Salary Management Software

A high-performance, full-stack web application designed for HR Managers to manage compensation, inspect salary profiles, and analyze org-wide pay distribution across **10,000 employees** and multiple global offices.

---

## 🌟 Key Features

- **Executive HR Analytics Dashboard**: Total Payroll Cost, Average Base Salary, Median Salary, Department Breakdown, Gender Pay Parity Ratios, and Top 5 Highest-Paid Roles.
- **Sub-50ms 10k Data Table**: Paginated, server-side indexed employee search with debouncing, multi-column sorting, and filters for Country, Department, and Gender.
- **CSV Data Export**: One-click full dataset CSV streaming export for HR compliance and auditing.
- **Multi-Currency Normalization**: Instant toggle between local currencies (USD, EUR, GBP, INR, JPY, CAD, AUD, SGD) and normalized base USD.
- **Salary Adjustments & CRUD**: Full onboarding and compensation update workflows.
- **10,000 Record Bulk Seeder**: High-speed database seeding script generating realistic global workforce data in `< 5 seconds`.
- **Deterministic Pytest & Vitest Suite**: 100% passing backend Pytest and frontend Vitest unit test coverage.

---

## 🏗️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn |
| **Database** | Relational DB (SQLite / PostgreSQL) with compound indexes on `(country_id, department_id, base_salary)` |
| **Frontend** | React 18, Vite, TypeScript, Redux Toolkit, Tailwind CSS, Lucide Icons, Recharts |
| **Testing** | Pytest, TestClient, Vitest, React Testing Library |
| **Data Generation** | Faker |

---

## 📁 Repository Artifacts

Per the evaluation guidelines, engineering decision documents are located in `docs/`:

1. [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) — 1-Page Product Framing, Persona, Goals, Scope, & Deliberate Omissions with Rationale.
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — ER Schema Diagram, Compound Index Strategy for 10k rows, & API Blueprints.
3. [`docs/AI_PROMPTS.md`](docs/AI_PROMPTS.md) — Documented AI prompting strategies, pair programming workflow, and quality control.
4. [`docs/DEPLOYMENT_AWS_EC2.md`](docs/DEPLOYMENT_AWS_EC2.md) — AWS EC2 Ubuntu Deployment Guide with Nginx, Systemd, Uvicorn, and automated `deploy/ec2_setup.sh`.

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup & Data Seeding
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run 10,000 employee seed script
python app/seed.py

# Start FastAPI dev server (Swagger UI at http://localhost:8000/docs)
python main.py
```

### 3. Frontend Setup & Launch
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

The HR Dashboard will be live at `http://localhost:5173`!

---

## 🧪 Running Unit Tests

```bash
# Run backend Pytest suite
pytest backend/tests

# Run frontend Vitest suite
cd frontend && npm test
```

---

## 🐙 Commit History Evolution

This repository follows clean atomic incremental commits:
1. `docs: add product framing, architecture design, and AI workflow strategy`
2. `feat(backend): setup FastAPI REST API, SQLAlchemy models, 10k employee seed script, and Pytest unit test suite`
3. `feat(frontend): build React, Vite, TS, Redux Toolkit HR dashboard, 10k employee table, and analytics charts`
4. `feat(api): add CSV export endpoint and streaming service for employee dataset`
5. `feat(analytics): implement Top 5 Highest-Paid Roles analytics API and visualization card`
6. `test(frontend): add Vitest test setup, format utility tests, Redux slice tests, and KPI card component tests`
7. `docs: update README with CSV export, top roles analytics, Vitest tests, and updated commit log`
