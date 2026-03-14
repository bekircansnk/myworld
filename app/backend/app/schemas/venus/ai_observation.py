from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class AIObservationBase(BaseModel):
    project_id: Optional[int] = None
    campaign_id: Optional[int] = None
    observation_type: Optional[str] = "summary"
    title: str
    content: str
    severity: Optional[str] = "info"
    is_acknowledged: Optional[bool] = False
    related_date_range: Optional[str] = "last_7_days"

class AIObservationCreate(AIObservationBase):
    pass

class AIObservationUpdate(BaseModel):
    project_id: Optional[int] = None
    campaign_id: Optional[int] = None
    observation_type: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    severity: Optional[str] = None
    is_acknowledged: Optional[bool] = None
    related_date_range: Optional[str] = None


class AIObservationResponse(AIObservationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
