from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import PaginatedEmployeeResponse, EmployeeOut, EmployeeCreate, EmployeeUpdate
from app.services import employee_service
from typing import Optional

router = APIRouter()

@router.get("", response_model=PaginatedEmployeeResponse)
def list_employees(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, or job title"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    country_id: Optional[int] = Query(None, description="Filter by country ID"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    min_salary_usd: Optional[float] = Query(None, description="Minimum salary in USD"),
    max_salary_usd: Optional[float] = Query(None, description="Maximum salary in USD"),
    sort_by: str = Query("id", description="Field to sort by (id, first_name, last_name, base_salary)"),
    sort_order: str = Query("asc", description="Sort order (asc, desc)"),
    db: Session = Depends(get_db)
):
    items, total, total_pages = employee_service.get_employees(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        department_id=department_id,
        country_id=country_id,
        gender=gender,
        min_salary_usd=min_salary_usd,
        max_salary_usd=max_salary_usd,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return PaginatedEmployeeResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )

@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = employee_service.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return emp

@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(emp_in: EmployeeCreate, db: Session = Depends(get_db)):
    return employee_service.create_employee(db, emp_in)

@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, emp_in: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = employee_service.update_employee(db, employee_id, emp_in)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return emp

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    success = employee_service.delete_employee(db, employee_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return None
