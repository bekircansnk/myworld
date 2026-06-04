from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List
import logging

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.project import Project
from app.models.user_company_access import UserCompanyAccess
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.models.role_templates import FULL_PERMISSIONS
from app.dependencies.permissions import require_company_permission

router = APIRouter(prefix="/projects", tags=["projects"])

from app.dependencies.auth import get_current_user
from app.models.user import User

@router.get("", response_model=List[ProjectResponse])
async def read_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0, 
    limit: int = 100
):
    """Kullanıcının erişebildiği tüm firmaları döner (kendi + erişim verilmiş)"""
    if current_user.role == "super_admin":
        # Süper admin tüm firmaları görür
        query = select(Project).order_by(Project.sort_order.asc(), Project.id.desc()).offset(skip).limit(limit)
    else:
        accessible_project_ids = select(UserCompanyAccess.project_id).where(
            UserCompanyAccess.user_id == current_user.id
        )
        query = (
            select(Project)
            .where(Project.id.in_(accessible_project_ids))
            .order_by(Project.sort_order.asc(), Project.id.desc())
            .offset(skip).limit(limit)
        )
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = Project(**project.model_dump(), user_id=current_user.id)
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    
    # Otomatik olarak firma sahibi olarak erişim kaydı oluştur (tam yetki)
    access = UserCompanyAccess(
        user_id=current_user.id,
        project_id=db_project.id,
        is_owner=True,
        permissions=FULL_PERMISSIONS,
        granted_by=current_user.id
    )
    db.add(access)
    await db.commit()
    
    try:
        from app.routers.websocket import manager
        await manager.broadcast({"type": "project_update", "project_id": db_project.id})
    except Exception as e:
        logger.error(f"Failed to broadcast project creation: {e}")
        
    return db_project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int, 
    project_update: ProjectUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kendi firması veya super_admin
    if current_user.role == "super_admin":
        query = select(Project).where(Project.id == project_id)
    else:
        # Firma sahibi veya erişim verilmiş
        query = select(Project).where(Project.id == project_id)
    
    result = await db.execute(query)
    db_project = result.scalars().first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Erişim kontrolü: Sahibi veya super_admin değilse yetkisi var mı?
    if current_user.role != "super_admin" and db_project.user_id != current_user.id:
        access_result = await db.execute(
            select(UserCompanyAccess).where(
                UserCompanyAccess.user_id == current_user.id,
                UserCompanyAccess.project_id == project_id,
                UserCompanyAccess.is_owner == True
            )
        )
        if not access_result.scalars().first():
            raise HTTPException(status_code=403, detail="Bu firmayı düzenleme yetkiniz yok")
    
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    await db.commit()
    await db.refresh(db_project)
    
    try:
        from app.routers.websocket import manager
        await manager.broadcast({"type": "project_update", "project_id": db_project.id})
    except Exception as e:
        logger.error(f"Failed to broadcast project update: {e}")
        
    return db_project

@router.delete("/{project_id}")
async def delete_project(
    project_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "super_admin":
        query = select(Project).where(Project.id == project_id)
    else:
        # Sadece kendi oluşturduğu firmayı silebilir
        query = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    
    result = await db.execute(query)
    db_project = result.scalars().first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Firma erişim kayıtlarını temizle
    access_result = await db.execute(
        select(UserCompanyAccess).where(UserCompanyAccess.project_id == project_id)
    )
    for access in access_result.scalars().all():
        await db.delete(access)
        
    from app.models.task import Task
    from app.models.note import Note
    from app.models.calendar_event import CalendarEvent
    from app.models.chat_session import ChatSession
    from app.models.chat_message import ChatMessage
    from sqlalchemy import delete
    
    # İlgili tüm verileri sil
    # 1. Görevler
    await db.execute(delete(Task).where(Task.project_id == project_id))
    # 2. Notlar
    await db.execute(delete(Note).where(Note.project_id == project_id))
    # 3. Takvim
    await db.execute(delete(CalendarEvent).where(CalendarEvent.project_id == project_id))
    # 4. Chat session ve mesajlar
    sessions_result = await db.execute(select(ChatSession).where(ChatSession.project_id == project_id))
    session_ids = [s.id for s in sessions_result.scalars().all()]
    if session_ids:
        await db.execute(delete(ChatMessage).where(ChatMessage.session_id.in_(session_ids)))
        await db.execute(delete(ChatSession).where(ChatSession.project_id == project_id))
        
    await db.delete(db_project)
    await db.commit()
    
    try:
        from app.routers.websocket import manager
        await manager.broadcast({"type": "project_update", "project_id": project_id})
    except Exception as e:
        logger.error(f"Failed to broadcast project deletion: {e}")
        
    return {"status": "ok", "message": "Project and all related data deleted successfully"}

@router.put("/{project_id}/columns", response_model=ProjectResponse)
async def update_project_columns(
    project_id: int,
    columns: List[dict],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    # 1. Liste doğrulaması
    if not isinstance(columns, list):
        raise HTTPException(status_code=400, detail="Sütun yapılandırması bir liste olmalıdır.")
    
    # 2. Her sütun için alan kontrolü
    required_keys = {"id", "statusKey", "label", "dotColor"}
    seen_status_keys = set()
    
    for col in columns:
        if not isinstance(col, dict):
            raise HTTPException(status_code=400, detail="Her sütun bir JSON objesi olmalıdır.")
        if not required_keys.issubset(col.keys()):
            raise HTTPException(status_code=400, detail=f"Sütunlarda eksik alan var. Gerekli alanlar: {required_keys}")
        
        # Alanların boş olmaması kontrolü
        for k in required_keys:
            val = col[k]
            if val is None or (isinstance(val, str) and not str(val).strip()):
                raise HTTPException(status_code=400, detail=f"'{k}' alanı boş olamaz.")
        
        status_key = str(col["statusKey"]).strip()
        if status_key in seen_status_keys:
            raise HTTPException(status_code=400, detail=f"Mükerrer statusKey tespit edildi: {status_key}")
        seen_status_keys.add(status_key)

    # 3. Varsayılan statusKey'lerin varlık kontrolü
    default_status_keys = {"todo", "in_progress", "done"}
    for def_key in default_status_keys:
        if def_key not in seen_status_keys:
            raise HTTPException(status_code=400, detail=f"Varsayılan '{def_key}' sütunu silinemez.")

    # Projeyi bul
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    db_project = result.scalars().first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
        
    db_project.columns_config = columns
    
    # flag_modified ile JSON alanının değiştiğini SQLAlchemy'ye bildir
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(db_project, "columns_config")
    
    await db.commit()
    await db.refresh(db_project)
    
    # WebSocket broadcast
    try:
        from app.routers.websocket import manager
        await manager.broadcast({"type": "project_update", "project_id": db_project.id})
    except Exception as e:
        logger.error(f"Failed to broadcast project columns update: {e}")
        
    return db_project

