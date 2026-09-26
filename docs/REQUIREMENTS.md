# Product Requirements Document (PRD)
## ACME Corp — Employee Salary Management Software

**Author:** HR Engineering / Candidate  
**Target User:** HR Manager  
**Scale:** 10,000 Employees across multiple global locations  
**Status:** Approved for Implementation  

---

## 1. Executive Summary & Goal
Currently, ACME Corp's HR team manages compensation for 10,000 employees across multiple global offices using disconnected spreadsheet files. This process is error-prone, slow, and lacks reporting capabilities. 

The goal of this software is to provide a central, high-performance web application that enables the HR Manager to:
1. Search, filter, and inspect salary data across 10,000 employees instantly.
2. Perform salary updates, additions, and compensation adjustments.
3. Analyze org-wide pay distribution, multi-currency costs, and gender pay gap metrics.

---

## 2. Target User Persona
* **Name:** HR Manager (e.g., Sarah)
* **Primary Tasks:** Quarterly salary reviews, department budget tracking, country compensation analysis, individual pay updates.
* **Pain Points:** Excel lag with 10k rows, lack of multi-currency aggregation, difficult cross-department comparison, manual formula errors.

---

## 3. In-Scope Features (V1 Core)

### 3.1 HR Executive Dashboard & Analytics
- **Compensation KPIs:** Total global payroll cost (converted to base currency USD), average salary, median salary, highest/lowest pay bands.
- **Pay Insights & Visualizations:**
  - Salary distribution breakdown by department.
  - Country-wise payroll comparison.
  - Gender pay ratio metrics.
  - Top 5 highest-paid roles.

### 3.2 High-Performance 10k Employee Table
- **Server-Side Pagination & Indexing:** Smooth response times under 50ms for 10,000 records.
- **Multi-Param Filtering:** Filter by Country, Department, Role, Gender, and Salary Range.
- **Search:** Instant fuzzy search by employee name or email address.
- **Multi-Currency Toggle:** View compensation in local currencies (USD, EUR, GBP, INR, JPY) or normalized base currency (USD).

### 3.3 Salary Management (CRUD & Adjustments)
- **Employee Pay Editor:** Update base salary, annual performance bonus, role, and department.
- **Add Employee:** Onboard new employee records into the system with validation.
- **Batch Export / Querying:** Export filtered employee lists to CSV/JSON for audit reporting.

---

## 4. Deliberate Non-Goals & Omissions (Scope Management)

To maintain focus on core compensation analysis and high code quality within the evaluation timeframe, the following features are **deliberately excluded**:

| Feature Omitted | Reasoning & Trade-off |
| :--- | :--- |
| **Complex RBAC & Auth (OAuth / SSO)** | **Reasoning:** Assessment persona focuses on HR Manager workflows. Implementing OAuth would add operational overhead without improving the core data & analytics problem. Mock session state is used instead. |
| **Real-time Payroll Processing (Direct Deposit / Stripe)** | **Reasoning:** This system is for *salary management and reporting*, not banking execution. Financial payout pipelines are handled by external ERPs (e.g., Workday/SAP). |
| **Historical Audit Log of Every Micro-Edit** | **Reasoning:** Simple `updated_at` timestamps provide sufficient recency tracking for V1. Fully versioned temporal database tables (e.g., SQL triggers / Event Sourcing) add unnecessary DB schema complexity. |
| **Live External Currency Exchange API** | **Reasoning:** External API calls introduce non-deterministic network latency during testing. Hardcoded static conversion rate tables (updated daily via mock service) ensure fast, deterministic tests. |

---

## 5. Technical Requirements & Non-Functional Constraints
- **Response Time:** Database queries on 10,000 rows must execute in `< 50ms` using proper SQL indexes.
- **UI Performance:** Data table rendering must maintain 60 FPS without layout shifts or memory leaks.
- **Test Coverage:** Core backend service functions and analytical calculation APIs must be covered by fast, deterministic Pytest unit tests.
- **Code Quality:** Modular separation between API handlers, service logic, ORM models, and frontend state management (Redux Toolkit).

---

## 6. Success Criteria
- [x] Seed script loads 10,000 realistic employee records across 8 countries and 6 departments.
- [x] HR Manager can answer questions about org pay within 3 clicks.
- [x] 100% deterministic test suite passes in `< 5s`.
- [x] Incremental git commits reflect clear evolution of solution.
