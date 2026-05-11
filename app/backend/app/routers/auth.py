from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import base64
from datetime import datetime
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.user_company_access import UserCompanyAccess
from app.models.project import Project
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, ProfileUpdate
from app.dependencies.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.utils.activity import log_activity
from pydantic import BaseModel

class PasswordReset(BaseModel):
    username: str
    new_password: str

router = APIRouter()

@router.post("/reset-password")
async def reset_password(data: PasswordReset, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    user.password_hash = get_password_hash(data.new_password)
    await db.commit()
    return {"message": "Şifre başarıyla sıfırlandı"}


from app.dependencies.admin import require_super_admin

@router.post("/register", response_model=TokenResponse)
async def register(
    user: UserRegister, 
    db: AsyncSession = Depends(get_db),
    # Sadece ilk kurulum veya super admin kullanımında izin verilecek. 
    # Normal akışta admin panelden kullanıcı eklenecek.
    # current_admin: User = Depends(require_super_admin)
):
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    # İlk kayıt olan kullanıcı süper admin olsun diye kontrol yapalım
    users_count = await db.execute(select(func.count(User.id)))
    count = users_count.scalar() or 0
    role = "super_admin" if count == 0 else "viewer"
    
    # Tam yetkiler
    from app.models.role_templates import FULL_PERMISSIONS
    permissions = FULL_PERMISSIONS if role == "super_admin" else {}

    new_user = User(
        username=user.username,
        password_hash=hashed_password,
        name=user.name,
        role=role,
        permissions=permissions
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # Standard OAuth2 endpoint for Swagger UI, or our custom payload
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı")
        
    # Son giriş zamanını güncelle
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Aktivite logla
    await log_activity(db, user.id, "user_login", "auth", {"method": "oauth2"}, request)
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login_custom", response_model=TokenResponse)
async def login_custom(user_login: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user_login.username))
    user = result.scalars().first()
    if not user or not verify_password(user_login.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı")
        
    # Son giriş zamanını güncelle
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Aktivite logla
    await log_activity(db, user.id, "user_login", "auth", {"method": "custom"}, request)
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Kullanıcının firma erişim bilgilerini de dön
    result = await db.execute(
        select(UserCompanyAccess, Project.name, Project.color)
        .join(Project, UserCompanyAccess.project_id == Project.id)
        .where(UserCompanyAccess.user_id == current_user.id)
    )
    accesses = result.all()
    company_accesses = [{
        "project_id": a.UserCompanyAccess.project_id,
        "project_name": a.name,
        "color": a.color,
        "permissions": a.UserCompanyAccess.permissions or {},
        "is_owner": a.UserCompanyAccess.is_owner or False
    } for a in accesses]
    
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "role": current_user.role,
        "permissions": current_user.permissions or {},
        "is_active": current_user.is_active,
        "last_login": current_user.last_login,
        "company_accesses": company_accesses
    }

@router.put("/profile", response_model=UserResponse)
async def update_profile(profile: ProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if profile.username is not None and profile.username != current_user.username:
        result = await db.execute(select(User).where(User.username == profile.username))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = profile.username
    
    if profile.password is not None:
        current_user.password_hash = get_password_hash(profile.password)
        
    if profile.name is not None:
        current_user.name = profile.name
        
    if profile.avatar_url is not None:
        current_user.avatar_url = profile.avatar_url
        
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Read file content
    content = await file.read()
    
    # Check size (optional, e.g., max 2MB)
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Dosya boyutu 2MB'den küçük olmalıdır.")
        
    # Convert to base64
    base64_encoded = base64.b64encode(content).decode('utf-8')
    mime_type = file.content_type or "image/jpeg"
    avatar_url = f"data:{mime_type};base64,{base64_encoded}"
    
    current_user.avatar_url = avatar_url
    await db.commit()
    
    return {"avatar_url": avatar_url}
