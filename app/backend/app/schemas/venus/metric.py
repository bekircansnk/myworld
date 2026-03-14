from pydantic import BaseModel
from typing import Optional
from datetime import date

class DailyMetricBase(BaseModel):
    campaign_id: int
    date: date
    platform: str
    spend: Optional[float] = 0
    impressions: Optional[int] = 0
    clicks: Optional[int] = 0
    ctr: Optional[float] = 0
    cpc: Optional[float] = 0
    conversions: Optional[int] = 0
    conversion_value: Optional[float] = 0
    purchases: Optional[int] = 0
    purchase_value: Optional[float] = 0
    roas: Optional[float] = 0
    cpa: Optional[float] = 0
    frequency: Optional[float] = 0
    source: Optional[str] = "manual"

class DailyMetricCreate(DailyMetricBase):
    pass

class DailyMetricUpdate(BaseModel):
    spend: Optional[float] = None
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    ctr: Optional[float] = None
    cpc: Optional[float] = None
    conversions: Optional[int] = None
    conversion_value: Optional[float] = None
    purchases: Optional[int] = None
    purchase_value: Optional[float] = None
    roas: Optional[float] = None
    cpa: Optional[float] = None
    frequency: Optional[float] = None
    source: Optional[str] = None

class DailyMetricResponse(DailyMetricBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
