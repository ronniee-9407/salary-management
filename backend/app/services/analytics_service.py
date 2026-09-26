from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Employee, Country, Department
from app.schemas.schemas import AnalyticsSummary, DepartmentAnalytics, CountryAnalytics, GenderPayGap
from typing import List
import numpy as np

def format_compact_currency(val: float) -> str:
    abs_val = abs(val)
    if abs_val >= 1_000_000_000:
        return f"${(val / 1_000_000_000):.2f} Billion"
    if abs_val >= 1_000_000:
        return f"${(val / 1_000_000):.2f} Million"
    return f"${val:,.0f}"

def get_analytics_summary(db: Session) -> AnalyticsSummary:
    employees = db.query(Employee).join(Country).all()
    if not employees:
        return AnalyticsSummary(
            total_employees=0,
            total_payroll_usd=0.0,
            formatted_total_payroll_usd="$0",
            average_salary_usd=0.0,
            formatted_average_salary_usd="$0",
            median_salary_usd=0.0,
            formatted_median_salary_usd="$0",
            total_bonus_usd=0.0,
            formatted_total_bonus_usd="$0"
        )
    
    salaries_usd = [emp.base_salary * emp.country.exchange_rate_to_usd for emp in employees]
    bonuses_usd = [emp.bonus * emp.country.exchange_rate_to_usd for emp in employees]
    
    total_emp = len(employees)
    total_payroll = sum(salaries_usd)
    avg_salary = total_payroll / total_emp if total_emp > 0 else 0.0
    median_salary = float(np.median(salaries_usd)) if total_emp > 0 else 0.0
    total_bonus = sum(bonuses_usd)
    
    return AnalyticsSummary(
        total_employees=total_emp,
        total_payroll_usd=round(total_payroll, 2),
        formatted_total_payroll_usd=format_compact_currency(total_payroll),
        average_salary_usd=round(avg_salary, 2),
        formatted_average_salary_usd=format_compact_currency(avg_salary),
        median_salary_usd=round(median_salary, 2),
        formatted_median_salary_usd=format_compact_currency(median_salary),
        total_bonus_usd=round(total_bonus, 2),
        formatted_total_bonus_usd=format_compact_currency(total_bonus)
    )


def get_department_analytics(db: Session) -> List[DepartmentAnalytics]:
    departments = db.query(Department).all()
    results = []
    
    for dept in departments:
        emps = db.query(Employee).join(Country).filter(Employee.department_id == dept.id).all()
        count = len(emps)
        if count == 0:
            continue
        
        salaries_usd = [emp.base_salary * emp.country.exchange_rate_to_usd for emp in emps]
        total_payroll = sum(salaries_usd)
        avg_salary = total_payroll / count
        
        results.append(
            DepartmentAnalytics(
                department_id=dept.id,
                department_name=dept.name,
                employee_count=count,
                total_payroll_usd=round(total_payroll, 2),
                average_salary_usd=round(avg_salary, 2)
            )
        )
        
    return sorted(results, key=lambda x: x.total_payroll_usd, reverse=True)

def get_country_analytics(db: Session) -> List[CountryAnalytics]:
    countries = db.query(Country).all()
    results = []
    
    for country in countries:
        emps = db.query(Employee).filter(Employee.country_id == country.id).all()
        count = len(emps)
        if count == 0:
            continue
        
        total_local = sum(emp.base_salary for emp in emps)
        total_usd = total_local * country.exchange_rate_to_usd
        avg_usd = total_usd / count
        
        results.append(
            CountryAnalytics(
                country_id=country.id,
                country_name=country.name,
                currency_code=country.currency_code,
                currency_symbol=country.currency_symbol,
                employee_count=count,
                total_payroll_local=round(total_local, 2),
                total_payroll_usd=round(total_usd, 2),
                average_salary_usd=round(avg_usd, 2)
            )
        )
        
    return sorted(results, key=lambda x: x.total_payroll_usd, reverse=True)

def get_gender_pay_gap(db: Session) -> List[GenderPayGap]:
    employees = db.query(Employee).join(Country).all()
    by_gender = {}
    
    for emp in employees:
        g = emp.gender
        usd_sal = emp.base_salary * emp.country.exchange_rate_to_usd
        if g not in by_gender:
            by_gender[g] = []
        by_gender[g].append(usd_sal)
        
    male_avg = np.mean(by_gender.get("Male", [1.0])) if "Male" in by_gender else 1.0
    results = []
    
    for gender, sals in by_gender.items():
        cnt = len(sals)
        avg_sal = float(np.mean(sals))
        med_sal = float(np.median(sals))
        ratio = (avg_sal / male_avg) * 100 if male_avg > 0 else 100.0
        
        results.append(
            GenderPayGap(
                gender=gender,
                count=cnt,
                avg_salary_usd=round(avg_sal, 2),
                median_salary_usd=round(med_sal, 2),
                pay_ratio_vs_male=round(ratio, 2)
            )
        )
        
    return results
