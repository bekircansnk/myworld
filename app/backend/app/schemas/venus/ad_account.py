from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdAccountBase(BaseModel):
    project_id: Optional[int] = None
    platform: str
    account_name: str
    account_id_external: Optional[str] = None
    status: Optional[str] = "active"
    notes: Optional[str] = None

class AdAccountCreate(AdAccountBase):
    pass

class AdAccountUpdate(BaseModel):
    project_id: Optional[int] = None
    platform: Optional[str] = None
    account_name: Optional[str] = None
    account_id_external: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AdAccountResponse(AdAccountBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
