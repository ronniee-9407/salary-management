from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Country, Department
from app.schemas.schemas import CountryOut, DepartmentOut
from typing import List

router = APIRouter()

@router.get("/countries", response_model=List[CountryOut])
def get_countries(db: Session = Depends(get_db)):
    return db.query(Country).all()

@router.get("/departments", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()
