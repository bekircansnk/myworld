from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class CSVImportBase(BaseModel):
    project_id: Optional[int] = None
    filename: str
    platform_source: Optional[str] = "other"
    rows_imported: Optional[int] = 0
    status: Optional[str] = "partial"
    error_log: Optional[str] = None

class CSVImportCreate(CSVImportBase):
    pass

class CSVImportUpdate(BaseModel):
    project_id: Optional[int] = None
    filename: Optional[str] = None
    platform_source: Optional[str] = None
    rows_imported: Optional[int] = None
    status: Optional[str] = None
    error_log: Optional[str] = None

class CSVImportResponse(CSVImportBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
