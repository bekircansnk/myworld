from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
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
    sort_order: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    project: Optional[ProjectResponse] = None

    model_config = ConfigDict(from_attributes=True)
