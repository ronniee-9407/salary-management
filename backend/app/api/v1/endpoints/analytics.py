from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import AnalyticsSummary, DepartmentAnalytics, CountryAnalytics, GenderPayGap
from app.services import analytics_service
from typing import List

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    return analytics_service.get_analytics_summary(db)

@router.get("/by-department", response_model=List[DepartmentAnalytics])
def get_by_department(db: Session = Depends(get_db)):
    return analytics_service.get_department_analytics(db)

@router.get("/by-country", response_model=List[CountryAnalytics])
def get_by_country(db: Session = Depends(get_db)):
    return analytics_service.get_country_analytics(db)

@router.get("/pay-gap", response_model=List[GenderPayGap])
def get_pay_gap(db: Session = Depends(get_db)):
    return analytics_service.get_gender_pay_gap(db)
