from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class CompetitorBase(BaseModel):
    project_id: Optional[int] = None
    brand_name: str
    website_url: Optional[str] = None
    ad_library_url: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    creative_style: Optional[str] = None
    tags: Optional[List[Any]] = []

class CompetitorCreate(CompetitorBase):
    pass

class CompetitorUpdate(BaseModel):
    project_id: Optional[int] = None
    brand_name: Optional[str] = None
    website_url: Optional[str] = None
    ad_library_url: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    creative_style: Optional[str] = None
    tags: Optional[List[Any]] = None

class CompetitorResponse(CompetitorBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
