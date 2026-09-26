from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import AnalyticsSummary, DepartmentAnalytics, CountryAnalytics, GenderPayGap, TopRole
from app.services import analytics_service
from typing import List
import io

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

@router.get("/top-roles", response_model=List[TopRole])
def get_top_roles(limit: int = 5, db: Session = Depends(get_db)):
    """Top N job titles by average salary (USD), default top 5."""
    return analytics_service.get_top_roles(db, limit=limit)

@router.get("/export-csv")
def export_employees_csv(db: Session = Depends(get_db)):
    """Export all employee salary data as a downloadable CSV file."""
    csv_content = analytics_service.get_employees_csv(db)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=acme_salary_export.csv"}
    )
