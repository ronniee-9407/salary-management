import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base

class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(10), nullable=False, unique=True)
    currency_code = Column(String(10), nullable=False)
    currency_symbol = Column(String(5), nullable=False)
    exchange_rate_to_usd = Column(Float, nullable=False, default=1.0)

    employees = relationship("Employee", back_populates="country")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)

    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), nullable=True, unique=True, index=True)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    email = Column(String(150), nullable=False, unique=True, index=True)
    gender = Column(String(20), nullable=False)  # Male, Female, Non-Binary
    
    job_title = Column(String(150), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False, index=True)
    
    base_salary = Column(Float, nullable=False)  # Stored in country's local currency
    bonus = Column(Float, nullable=False, default=0.0)  # Stored in country's local currency
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    country = relationship("Country", back_populates="employees")
    department = relationship("Department", back_populates="employees")

# Database indexes for sub-50ms queries on 10,000 records
Index("idx_emp_filter", Employee.country_id, Employee.department_id, Employee.base_salary)
Index("idx_emp_name_search", Employee.first_name, Employee.last_name)
