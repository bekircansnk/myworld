from fastapi import Depends, HTTPException
from app.dependencies.auth import get_current_user
from app.models.user import User


async def require_admin(current_user: User = Depends(get_current_user)):
    """Sadece 'bekir' kullanıcı adına sahip adminler erişebilir"""
    if current_user.role not in ("admin", "super_admin") or current_user.username.lower() != "bekir":
        raise HTTPException(status_code=403, detail="Sadece sistem sahibi erişebilir")
    return current_user


async def require_super_admin(current_user: User = Depends(get_current_user)):
    """Sadece 'bekir' kullanıcı adına sahip süper adminler erişebilir"""
    if current_user.role != "super_admin" or current_user.username.lower() != "bekir":
        raise HTTPException(status_code=403, detail="Sadece sistem sahibi erişebilir")
    return current_user
