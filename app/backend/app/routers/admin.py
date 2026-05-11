from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
import json

from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.note import Note
from app.models.calendar_event import CalendarEvent
from app.models.activity_log import ActivityLog
from app.models.role_templates import ROLE_TEMPLATES
from app.schemas.admin import UserCreate, UserUpdate, PermissionUpdate, AdminUserResponse, AdminStatsResponse, ActivityLogResponse
from app.dependencies.admin import require_admin, require_super_admin
from app.dependencies.auth import get_password_hash
from app.utils.activity import log_activity

router = APIRouter()

@router.get("/users", response_model=List[AdminUserResponse])
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()

@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user

@router.post("/users", response_model=AdminUserResponse)
async def create_user(
    data: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    # Kullanıcı adı kontrolü
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")
        
    hashed_password = get_password_hash(data.password)
    
    new_user = User(
        username=data.username,
        password_hash=hashed_password,
        name=data.name,
        email=data.email,
        role=data.role,
        permissions=data.permissions,
        created_by=current_admin.id
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Log the action
    await log_activity(db, current_admin.id, "create_user", "admin", {"created_user_id": new_user.id, "username": new_user.username}, request)
    
    return new_user

@router.put("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    # Super admin'i sadece kendisi değiştirebilir
    if user.role == "super_admin" and current_admin.id != user.id:
        raise HTTPException(status_code=403, detail="Süper admin hesabını değiştiremezsiniz")
        
    if data.username and data.username != user.username:
        check_result = await db.execute(select(User).where(User.username == data.username))
        if check_result.scalars().first():
            raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")
        user.username = data.username
        
    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        user.email = data.email
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.password:
        user.password_hash = get_password_hash(data.password)
        
    await db.commit()
    await db.refresh(user)
    
    await log_activity(db, current_admin.id, "update_user", "admin", {"updated_user_id": user.id}, request)
    
    return user

@router.put("/users/{user_id}/permissions")
async def update_permissions(
    user_id: int,
    data: PermissionUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    if user.role == "super_admin" and current_admin.id != user.id:
        raise HTTPException(status_code=403, detail="Süper admin izinlerini değiştiremezsiniz")
        
    user.permissions = data.permissions
    await db.commit()
    
    await log_activity(db, current_admin.id, "update_permissions", "admin", {"updated_user_id": user.id}, request)
    
    return {"message": "İzinler güncellendi", "permissions": user.permissions}

@router.get("/role-templates")
async def get_role_templates(current_admin: User = Depends(require_admin)):
    return ROLE_TEMPLATES

@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db), current_admin: User = Depends(require_admin)):
    # Total Users
    users_result = await db.execute(select(User))
    users = users_result.scalars().all()
    
    active = sum(1 for u in users if u.is_active)
    inactive = len(users) - active
    
    # Role distribution
    roles = {}
    for u in users:
        roles[u.role] = roles.get(u.role, 0) + 1
        
    # Diğer istatistikler (Count kullanımı)
    tasks_count = await db.execute(select(func.count(Task.id)))
    notes_count = await db.execute(select(func.count(Note.id)))
    events_count = await db.execute(select(func.count(CalendarEvent.id)))
    
    return {
        "total_users": len(users),
        "active_users": active,
        "inactive_users": inactive,
        "total_tasks": tasks_count.scalar() or 0,
        "total_notes": notes_count.scalar() or 0,
        "total_events": events_count.scalar() or 0,
        "role_distribution": roles
    }

@router.get("/activity-logs", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    # Join user table to get usernames
    result = await db.execute(
        select(ActivityLog, User.username)
        .outerjoin(User, ActivityLog.user_id == User.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )
    
    logs = []
    for log, username in result.all():
        log_dict = {
            "id": log.id,
            "user_id": log.user_id,
            "username": username,
            "action": log.action,
            "module": log.module,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        }
        logs.append(log_dict)
        
    return logs
