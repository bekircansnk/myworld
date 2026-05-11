from fastapi import Depends, HTTPException
from app.dependencies.auth import get_current_user
from app.models.user import User


def require_permission(module: str, action: str = "view"):
    """Modül bazlı izin kontrolü — router dependency olarak kullanılır"""
    async def checker(current_user: User = Depends(get_current_user)):
        # Admin ve super_admin her şeye erişebilir
        if current_user.role in ("super_admin", "admin"):
            return current_user
        
        # Kullanıcının izinlerini kontrol et
        perm = (current_user.permissions or {}).get(module, {})
        if not perm.get(action, False):
            raise HTTPException(
                status_code=403,
                detail=f"{module} modülüne {action} erişiminiz yok"
            )
        return current_user
    return checker
