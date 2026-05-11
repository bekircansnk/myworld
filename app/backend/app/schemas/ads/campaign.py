from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime

class CampaignBase(BaseModel):
    project_id: Optional[int] = None
    ad_account_id: Optional[int] = None
    platform: str
    campaign_name: str
    campaign_type: Optional[str] = None
    status: Optional[str] = "active"
    objective: Optional[str] = None
    budget_daily: Optional[float] = None
    budget_total: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_audience: Optional[str] = None
    notes: Optional[str] = None
    ai_analysis: Optional[str] = None
    tags: Optional[List[Any]] = []

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    project_id: Optional[int] = None
    ad_account_id: Optional[int] = None
    platform: Optional[str] = None
    campaign_name: Optional[str] = None
    campaign_type: Optional[str] = None
    status: Optional[str] = None
    objective: Optional[str] = None
    budget_daily: Optional[float] = None
    budget_total: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_audience: Optional[str] = None
    notes: Optional[str] = None
    ai_analysis: Optional[str] = None
    tags: Optional[List[Any]] = None

class CampaignResponse(CampaignBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
