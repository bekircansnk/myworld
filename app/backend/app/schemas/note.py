from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class NoteBase(BaseModel):
    content: str
    title: Optional[str] = None
    project_id: Optional[int] = None
    ai_category: Optional[str] = None
    ai_tags: Optional[List[str]] = []
    source: Optional[str] = "web"

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    project_id: Optional[int] = None
    ai_category: Optional[str] = None
    ai_tags: Optional[List[str]] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    ai_analysis: Optional[str] = None
    ai_analysis_history: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
