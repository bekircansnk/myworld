from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserMin(BaseModel):
    id: int
    username: str
    name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TaskCommentBase(BaseModel):
    content: str

class TaskCommentCreate(TaskCommentBase):
    pass

class TaskCommentResponse(TaskCommentBase):
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    user: UserMin

    model_config = ConfigDict(from_attributes=True)
