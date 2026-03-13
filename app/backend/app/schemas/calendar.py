from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "general" # 'meeting', 'task', 'personal', 'general'
    start_time: datetime
    end_time: datetime
    task_id: Optional[int] = None
    project_id: Optional[int] = None

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    task_id: Optional[int] = None
    project_id: Optional[int] = None

class CalendarEventResponse(CalendarEventBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
