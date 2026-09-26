import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys, os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from app.db.database import Base, get_db
from app.models.models import Country, Department, Employee

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_analytics.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_analytics_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    us = Country(name="United States", code="US", currency_code="USD", currency_symbol="$", exchange_rate_to_usd=1.0)
    uk = Country(name="United Kingdom", code="GB", currency_code="GBP", currency_symbol="£", exchange_rate_to_usd=1.28)
    eng = Department(name="Engineering", code="ENG")
    hr = Department(name="HR", code="HRM")
    
    db.add_all([us, uk, eng, hr])
    db.commit()
    db.refresh(us)
    db.refresh(uk)
    db.refresh(eng)
    db.refresh(hr)

    emp1 = Employee(first_name="John", last_name="Doe", email="john@acme.com", gender="Male", job_title="Lead Engineer", department_id=eng.id, country_id=us.id, base_salary=120000.0, bonus=20000.0)
    emp2 = Employee(first_name="Jane", last_name="Smith", email="jane@acme.com", gender="Female", job_title="HR Lead", department_id=hr.id, country_id=uk.id, base_salary=50000.0, bonus=5000.0)
    
    db.add_all([emp1, emp2])
    db.commit()
    db.close()
    yield
    app.dependency_overrides.clear()


def test_analytics_summary():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_employees"] == 2
    assert data["total_payroll_usd"] > 0
    assert data["average_salary_usd"] > 0

def test_analytics_by_department():
    response = client.get("/api/v1/analytics/by-department")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    dept_names = [d["department_name"] for d in data]
    assert "Engineering" in dept_names
    assert "HR" in dept_names

def test_analytics_by_country():
    response = client.get("/api/v1/analytics/by-country")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_analytics_pay_gap():
    response = client.get("/api/v1/analytics/pay-gap")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
