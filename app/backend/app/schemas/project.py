from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    color: Optional[str] = "#000000"
    icon: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
