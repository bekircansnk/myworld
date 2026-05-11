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
from app.models.user_company_access import UserCompanyAccess
from app.models.project import Project
from app.models.role_templates import ROLE_TEMPLATES
from app.schemas.admin import UserCreate, UserUpdate, PermissionUpdate, AdminUserResponse, AdminStatsResponse, ActivityLogResponse
from app.dependencies.admin import require_admin, require_super_admin
from app.dependencies.auth import get_password_hash, get_current_user
from app.utils.activity import log_activity

router = APIRouter()

from sqlalchemy.orm import selectinload

@router.get("/users", response_model=List[AdminUserResponse])
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    query = select(User).options(
        selectinload(User.company_accesses).selectinload(UserCompanyAccess.project)
    ).order_by(User.id)
    result = await db.execute(query)
    users = result.scalars().all()
    
    response = []
    for user in users:
        accesses = []
        for acc in user.company_accesses:
            if acc.project:
                accesses.append({
                    "project_id": acc.project_id,
                    "project_name": acc.project.name,
                    "color": acc.project.color,
                    "permissions": acc.permissions or {},
                    "is_owner": acc.is_owner or False
                })
        
        user_dict = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "email_verified": user.email_verified,
            "role": user.role,
            "permissions": user.permissions or {},
            "is_active": user.is_active,
            "avatar_url": user.avatar_url,
            "last_login": user.last_login,
            "created_by": user.created_by,
            "created_at": user.created_at,
            "company_accesses": accesses
        }
        response.append(user_dict)
        
    return response

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
    if data.role is not None and current_admin.role == "super_admin":
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.password:
        user.password_hash = get_password_hash(data.password)
        
    await db.commit()
    await db.refresh(user)
    
    await log_activity(db, current_admin.id, "update_user", "admin", {"updated_user_id": user.id}, request)
    
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_super_admin)
):
    """Kullanıcıyı ve tüm ilişkili verilerini kalıcı olarak siler."""
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Kendi hesabınızı silemezsiniz")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    from sqlalchemy import delete
    from app.models.task import Task
    from app.models.note import Note
    from app.models.calendar_event import CalendarEvent
    from app.models.chat_session import ChatSession
    from app.models.chat_message import ChatMessage
    from app.models.user_company_access import UserCompanyAccess
    
    # İlişkili verileri temizle
    await db.execute(delete(UserCompanyAccess).where(UserCompanyAccess.user_id == user_id))
    await db.execute(delete(ActivityLog).where((ActivityLog.user_id == user_id) | (ActivityLog.target_user_id == user_id)))
    await db.execute(delete(Task).where(Task.user_id == user_id))
    await db.execute(delete(Note).where(Note.user_id == user_id))
    await db.execute(delete(CalendarEvent).where(CalendarEvent.user_id == user_id))
    
    # Chat verileri
    sessions_result = await db.execute(select(ChatSession.id).where(ChatSession.user_id == user_id))
    session_ids = [r[0] for r in sessions_result.all()]
    if session_ids:
        await db.execute(delete(ChatMessage).where(ChatMessage.session_id.in_(session_ids)))
        await db.execute(delete(ChatSession).where(ChatSession.id.in_(session_ids)))

    await db.delete(user)
    await db.commit()
    
    await log_activity(db, current_admin.id, "delete_user", "admin", {"deleted_user_id": user_id}, request)
    
    return {"message": "Kullanıcı ve tüm verileri başarıyla silindi"}

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
    
    tasks_count = await db.execute(select(func.count(Task.id)))
    notes_count = await db.execute(select(func.count(Note.id)))
    events_count = await db.execute(select(func.count(CalendarEvent.id)))
    
    return {
        "total_users": len(users),
        "active_users": active,
        "inactive_users": inactive,
        "total_tasks": tasks_count.scalar() or 0,
        "total_notes": notes_count.scalar() or 0,
        "total_events": events_count.scalar() or 0
    }

