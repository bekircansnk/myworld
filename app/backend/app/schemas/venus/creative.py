from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class CreativeBase(BaseModel):
    project_id: Optional[int] = None
    creative_name: str
    creative_type: str
    format: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    designer: Optional[str] = None
    notes: Optional[str] = None
    performance_score: Optional[float] = None
    status: Optional[str] = "active"
    tags: Optional[List[Any]] = []

class CreativeCreate(CreativeBase):
    pass

class CreativeUpdate(BaseModel):
    project_id: Optional[int] = None
    creative_name: Optional[str] = None
    creative_type: Optional[str] = None
    format: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    designer: Optional[str] = None
    notes: Optional[str] = None
    performance_score: Optional[float] = None
    status: Optional[str] = None
    tags: Optional[List[Any]] = None

class CreativeResponse(CreativeBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
