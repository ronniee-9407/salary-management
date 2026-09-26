from fastapi import APIRouter
from app.api.v1.endpoints import employees, analytics, meta

api_router = APIRouter()
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(meta.router, prefix="/meta", tags=["meta"])