@router.get("/activity-logs")
async def get_activity_logs(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    stmt = (
        select(ActivityLog, User.username, Project.name)
        .outerjoin(User, ActivityLog.user_id == User.id)
        .outerjoin(Project, ActivityLog.project_id == Project.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(200)
    )
    result = await db.execute(stmt)
    logs = []
    for log_row, username, project_name in result.all():
        log_dict = {
            "id": log_row.id,
            "user_id": log_row.user_id,
            "username": username,
            "project_name": project_name,
            "action": log_row.action,
            "module": log_row.module,
            "details": log_row.details,
            "ip_address": log_row.ip_address,
            "created_at": log_row.created_at
        }
        logs.append(log_dict)
    return logs

# ============================================================
# FİRMA (PROJE) TABANLI KULLANICI ERİŞİM YÖNETİMİ
# ============================================================

@router.get("/companies", response_model=List[dict])
async def get_all_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Tüm firmaları listeler. super_admin hepsini görür, admin kendi firmasını görür."""
    if current_user.role == "super_admin":
        result = await db.execute(select(Project).order_by(Project.name))
    else:
        # Admin sadece kendi erişebildiği firmaları görür
        result = await db.execute(
            select(Project)
            .join(UserCompanyAccess, UserCompanyAccess.project_id == Project.id)
            .where(UserCompanyAccess.user_id == current_user.id)
            .order_by(Project.name)
        )
    projects = result.scalars().all()
    return [{"id": p.id, "name": p.name, "user_id": p.user_id} for p in projects]

@router.get("/companies/overview", response_model=List[dict])
async def get_companies_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Her firma için özet istatistik (görev, kullanıcı, son aktivite)"""
    if current_user.role == "super_admin":
        proj_result = await db.execute(select(Project).order_by(Project.name))
    else:
        proj_result = await db.execute(
            select(Project)
            .join(UserCompanyAccess, UserCompanyAccess.project_id == Project.id)
            .where(UserCompanyAccess.user_id == current_user.id)
        )
    projects = proj_result.scalars().all()
    
    overview = []
    for p in projects:
        task_count = await db.execute(select(func.count(Task.id)).where(Task.project_id == p.id))
        user_count = await db.execute(select(func.count(UserCompanyAccess.id)).where(UserCompanyAccess.project_id == p.id))
        overview.append({
            "id": p.id,
            "name": p.name,
            "task_count": task_count.scalar() or 0,
            "user_count": user_count.scalar() or 0,
        })
    return overview

@router.get("/users/{user_id}/companies", response_model=List[dict])
async def get_user_companies(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Bir kullanıcının erişebildiği firmaları ve firma bazlı izinlerini listele"""
    result = await db.execute(
        select(UserCompanyAccess, Project.name)
        .join(Project, UserCompanyAccess.project_id == Project.id)
        .where(UserCompanyAccess.user_id == user_id)
    )
    accesses = result.all()
    return [{
        "project_id": a.UserCompanyAccess.project_id, 
        "project_name": a.name,
        "permissions": a.UserCompanyAccess.permissions or {},
        "is_owner": a.UserCompanyAccess.is_owner or False
    } for a in accesses]

@router.post("/users/{user_id}/companies/{project_id}")
async def grant_company_access(
    user_id: int,
    project_id: int,
    request: Request,
    permissions: dict = None,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Kullanıcıya firma erişimi ver (opsiyonel izin matrisi ile)"""
    # Super admin değilse sadece kendi erişebildiği firmaları atayabilir
    if current_admin.role != "super_admin":
        check = await db.execute(
            select(UserCompanyAccess).where(
                UserCompanyAccess.user_id == current_admin.id,
                UserCompanyAccess.project_id == project_id
            )
        )
        if not check.scalars().first():
            raise HTTPException(status_code=403, detail="Bu firmayı atama yetkiniz yok")
    
    # Request body'den izinleri al
    body = {}
    try:
        body = await request.json()
    except:
        pass
    company_permissions = body.get("permissions", permissions or {})
    
    # Zaten var mı?
    existing = await db.execute(
        select(UserCompanyAccess).where(
            UserCompanyAccess.user_id == user_id,
            UserCompanyAccess.project_id == project_id
        )
    )
    existing_access = existing.scalars().first()
    if existing_access:
        # Mevcutsa izinleri güncelle
        existing_access.permissions = company_permissions
        await db.commit()
        return {"message": "Firma erişim izinleri güncellendi"}
    
    access = UserCompanyAccess(
        user_id=user_id,
        project_id=project_id,
        permissions=company_permissions,
        granted_by=current_admin.id
    )
    db.add(access)
    await db.commit()
    await log_activity(db, current_admin.id, "grant_company_access", "admin",
                       {"user_id": user_id, "project_id": project_id, "permissions": company_permissions}, request)
    return {"message": "Firma erişimi verildi"}

@router.put("/users/{user_id}/companies/{project_id}/permissions")
async def update_company_permissions(
    user_id: int,
    project_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Kullanıcının bir firmadaki modül izinlerini güncelle"""
    result = await db.execute(
        select(UserCompanyAccess).where(
            UserCompanyAccess.user_id == user_id,
            UserCompanyAccess.project_id == project_id
        )
    )
    access = result.scalars().first()
    if not access:
        raise HTTPException(status_code=404, detail="Kullanıcının bu firmaya erişimi yok")
    
    body = await request.json()
    access.permissions = body.get("permissions", {})
    await db.commit()
    
    await log_activity(db, current_admin.id, "update_company_permissions", "admin",
                       {"user_id": user_id, "project_id": project_id}, request)
    return {"message": "Firma izinleri güncellendi", "permissions": access.permissions}

@router.delete("/users/{user_id}/companies/{project_id}")
async def revoke_company_access(
    user_id: int,
    project_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Kullanıcıdan firma erişimini kaldır"""
    result = await db.execute(
        select(UserCompanyAccess).where(
            UserCompanyAccess.user_id == user_id,
            UserCompanyAccess.project_id == project_id
        )
    )
    access = result.scalars().first()
    if not access:
        raise HTTPException(status_code=404, detail="Erişim bulunamadı")
    
    await db.delete(access)
    await db.commit()
    await log_activity(db, current_admin.id, "revoke_company_access", "admin",
                       {"user_id": user_id, "project_id": project_id}, request)
    return {"message": "Firma erişimi kaldırıldı"}

from sqlalchemy import text

@router.post("/reset-data")
async def reset_data(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_super_admin)
):
    """Tüm gereksiz verileri (görev, not, takvim vb) temizler."""
    tables = [
        "tasks", "notes", "calendar_events", 
        "chat_messages", "chat_sessions", "activity_logs", 
        "notifications", "timer_sessions", "ai_memory"
    ]
    for table in tables:
        try:
            await db.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
            await db.commit()
        except Exception:
            await db.rollback()
            
    return {"status": "ok", "message": "Temizlik tamamlandı"}

@router.post("/cleanup-orphans")
async def cleanup_orphan_data(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_super_admin)
):
    """Silinmiş firmalara ait yetim görev, not, takvim ve chat verilerini temizler."""
    from app.models.task import Task
    from app.models.note import Note
    from app.models.calendar_event import CalendarEvent
    from app.models.chat_session import ChatSession
    from app.models.chat_message import ChatMessage
    from sqlalchemy import delete
    
    # Mevcut firma ID'lerini al
    existing_projects = await db.execute(select(Project.id))
    valid_ids = [r[0] for r in existing_projects.all()]
    
    deleted = {"tasks": 0, "notes": 0, "events": 0, "sessions": 0, "messages": 0}
    
    if valid_ids:
        # project_id var AMA geçerli firmaya ait olmayan verileri sil
        # Görevler
        orphan_tasks = await db.execute(
            select(Task).where(Task.project_id.isnot(None), Task.project_id.notin_(valid_ids))
        )
        task_list = orphan_tasks.scalars().all()
        deleted["tasks"] = len(task_list)
        if task_list:
            await db.execute(delete(Task).where(Task.project_id.isnot(None), Task.project_id.notin_(valid_ids)))
        
        # Notlar
        orphan_notes = await db.execute(
            select(Note).where(Note.project_id.isnot(None), Note.project_id.notin_(valid_ids))
        )
        note_list = orphan_notes.scalars().all()
        deleted["notes"] = len(note_list)
        if note_list:
            await db.execute(delete(Note).where(Note.project_id.isnot(None), Note.project_id.notin_(valid_ids)))
        
        # Takvim
        orphan_events = await db.execute(
            select(CalendarEvent).where(CalendarEvent.project_id.isnot(None), CalendarEvent.project_id.notin_(valid_ids))
        )
        event_list = orphan_events.scalars().all()
        deleted["events"] = len(event_list)
        if event_list:
            await db.execute(delete(CalendarEvent).where(CalendarEvent.project_id.isnot(None), CalendarEvent.project_id.notin_(valid_ids)))
        
        # Chat Sessions + Messages
        orphan_sessions = await db.execute(
            select(ChatSession).where(ChatSession.project_id.isnot(None), ChatSession.project_id.notin_(valid_ids))
        )
        session_list = orphan_sessions.scalars().all()
        orphan_session_ids = [s.id for s in session_list]
        deleted["sessions"] = len(session_list)
        if orphan_session_ids:
            msg_result = await db.execute(
                select(ChatMessage).where(ChatMessage.session_id.in_(orphan_session_ids))
            )
            deleted["messages"] = len(msg_result.scalars().all())
            await db.execute(delete(ChatMessage).where(ChatMessage.session_id.in_(orphan_session_ids)))
            await db.execute(delete(ChatSession).where(ChatSession.id.in_(orphan_session_ids)))
    
    await db.commit()
    return {"status": "ok", "deleted": deleted, "message": f"Yetim veriler temizlendi: {deleted}"}

@router.post("/clear-logs")
async def clear_logs(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_super_admin)
):
    """Sistemdeki tüm aktivite loglarını temizler."""
    await db.execute(text("TRUNCATE TABLE activity_logs CASCADE"))
    await db.commit()
    return {"status": "ok", "message": "Sistem logları başarıyla temizlendi"}

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_super_admin)
):
    """Firmayı ve tüm ilişkili verilerini (görevler, notlar, erişimler vb) kalıcı olarak siler."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
        
    from sqlalchemy import delete
    from app.models.task import Task
    from app.models.note import Note
    from app.models.calendar_event import CalendarEvent
    from app.models.chat_session import ChatSession
    from app.models.chat_message import ChatMessage
    from app.models.user_company_access import UserCompanyAccess
    
    # Firma ile ilişkili her şeyi sil
    await db.execute(delete(UserCompanyAccess).where(UserCompanyAccess.project_id == project_id))
    await db.execute(delete(ActivityLog).where(ActivityLog.project_id == project_id))
    await db.execute(delete(Task).where(Task.project_id == project_id))
    await db.execute(delete(Note).where(Note.project_id == project_id))
    await db.execute(delete(CalendarEvent).where(CalendarEvent.project_id == project_id))
    
    sessions_result = await db.execute(select(ChatSession.id).where(ChatSession.project_id == project_id))
    session_ids = [r[0] for r in sessions_result.all()]
    if session_ids:
        await db.execute(delete(ChatMessage).where(ChatMessage.session_id.in_(session_ids)))
        await db.execute(delete(ChatSession).where(ChatSession.id.in_(session_ids)))

    await db.delete(project)
    await db.commit()
    
    await log_activity(db, current_admin.id, "delete_project", "admin", {"deleted_project_id": project_id, "project_name": project.name}, request)
    
    return {"message": f"'{project.name}' firması ve tüm verileri başarıyla silindi"}

