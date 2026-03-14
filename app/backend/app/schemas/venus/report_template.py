from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class ReportTemplateBase(BaseModel):
    project_id: Optional[int] = None
    title: str
    template_type: Optional[str] = "weekly"
    sections: Optional[List[Any]] = []
    is_default: Optional[bool] = False

class ReportTemplateCreate(ReportTemplateBase):
    pass

class ReportTemplateUpdate(BaseModel):
    project_id: Optional[int] = None
    title: Optional[str] = None
    template_type: Optional[str] = None
    sections: Optional[List[Any]] = None
    is_default: Optional[bool] = None

class ReportTemplateResponse(ReportTemplateBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
