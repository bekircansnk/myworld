from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
from app.schemas.project import ProjectResponse

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "normal"
    status: Optional[str] = "todo"
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = None
    project_id: Optional[int] = None
    parent_task_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None
    project_id: Optional[int] = None
    parent_task_id: Optional[int] = None
    sort_order: Optional[int] = None
    task_photos: Optional[List[Dict[str, Any]]] = None

class TaskReorderItem(BaseModel):
    id: int
    sort_order: int

class TaskReorder(BaseModel):
    items: List[TaskReorderItem]

class TaskBulkUpdate(BaseModel):
    task_ids: List[int]
    status: Optional[str] = None
    priority: Optional[str] = None
    project_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    actual_minutes: int
    ai_category: Optional[str] = None
    ai_suggested_priority: Optional[str] = None
    ai_analysis: Optional[str] = None
    ai_analysis_history: Optional[List[Dict[str, Any]]] = None
    task_photos: Optional[List[Dict[str, Any]]] = None
    sort_order: int
    created_at: Optional[datetime] = None  # Optional — eski kayıtlarda None olabilir
    completed_at: Optional[datetime] = None
    is_deleted: Optional[bool] = None
    project: Optional[ProjectResponse] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator('task_photos', 'ai_analysis_history', mode='before')
    def parse_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v
