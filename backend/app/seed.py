import os
import sys
import random
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from faker import Faker
from app.db.database import Base, engine, SessionLocal
from app.models.models import Country, Department, Employee

fake = Faker()
Faker.seed(42)
random.seed(42)

COUNTRIES_DATA = [
    {"name": "United States", "code": "US", "currency_code": "USD", "currency_symbol": "$", "exchange_rate_to_usd": 1.0},
    {"name": "United Kingdom", "code": "GB", "currency_code": "GBP", "currency_symbol": "£", "exchange_rate_to_usd": 1.28},
    {"name": "Germany", "code": "DE", "currency_code": "EUR", "currency_symbol": "€", "exchange_rate_to_usd": 1.08},
    {"name": "India", "code": "IN", "currency_code": "INR", "currency_symbol": "₹", "exchange_rate_to_usd": 0.012},
    {"name": "Japan", "code": "JP", "currency_code": "JPY", "currency_symbol": "¥", "exchange_rate_to_usd": 0.0067},
    {"name": "Canada", "code": "CA", "currency_code": "CAD", "currency_symbol": "CA$", "exchange_rate_to_usd": 0.74},
    {"name": "Australia", "code": "AU", "currency_code": "AUD", "currency_symbol": "A$", "exchange_rate_to_usd": 0.66},
    {"name": "Singapore", "code": "SG", "currency_code": "SGD", "currency_symbol": "S$", "exchange_rate_to_usd": 0.75}
]

DEPARTMENTS_DATA = [
    {"name": "Engineering", "code": "ENG"},
    {"name": "Product", "code": "PRD"},
    {"name": "Sales", "code": "SLS"},
    {"name": "Marketing", "code": "MKT"},
    {"name": "Human Resources", "code": "HRM"},
    {"name": "Finance", "code": "FIN"}
]

JOB_TITLES = {
    "ENG": ["Software Engineer", "Senior Backend Engineer", "Frontend Architect", "DevOps Engineer", "Engineering Manager", "QA Engineer"],
    "PRD": ["Product Manager", "Senior UX Designer", "Product Designer", "VP of Product", "Technical Writer"],
    "SLS": ["Account Executive", "Sales Manager", "Business Development Rep", "VP of Sales", "Customer Success Lead"],
    "MKT": ["Growth Marketer", "SEO Specialist", "Content Strategist", "Marketing Director", "Brand Lead"],
    "HRM": ["HR Generalist", "Recruiter", "People Operations Lead", "Compensation Analyst", "VP of People"],
    "FIN": ["Financial Analyst", "Staff Accountant", "Payroll Manager", "CFO", "Tax Specialist"]
}

# Base USD salary ranges by department seniority
USD_SALARY_RANGES = {
    "ENG": (70000, 190000),
    "PRD": (65000, 175000),
    "SLS": (50000, 160000),
    "MKT": (48000, 140000),
    "HRM": (45000, 135000),
    "FIN": (55000, 165000)
}

GENDERS = ["Male", "Female", "Non-Binary"]

def seed_database(num_employees: int = 10000):
    print("[INFO] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Countries
        country_objs = {}
        for c in COUNTRIES_DATA:
            existing = db.query(Country).filter(Country.code == c["code"]).first()
            if not existing:
                existing = Country(**c)
                db.add(existing)
                db.flush()
            country_objs[c["code"]] = existing
        
        # 2. Seed Departments
        dept_objs = {}
        for d in DEPARTMENTS_DATA:
            existing = db.query(Department).filter(Department.code == d["code"]).first()
            if not existing:
                existing = Department(**d)
                db.add(existing)
                db.flush()
            dept_objs[d["code"]] = existing

        db.commit()

        # Check existing employees count
        existing_emp_count = db.query(Employee).count()
        if existing_emp_count >= num_employees:
            print(f"[INFO] Database already has {existing_emp_count} employees. Skipping seed.")
            return

        needed = num_employees - existing_emp_count
        print(f"[SEEDING] Generating {needed} employee records with realistic global data...")
        start_time = time.time()

        countries_list = list(country_objs.values())
        departments_list = list(dept_objs.values())

        batch_size = 2000
        employees_batch = []

        for i in range(1, needed + 1):
            country = random.choice(countries_list)
            dept = random.choice(departments_list)
            gender = random.choices(GENDERS, weights=[0.48, 0.48, 0.04])[0]
            
            if gender == "Male":
                first_name = fake.first_name_male()
            elif gender == "Female":
                first_name = fake.first_name_female()
            else:
                first_name = fake.first_name()
                
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}{i}@acmecorp.com"
            
            job_title = random.choice(JOB_TITLES.get(dept.code, ["Specialist"]))
            
            # Base salary in USD then convert to country local currency
            min_usd, max_usd = USD_SALARY_RANGES.get(dept.code, (50000, 150000))
            base_usd = random.uniform(min_usd, max_usd)
            
            # Convert to local currency
            fx_rate = country.exchange_rate_to_usd if country.exchange_rate_to_usd > 0 else 1.0
            base_local = round(base_usd / fx_rate, 2)
            bonus_local = round(base_local * random.uniform(0.05, 0.25), 2) if random.random() > 0.3 else 0.0

            emp = Employee(
                first_name=first_name,
                last_name=last_name,
                email=email,
                gender=gender,
                job_title=job_title,
                department_id=dept.id,
                country_id=country.id,
                base_salary=base_local,
                bonus=bonus_local
            )
            employees_batch.append(emp)

            if len(employees_batch) >= batch_size:
                db.bulk_save_objects(employees_batch)
                db.commit()
                employees_batch = []
                print(f"   --> Seeded {i}/{needed} employees...")

        if employees_batch:
            db.bulk_save_objects(employees_batch)
            db.commit()

        elapsed = time.time() - start_time
        total_count = db.query(Employee).count()
        print(f"[SUCCESS] Successfully seeded database! Total Employees: {total_count} in {elapsed:.2f} seconds.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database(10000)
