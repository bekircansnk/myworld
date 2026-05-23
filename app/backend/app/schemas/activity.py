from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime

class UserMin(BaseModel):
    id: int
    username: str
    name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    project_id: Optional[int]
    action: str
    module: str
    details: dict
    created_at: datetime
    user: Optional[UserMin]

    model_config = ConfigDict(from_attributes=True)
