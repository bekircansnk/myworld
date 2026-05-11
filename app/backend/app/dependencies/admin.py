from fastapi import Depends, HTTPException
from app.dependencies.auth import get_current_user
from app.models.user import User


async def require_admin(current_user: User = Depends(get_current_user)):
    """Admin veya super_admin rolü gerektirir"""
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


async def require_super_admin(current_user: User = Depends(get_current_user)):
    """Sadece super_admin rolü gerektirir"""
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Süper admin yetkisi gerekli")
    return current_user
