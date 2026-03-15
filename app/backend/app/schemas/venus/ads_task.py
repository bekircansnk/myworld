from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime

class AdsTaskBase(BaseModel):
    project_id: Optional[int] = None
    campaign_id: Optional[int] = None
    experiment_id: Optional[int] = None
    creative_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    category: Optional[str] = "daily_check"
    priority: Optional[str] = "normal"
    status: Optional[str] = "todo"
    due_date: Optional[date] = None
    source: Optional[str] = "manual"
    ai_notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class AdsTaskCreate(AdsTaskBase):
    pass

class AdsTaskUpdate(BaseModel):
    project_id: Optional[int] = None
    campaign_id: Optional[int] = None
    experiment_id: Optional[int] = None
    creative_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    source: Optional[str] = None
    ai_notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class AdsTaskResponse(AdsTaskBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
