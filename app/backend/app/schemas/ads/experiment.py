from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime

class ExperimentBase(BaseModel):
    project_id: Optional[int] = None
    campaign_id: Optional[int] = None
    creative_id: Optional[int] = None
    experiment_name: str
    hypothesis: Optional[str] = None
    status: Optional[str] = "running"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    metrics_tracked: Optional[List[Any]] = []
    winner: Optional[str] = None
    learnings: Optional[str] = None
    ai_comment: Optional[str] = None

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentUpdate(BaseModel):
    project_id: Optional[int] = None
    campaign_id: Optional[int] = None
    creative_id: Optional[int] = None
    experiment_name: Optional[str] = None
    hypothesis: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    metrics_tracked: Optional[List[Any]] = None
    winner: Optional[str] = None
    learnings: Optional[str] = None
    ai_comment: Optional[str] = None

class ExperimentResponse(ExperimentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
