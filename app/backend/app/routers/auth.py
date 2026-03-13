from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
from datetime import datetime
import shutil

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, ProfileUpdate
from app.dependencies.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        password_hash=hashed_password,
        name=user.name
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # Standard OAuth2 endpoint for Swagger UI, or our custom payload
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login_custom", response_model=TokenResponse)
async def login_custom(user_login: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user_login.username))
    user = result.scalars().first()
    if not user or not verify_password(user_login.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

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
    upload_dir = "uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1]
    filename = f"{current_user.id}_{datetime.now().timestamp()}.{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Avatar url path
    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url
    await db.commit()
    
    return {"avatar_url": avatar_url}
