from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class OnboardingChecklistBase(BaseModel):
    project_id: Optional[int] = None
    client_name: str
    status: Optional[str] = "in_progress"
    items: Optional[List[Any]] = []
    notes: Optional[str] = None

class OnboardingChecklistCreate(OnboardingChecklistBase):
    pass

class OnboardingChecklistUpdate(BaseModel):
    project_id: Optional[int] = None
    client_name: Optional[str] = None
    status: Optional[str] = None
    items: Optional[List[Any]] = None
    notes: Optional[str] = None

class OnboardingChecklistResponse(OnboardingChecklistBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
