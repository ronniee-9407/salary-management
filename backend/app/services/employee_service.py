from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, asc, desc, func
from app.models.models import Employee, Country, Department
from app.schemas.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, CountryOut, DepartmentOut
from typing import Tuple, List, Optional
import math

def enrich_employee_out(emp: Employee) -> EmployeeOut:
    rate = emp.country.exchange_rate_to_usd if emp.country and emp.country.exchange_rate_to_usd > 0 else 1.0
    salary_usd = round(emp.base_salary * rate, 2)
    total_usd = round((emp.base_salary + (emp.bonus or 0.0)) * rate, 2)
    
    return EmployeeOut(
        id=emp.id,
        first_name=emp.first_name,
        last_name=emp.last_name,
        email=emp.email,
        gender=emp.gender,
        job_title=emp.job_title,
        department_id=emp.department_id,
        country_id=emp.country_id,
        base_salary=emp.base_salary,
        bonus=emp.bonus,
        created_at=emp.created_at,
        updated_at=emp.updated_at,
        country=CountryOut.model_validate(emp.country),
        department=DepartmentOut.model_validate(emp.department),
        salary_in_usd=salary_usd,
        total_compensation_usd=total_usd
    )

def get_employees(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    country_id: Optional[int] = None,
    gender: Optional[str] = None,
    min_salary_usd: Optional[float] = None,
    max_salary_usd: Optional[float] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> Tuple[List[EmployeeOut], int, int]:
    
    query = db.query(Employee).options(
        joinedload(Employee.country),
        joinedload(Employee.department)
    )

    # Multi-faceted search filters
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Employee.first_name.ilike(search_fmt),
                Employee.last_name.ilike(search_fmt),
                func.concat(Employee.first_name, ' ', Employee.last_name).ilike(search_fmt),
                Employee.email.ilike(search_fmt),
                Employee.job_title.ilike(search_fmt)
            )
        )


    if department_id:
        query = query.filter(Employee.department_id == department_id)

    if country_id:
        query = query.filter(Employee.country_id == country_id)

    if gender:
        query = query.filter(Employee.gender.ilike(gender))

    # Base salary USD estimation filter
    if min_salary_usd is not None or max_salary_usd is not None:
        query = query.join(Country)
        if min_salary_usd is not None:
            query = query.filter((Employee.base_salary * Country.exchange_rate_to_usd) >= min_salary_usd)
        if max_salary_usd is not None:
            query = query.filter((Employee.base_salary * Country.exchange_rate_to_usd) <= max_salary_usd)

    total_count = query.count()
    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1

    # Dynamic sorting
    sort_col = getattr(Employee, sort_by, Employee.id)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    # Server-side pagination
    offset = (page - 1) * page_size
    raw_employees = query.offset(offset).limit(page_size).all()
    
    enriched_items = [enrich_employee_out(emp) for emp in raw_employees]
    return enriched_items, total_count, total_pages

def get_employee_by_id(db: Session, employee_id: int) -> Optional[EmployeeOut]:
    emp = db.query(Employee).options(
        joinedload(Employee.country),
        joinedload(Employee.department)
    ).filter(Employee.id == employee_id).first()
    
    if not emp:
        return None
    return enrich_employee_out(emp)

def create_employee(db: Session, emp_data: EmployeeCreate) -> EmployeeOut:
    db_emp = Employee(**emp_data.model_dump())
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return get_employee_by_id(db, db_emp.id)

def update_employee(db: Session, employee_id: int, emp_data: EmployeeUpdate) -> Optional[EmployeeOut]:
    db_emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_emp:
        return None
    
    update_dict = emp_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_emp, key, value)
        
    db.commit()
    return get_employee_by_id(db, employee_id)

def delete_employee(db: Session, employee_id: int) -> bool:
    db_emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_emp:
        return False
    db.delete(db_emp)
    db.commit()
    return True
