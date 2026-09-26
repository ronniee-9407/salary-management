# AI Usage & Prompt History Log

This document records the AI-assisted engineering workflow, design decisions, and prompting strategies used during the development of the ACME Salary Management application.

---

## 1. Intentional AI Strategy
Per assessment guidelines, AI tools were leveraged as a pair programming partner for:
- Initial product scope definition & trade-off framing.
- Schema normalization & database index optimization for 10,000 records.
- Boilerplate generation (Pydantic schemas, FastAPI routers, Redux Toolkit slices).
- Unit test suite generation for high coverage and deterministic fast execution.

---

## 2. Key Prompts & AI Interaction History

### Phase 1: Requirements & Product Framing
> **Prompt:**  
> *"Act as a Principal Product Manager & Lead Architect. We need to build an HR salary management system for 10,000 employees. Write a 1-page requirements document detailing goals, HR persona, core features, and explicit non-goals (what we deliberately omit and why)."*  
> **Result:** Generated structured `REQUIREMENTS.md` emphasizing high-performance search, multi-currency display, and explicit trade-off justification for RBAC and live banking integration.

### Phase 2: Schema Design & Indexing
> **Prompt:**  
> *"Design a relational schema using SQLAlchemy 2.0 for 10,000 employees with attributes for country, department, base salary, bonus, currency, and gender. Add compound indexing strategy to ensure SQL queries complete under 50ms during multi-parameter filtering."*  
> **Result:** Created normalized ER model with `idx_emp_filter` compound index and FK indexes on `country_id` and `department_id`.

### Phase 3: Seeder & Data Generation
> **Prompt:**  
> *"Write an async Python seed script using Faker to generate 10,000 realistic employee records across 8 countries and 6 departments. Ensure salaries conform to country-specific economics and roles."*  
> **Result:** Created high-speed bulk database insertion script (`seed.py`).

### Phase 4: Frontend State & Data Table
> **Prompt:**  
> *"Create a React + Redux Toolkit application with Vite and Tailwind CSS. Implement server-side paginated data table for 10,000 rows with debounced search, multi-currency selector, and interactive charts using Recharts."*  
> **Result:** Built modular frontend architecture with clear state slice separation.

---

## 3. Human Quality Control & Verification
Every piece of AI-generated code underwent human verification:
1. **Performance Check:** DB query plans (`EXPLAIN ANALYZE`) verified to guarantee `< 50ms` execution.
2. **Type Safety:** Strict TypeScript interfaces enforced between API endpoints and Redux state.
3. **Test Integrity:** No swallowed exceptions or dummy fallback logic allowed in unit tests.
