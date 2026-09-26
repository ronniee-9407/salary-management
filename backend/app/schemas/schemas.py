from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class CountryBase(BaseModel):
    name: str
    code: str
    currency_code: str
    currency_symbol: str
    exchange_rate_to_usd: float

class CountryOut(CountryBase):
    id: int
    class Config:
        from_attributes = True

class DepartmentBase(BaseModel):
    name: str
    code: str

class DepartmentOut(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    gender: str
    job_title: str
    department_id: int
    country_id: int
    base_salary: float = Field(gt=0, description="Base salary in local currency")
    bonus: float = Field(ge=0, default=0.0, description="Bonus in local currency")

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    gender: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None
    country_id: Optional[int] = None
    base_salary: Optional[float] = Field(default=None, gt=0)
    bonus: Optional[float] = Field(default=None, ge=0)

class EmployeeOut(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    country: CountryOut
    department: DepartmentOut
    salary_in_usd: float
    total_compensation_usd: float

    class Config:
        from_attributes = True

class PaginatedEmployeeResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[EmployeeOut]

class AnalyticsSummary(BaseModel):
    total_employees: int
    total_payroll_usd: float
    formatted_total_payroll_usd: str
    average_salary_usd: float
    formatted_average_salary_usd: str
    median_salary_usd: float
    formatted_median_salary_usd: str
    total_bonus_usd: float
    formatted_total_bonus_usd: str


class DepartmentAnalytics(BaseModel):
    department_id: int
    department_name: str
    employee_count: int
    total_payroll_usd: float
    average_salary_usd: float

class CountryAnalytics(BaseModel):
    country_id: int
    country_name: str
    currency_code: str
    currency_symbol: str
    employee_count: int
    total_payroll_local: float
    total_payroll_usd: float
    average_salary_usd: float

class GenderPayGap(BaseModel):
    gender: str
    count: int
    avg_salary_usd: float
    median_salary_usd: float
    pay_ratio_vs_male: float

class TopRole(BaseModel):
    job_title: str
    employee_count: int
    avg_salary_usd: float
    max_salary_usd: float
    total_payroll_usd: float
