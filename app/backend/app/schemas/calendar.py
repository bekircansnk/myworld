from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    allDay: Optional[bool] = False
    color: str = "blue"
    category: str = "task"
    taskId: Optional[int] = None
    noteId: Optional[int] = None
    isCompleted: Optional[bool] = False

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    allDay: Optional[bool] = None
    color: Optional[str] = None
    category: Optional[str] = None
    taskId: Optional[int] = None
    noteId: Optional[int] = None
    isCompleted: Optional[bool] = None

class CalendarEventResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    date: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    allDay: Optional[bool] = False
    color: str = "blue"
    category: str = "task"
    taskId: Optional[int] = None
    noteId: Optional[int] = None
    isCompleted: Optional[bool] = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
