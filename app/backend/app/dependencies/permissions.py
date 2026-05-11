from fastapi import Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.user_company_access import UserCompanyAccess
from app.database import get_db
from app.models.role_templates import FULL_PERMISSIONS


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
    async def checker(current_user: User = Depends(get_current_user)):
        # Admin ve super_admin her şeye erişebilir
        if current_user.role in ("super_admin", "admin"):
            return current_user
        
        # Kullanıcının global izinlerini kontrol et
        perm = (current_user.permissions or {}).get(module, {})
        if not perm.get(action, False):
            raise HTTPException(
                status_code=403,
                detail=f"{module} modülüne {action} erişiminiz yok"
            )
        return current_user
    return checker


def require_company_permission(module: str, action: str = "view"):
    """Firma bazlı izin kontrolü — router dependency olarak kullanılır"""
    async def checker(
        project_id: Optional[int] = Query(None),
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ):
        # Super admin her şeye erişir
        if current_user.role == "super_admin":
            return current_user
        
        # project_id yoksa global izin kontrolü yap
        if not project_id:
            if current_user.role == "admin":
                return current_user
            perm = (current_user.permissions or {}).get(module, {})
            if not perm.get(action, False):
                raise HTTPException(
                    status_code=403,
                    detail=f"{module} modülüne {action} erişiminiz yok"
                )
            return current_user
        
        # Firma bazlı izin kontrolü
        access = await get_user_company_access(db, current_user.id, project_id)
        if not access:
            raise HTTPException(status_code=403, detail="Bu firmaya erişiminiz yok")
        
        # Firma sahibi tam yetkili
        if access.is_owner:
            return current_user
        
        # Admin rolü firma bazlı da tam yetki
        if current_user.role == "admin":
            return current_user
        
        # Firma bazlı modül izinlerini kontrol et
        perm = (access.permissions or {}).get(module, {})
        if not perm.get(action, False):
            raise HTTPException(
                status_code=403,
                detail=f"Bu firma için {module} modülüne {action} yetkiniz yok"
            )
        return current_user
    return checker
