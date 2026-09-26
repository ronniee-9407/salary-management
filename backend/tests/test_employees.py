import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys, os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from app.db.database import Base, get_db
from app.models.models import Country, Department, Employee

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    country = Country(name="United States", code="US", currency_code="USD", currency_symbol="$", exchange_rate_to_usd=1.0)
    dept = Department(name="Engineering", code="ENG")
    db.add(country)
    db.add(dept)
    db.commit()
    db.refresh(country)
    db.refresh(dept)

    emp = Employee(
        first_name="Alice",
        last_name="Smith",
        email="alice@acmecorp.com",
        gender="Female",
        job_title="Software Engineer",
        department_id=dept.id,
        country_id=country.id,
        base_salary=100000.0,
        bonus=15000.0
    )
    db.add(emp)
    db.commit()
    db.close()
    yield
    app.dependency_overrides.clear()


def test_list_employees():
    response = client.get("/api/v1/employees")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["first_name"] == "Alice"
    assert data["items"][0]["salary_in_usd"] == 100000.0

def test_create_employee():
    payload = {
        "first_name": "Bob",
        "last_name": "Jones",
        "email": "bob@acmecorp.com",
        "gender": "Male",
        "job_title": "DevOps Engineer",
        "department_id": 1,
        "country_id": 1,
        "base_salary": 90000.0,
        "bonus": 5000.0
    }
    response = client.post("/api/v1/employees", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "Bob"
    assert data["id"] is not None

def test_filter_employee_search():
    response = client.get("/api/v1/employees?search=Alice")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1

    response_empty = client.get("/api/v1/employees?search=NonExistent")
    assert response_empty.status_code == 200
    assert response_empty.json()["total"] == 0
