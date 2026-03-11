from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class DailyReportBase(BaseModel):
    report_date: date
    tasks_completed: int
    tasks_added: int
    total_work_minutes: int
    ai_summary: Optional[str] = None
    mood_score: Optional[int] = None

class DailyReportCreate(DailyReportBase):
    pass

class DailyReportResponse(DailyReportBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class WeeklyReportBase(BaseModel):
    week_start: date
    week_end: date
    tasks_completed: int
    total_work_hours: float
    productivity_score: Optional[int] = None
    ai_analysis: Optional[str] = None

class WeeklyReportCreate(WeeklyReportBase):
    pass

class WeeklyReportResponse(WeeklyReportBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
