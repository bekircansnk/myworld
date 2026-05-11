from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class UserCreate(BaseModel):
    """Admin tarafından yeni kullanıcı oluşturma"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    role: str = Field(default="viewer", pattern="^(admin|editor|viewer)$")
    permissions: dict = {}


class UserUpdate(BaseModel):
    """Kullanıcı bilgi güncelleme"""
    name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class PermissionUpdate(BaseModel):
    """İzin güncelleme"""
    permissions: dict


class AdminUserResponse(BaseModel):
    """Admin paneli kullanıcı yanıtı"""
    id: int
    username: str
    name: str
    email: Optional[str] = None
    role: str
    permissions: dict = {}
    is_active: bool = True
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    company_accesses: Optional[List[Any]] = Field(default_factory=list)

    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    """Admin dashboard istatistikleri"""
    total_users: int
    active_users: int
    inactive_users: int
    total_tasks: int
    total_notes: int
    total_events: int
    role_distribution: dict
    
class ActivityLogResponse(BaseModel):
    """Aktivite logu yanıtı"""
    id: int
    user_id: Optional[int]
    username: Optional[str]
    action: str
    module: str
    details: dict
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
