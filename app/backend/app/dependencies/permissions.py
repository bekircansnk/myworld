from fastapi import Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.user_company_access import UserCompanyAccess
from app.database import get_db
from app.models.role_templates import FULL_PERMISSIONS
from app.models.task import Task
from app.models.note import Note
from app.models.calendar_event import CalendarEvent
from app.models.project import Project


async def get_user_company_access(db: AsyncSession, user_id: int, project_id: int) -> Optional[UserCompanyAccess]:
    """Kullanıcının belirli bir firmaya erişim kaydını döner"""
    result = await db.execute(
        select(UserCompanyAccess).where(
            UserCompanyAccess.user_id == user_id,
            UserCompanyAccess.project_id == project_id
        )
    )
    return result.scalars().first()


def can_access_company(user: User, access: Optional[UserCompanyAccess], module: str, action: str = "view") -> bool:
    """Kullanıcının firmada belirli bir modüle erişip erişemeyeceğini kontrol eder"""
    # Super admin her şeye erişir
    if user.role == "super_admin":
        return True
    
    # Erişim kaydı yoksa izin yok
    if not access:
        return False
    
    # Firma sahibi tam yetkili
    if access.is_owner:
        return True
    
    # Firma bazlı izinleri kontrol et
    perm = (access.permissions or {}).get(module, {})
    return perm.get(action, False)


def require_permission(module: str, action: str = "view"):
    """Eski uyumluluk - global izin kontrolü (firma seçilmemişse)"""
    async def checker(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
        # Super admin her şeye erişebilir
        if current_user.role == "super_admin":
            return current_user
        
        # Kullanıcının global izinlerini kontrol et
        perm = (current_user.permissions or {}).get(module, {})
        if not perm.get(action, False):
            # LOG DENIAL
            from app.models.activity_log import ActivityLog
            log = ActivityLog(
                user_id=current_user.id,
                action="access_denied",
                module=module,
                details={"required_action": action, "type": "global"}
            )
            db.add(log)
            await db.commit()
            
            raise HTTPException(
                status_code=403,
                detail=f"{module} modülüne {action} erişiminiz yok"
            )
        return current_user
    return checker


def require_company_permission(module: str, action: str = "view"):
    """
    Firma bazlı izin kontrolü.
    Sırasıyla şuradan project_id bulmaya çalışır:
    1. Query String (?project_id=...)
    2. Request Body ({"project_id": ...})
    3. Path Params (task_id, note_id vb. üzerinden DB sorgusu ile)
    """
    async def checker(
        request: Request,
        project_id: Optional[int] = Query(None),
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ):
        # 1. Super admin her şeye erişir
        if current_user.role == "super_admin":
            return current_user

        effective_project_id = project_id
        
        # 2. Body'den almayı dene (POST/PUT istekleri için)
        if not effective_project_id:
            try:
                # Body'yi tüketmeden (FastAPI caching sayesinde) okumaya çalış
                body = await request.json()
                if isinstance(body, dict):
                    effective_project_id = body.get("project_id")
            except Exception:
                pass

        # 3. Path Parametrelerinden Resource ID'ye göre bul (PATCH/DELETE/GET-Detail için)
        if not effective_project_id:
            path_params = request.path_params
            resource_id = None
            model_class = None
            
            # Modüle göre resource ID ismini ve model sınıfını eşleştir
            if module == "tasks" and "task_id" in path_params:
                resource_id = path_params["task_id"]
                model_class = Task
            elif module == "notes" and "note_id" in path_params:
                resource_id = path_params["note_id"]
                model_class = Note
            elif module == "calendar" and "event_id" in path_params:
                resource_id = path_params["event_id"]
                model_class = CalendarEvent
            elif module == "projects" and "project_id" in path_params:
                # Doğrudan projenin kendisi
                effective_project_id = path_params["project_id"]

            if resource_id and model_class:
                try:
                    res_id = int(resource_id)
                    # Kaydı bulup hangi projeye ait olduğunu öğren
                    stmt = select(model_class.project_id, model_class.user_id).where(model_class.id == res_id)
                    res = await db.execute(stmt)
                    item_data = res.first()
                    if item_data:
                        effective_project_id = item_data[0]
                        # Eğer proje_id yoksa ama kullanıcı kendi kaydına erişiyorsa izin ver (Kişisel Kayıt)
                        if not effective_project_id and item_data[1] == current_user.id:
                            return current_user
                except Exception:
                    pass

        # project_id'yi int'e çevir ve state'e koy
        if effective_project_id is not None:
            try:
                effective_project_id = int(effective_project_id)
                request.state.project_id = effective_project_id
            except (ValueError, TypeError):
                effective_project_id = None

        # project_id yoksa: Global izin kontrolü
        # project_id yoksa: Global izin kontrolü
        if not effective_project_id:
            # OKUMA (LISTELEME) izni: Kullanıcı login ise ve ID yoksa kendi kayıtlarını listelemesine izin ver
            # (Router seviyesinde Task.user_id == current_user.id kontrolü zaten yapılıyor)
            if action == "view":
                return current_user

            # Yazma/Düzenleme işlemleri için mutlaka global izin veya proje bağlamı gerekir
            perm = (current_user.permissions or {}).get(module, {})
            if perm.get(action, False):
                return current_user
            
            # LOG DENIAL
            from app.models.activity_log import ActivityLog
            log = ActivityLog(
                user_id=current_user.id,
                action="access_denied",
                module=module,
                details={"required_action": action, "reason": "no_project_context"}
            )
            db.add(log)
            await db.commit()

            raise HTTPException(
                status_code=403,
                detail=f"{module} modülüne {action} erişiminiz için firma seçmelisiniz"
            )

        # 4. Firma bazlı izin kontrolü (UserCompanyAccess)
        access = await get_user_company_access(db, current_user.id, effective_project_id)
        
        # Firma erişim kaydı yoksa 
        if not access:
            # Eğer kullanıcı bu projenin "sahibi" ise (Project tablosundan kontrol)
            # Bu durum genellikle UserCompanyAccess kaydı bir şekilde silinmişse kurtarıcı olur
            stmt = select(Project).where(Project.id == effective_project_id, Project.user_id == current_user.id)
            proj_res = await db.execute(stmt)
            if proj_res.scalars().first():
                return current_user
                
            # LOG DENIAL
            from app.models.activity_log import ActivityLog
            log = ActivityLog(
                user_id=current_user.id,
                project_id=effective_project_id,
                action="access_denied",
                module=module,
                details={"required_action": action, "reason": "no_access_record"}
            )
            db.add(log)
            await db.commit()
                
            raise HTTPException(status_code=403, detail="Bu firmaya erişiminiz yok")

        # Firma sahibi (is_owner) her şeye yetkili
        if access.is_owner:
            return current_user

        # Firma bazlı modül izinlerini kontrol et
        perm = (access.permissions or {}).get(module, {})
        if not perm.get(action, False):
            # LOG DENIAL
            from app.models.activity_log import ActivityLog
            log = ActivityLog(
                user_id=current_user.id,
                project_id=effective_project_id,
                action="access_denied",
                module=module,
                details={"required_action": action, "reason": "insufficient_module_permissions", "perms": perm}
            )
            db.add(log)
            await db.commit()

            raise HTTPException(
                status_code=403,
                detail=f"Bu firma için {module} modülüne {action} yetkiniz yok"
            )
            
        return current_user
    return checker
