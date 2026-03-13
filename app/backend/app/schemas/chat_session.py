from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None


class ChatSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: Optional[str] = None
    ai_categories: Optional[List[str]] = ["genel"]
    last_message_preview: Optional[str] = None
    last_user_message: Optional[str] = None
    message_count: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class ChatSessionListResponse(BaseModel):
    sessions: List[ChatSessionResponse]
    total: int
