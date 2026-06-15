from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LiveTranslateMessageCreate(BaseModel):
    speaker: str
    original_text: Optional[str] = None
    translated_text: Optional[str] = None
    is_final: bool = True

class LiveTranslateMessageOut(LiveTranslateMessageCreate):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LiveTranslateSessionCreate(BaseModel):
    title: Optional[str] = None
    source_language: Optional[str] = None
    target_language: Optional[str] = None

class LiveTranslateSessionOut(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    source_language: Optional[str] = None
    target_language: Optional[str] = None
    message_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LiveTranslateSessionDetailOut(LiveTranslateSessionOut):
    messages: List[LiveTranslateMessageOut] = []
