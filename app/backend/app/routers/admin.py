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


# ===================== ROL ŞABLONLARI =====================

import json
import os

ROLE_TEMPLATES_FILE = os.path.join(os.path.dirname(__file__), "custom_role_templates.json")

def load_custom_templates():
    if os.path.exists(ROLE_TEMPLATES_FILE):
        try:
            with open(ROLE_TEMPLATES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_custom_templates(templates):
    with open(ROLE_TEMPLATES_FILE, "w", encoding="utf-8") as f:
        json.dump(templates, f, ensure_ascii=False, indent=2)

# Runtime rol şablonu deposu (dosyadan beslenir)
_custom_role_templates = load_custom_templates()

def _get_all_templates():
    """Varsayılan + özel şablonları birleştir"""
    merged = dict(ROLE_TEMPLATES)
    merged.update(_custom_role_templates)
    # Silinmiş olarak işaretlenenleri (None) filtrele
    return {k: v for k, v in merged.items() if v is not None}

@router.get("/role-templates")
async def get_role_templates(
    current_admin: User = Depends(require_admin)
):
    """Tüm rol şablonlarını getir"""
    return _get_all_templates()

@router.post("/role-templates")
async def create_role_template(
    request: Request,
    current_admin: User = Depends(require_admin)
):
    """Yeni rol şablonu oluştur"""
    body = await request.json()
    key = body.get("key", "")
    if not key:
        raise HTTPException(status_code=400, detail="Rol anahtarı gerekli")
    
    _custom_role_templates[key] = {
        "label": body.get("label", key),
        "description": body.get("description", ""),
        "role": "editor",
        "permissions": body.get("permissions", {})
    }
    save_custom_templates(_custom_role_templates)
    
    await log_activity(db=None, user_id=current_admin.id, action="create_role_template", 
                       module="admin", details={"key": key}, request=request)
    return {"message": "Rol şablonu oluşturuldu", "key": key}

@router.put("/role-templates/{key}")
async def update_role_template(
    key: str,
    request: Request,
    current_admin: User = Depends(require_admin)
):
    """Rol şablonunu güncelle"""
    body = await request.json()
    
    # Hem varsayılan hem özel şablonlarda arayıp özel'e kopyala
    all_templates = _get_all_templates()
    if key not in all_templates:
        raise HTTPException(status_code=404, detail="Rol şablonu bulunamadı")
    
    _custom_role_templates[key] = {
        "label": body.get("label", all_templates[key].get("label", key)),
        "description": body.get("description", ""),
        "role": all_templates[key].get("role", "editor"),
        "permissions": body.get("permissions", all_templates[key].get("permissions", {}))
    }
    save_custom_templates(_custom_role_templates)
    return {"message": "Rol şablonu güncellendi"}

@router.delete("/role-templates/{key}")
async def delete_role_template(
    key: str,
    current_admin: User = Depends(require_admin)
):
    """Rol şablonunu sil"""
    if key in _custom_role_templates:
        del _custom_role_templates[key]
        save_custom_templates(_custom_role_templates)
    elif key in ROLE_TEMPLATES:
        # Varsayılan şablonu silemeyiz ama override edebiliriz
        _custom_role_templates[key] = None  # Silindi olarak işaretle
        save_custom_templates(_custom_role_templates)
    else:
        raise HTTPException(status_code=404, detail="Rol şablonu bulunamadı")
    return {"message": "Rol şablonu silindi"}

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
