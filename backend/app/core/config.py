import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ACME Employee Salary Management API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Default to local SQLite database in backend directory
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./salary.db")

    
    # Base currency for financial normalization
    BASE_CURRENCY: str = "USD"
    
    class Config:
        case_sensitive = True

settings = Settings()
