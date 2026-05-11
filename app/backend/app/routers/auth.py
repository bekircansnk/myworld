from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
import os
import base64
from datetime import datetime, timedelta
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.user_company_access import UserCompanyAccess
from app.models.project import Project
from app.models.email_verification import EmailVerification
from app.schemas.auth import (
    UserRegister, UserLogin, UserResponse, TokenResponse, ProfileUpdate,
    ForgotPasswordRequest, ResetPasswordWithToken, VerifyEmailRequest, ResendVerificationRequest,
    SendOTPRequest, LoginWithOTPRequest
)
from app.dependencies.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.utils.activity import log_activity
from app.services.email_service import generate_token, send_verification_email, send_password_reset_email, generate_numeric_otp, send_login_otp_email
from pydantic import BaseModel

class PasswordReset(BaseModel):
    username: str
    new_password: str

router = APIRouter()

# ============================================================
# ESKİ ŞİFRE SIFIRLAMA (Geriye uyumluluk)
# ============================================================
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

# ============================================================
# KAYIT — E-posta destekli
# ============================================================
@router.post("/register", response_model=TokenResponse)
async def register(
    user: UserRegister, 
    db: AsyncSession = Depends(get_db),
):
    # Kullanıcı adı kontrolü
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")
    
    # E-posta kontrolü (varsa)
    if user.email:
        email_check = await db.execute(select(User).where(User.email == user.email))
        if email_check.scalars().first():
            raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
        
    hashed_password = get_password_hash(user.password)
    # İlk kullanıcı süper admin olsun
    users_count = await db.execute(select(func.count(User.id)))
    count = users_count.scalar() or 0
    role = "super_admin" if count == 0 else "viewer"
    
    from app.models.role_templates import FULL_PERMISSIONS
    permissions = FULL_PERMISSIONS if role == "super_admin" else {}

    new_user = User(
        username=user.username,
        password_hash=hashed_password,
        name=user.name,
        email=user.email,
        role=role,
        permissions=permissions,
        email_verified=False
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # E-posta varsa doğrulama maili gönder
    if user.email:
        token = generate_token()
        verification = EmailVerification(
            user_id=new_user.id,
            token=token,
            token_type="verify_email",
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        db.add(verification)
        await db.commit()
        # Arka planda gönder (başarısız olursa kayıt iptal olmaz)
        await send_verification_email(user.email, user.name, token)
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

# ============================================================
# GİRİŞ — E-posta VEYA Kullanıcı Adı ile
# ============================================================
@router.post("/login", response_model=TokenResponse)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # E-posta veya kullanıcı adı ile arama
    identifier = form_data.username
    result = await db.execute(
        select(User).where(
            or_(User.username == identifier, User.email == identifier)
        )
    )
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı/e-posta veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı")
        
    # Son giriş zamanını güncelle
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Aktivite logla
    await log_activity(db, user.id, "user_login", "auth", {"method": "oauth2", "identifier": identifier}, request)
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login_custom", response_model=TokenResponse)
async def login_custom(user_login: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    # E-posta veya kullanıcı adı ile arama
    identifier = user_login.username
    result = await db.execute(
        select(User).where(
            or_(User.username == identifier, User.email == identifier)
        )
    )
    user = result.scalars().first()
    if not user or not verify_password(user_login.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı/e-posta veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı")
        
    user.last_login = datetime.utcnow()
    await db.commit()
    
    await log_activity(db, user.id, "user_login", "auth", {"method": "custom", "identifier": identifier}, request)
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# ============================================================
# ŞİFRESİZ GİRİŞ (OTP)
# ============================================================
@router.post("/send-login-otp")
async def send_login_otp(data: SendOTPRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Şifresiz giriş için e-postaya 6 haneli OTP kodu gönderir"""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user:
        # Güvenlik açısından "kullanıcı bulunamadı" demek yerine aynı mesaj dönülebilir 
        # ancak kullanıcıya anlık hata vermek bu senaryoda daha iyi bir UX sunar
        raise HTTPException(status_code=404, detail="Sistemde bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.")
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı")
        
    # Eski kullanılmamış OTP'leri geçersiz yap
    old_tokens = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.token_type == "login_otp",
            EmailVerification.used == False
        )
    )
    for old in old_tokens.scalars().all():
        old.used = True
        
    # Yeni 6 haneli OTP oluştur (5 dakika geçerli)
    otp_code = generate_numeric_otp(6)
    verification = EmailVerification(
        user_id=user.id,
        token=otp_code,
        token_type="login_otp",
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(verification)
    await db.commit()
    
    await send_login_otp_email(user.email, user.name, otp_code)
    return {"message": "Giriş kodu e-posta adresinize gönderildi"}

@router.post("/login-with-otp", response_model=TokenResponse)
async def login_with_otp(data: LoginWithOTPRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """OTP kodu ile sisteme giriş yapar"""
    user_result = await db.execute(select(User).where(User.email == data.email))
    user = user_result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
    # OTP kodunu doğrula
    verify_result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.token == data.code,
            EmailVerification.token_type == "login_otp",
            EmailVerification.used == False
        )
    )
    verification = verify_result.scalars().first()
    
    if not verification:
        raise HTTPException(status_code=400, detail="Hatalı veya kullanılmış kod")
        
    if verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Kodun süresi dolmuş. Lütfen yeni kod isteyin.")
        
    # Kod geçerli, giriş yap
    verification.used = True
    user.last_login = datetime.utcnow()
    user.email_verified = True # Kod girebildiğine göre e-posta doğrulanmış sayılır
    await db.commit()
    
    await log_activity(db, user.id, "user_login", "auth", {"method": "otp", "identifier": data.email}, request)
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# ============================================================
# E-POSTA DOĞRULAMA
# ============================================================
@router.post("/verify-email")
async def verify_email(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """E-posta doğrulama token'ını kontrol eder ve hesabı doğrular"""
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.token == data.token,
            EmailVerification.token_type == "verify_email",
            EmailVerification.used == False
        )
    )
    verification = result.scalars().first()
    
    if not verification:
        raise HTTPException(status_code=400, detail="Geçersiz veya kullanılmış doğrulama linki")
    
    if verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Doğrulama linkinin süresi dolmuş. Yeni link isteyin.")
    
    # Kullanıcıyı bul ve doğrula
    user_result = await db.execute(select(User).where(User.id == verification.user_id))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    user.email_verified = True
    verification.used = True
    await db.commit()
    
    return {"message": "E-posta adresiniz başarıyla doğrulandı! ✅", "email": user.email}

# ============================================================
# DOĞRULAMA MAİLİ TEKRAR GÖNDER
# ============================================================
@router.post("/resend-verification")
async def resend_verification(data: ResendVerificationRequest, db: AsyncSession = Depends(get_db)):
    """Doğrulama e-postasını tekrar gönderir"""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user:
        # Güvenlik: E-posta var mı bilgi verme
        return {"message": "E-posta adresinize doğrulama linki gönderildi"}
    
    if user.email_verified:
        return {"message": "E-posta adresiniz zaten doğrulanmış"}
    
    # Eski kullanılmamış tokenleri geçersiz yap
    old_tokens = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.token_type == "verify_email",
            EmailVerification.used == False
        )
    )
    for old in old_tokens.scalars().all():
        old.used = True
    
    # Yeni token oluştur
    token = generate_token()
    verification = EmailVerification(
        user_id=user.id,
        token=token,
        token_type="verify_email",
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(verification)
    await db.commit()
    
    await send_verification_email(user.email, user.name, token)
    return {"message": "E-posta adresinize doğrulama linki gönderildi"}

# ============================================================
# ŞİFREMİ UNUTTUM
# ============================================================
@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """E-posta adresine şifre sıfırlama linki gönderir"""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    # Güvenlik: E-posta olsa da olmasa da aynı mesajı dön
    if not user:
        return {"message": "E-posta adresinize şifre sıfırlama linki gönderildi"}
    
    # Eski kullanılmamış reset tokenlerini geçersiz yap
    old_tokens = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user.id,
            EmailVerification.token_type == "reset_password",
            EmailVerification.used == False
        )
    )
    for old in old_tokens.scalars().all():
        old.used = True
    
    # Yeni token oluştur (1 saat geçerli)
    token = generate_token()
    verification = EmailVerification(
        user_id=user.id,
        token=token,
        token_type="reset_password",
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.add(verification)
    await db.commit()
    
    await send_password_reset_email(user.email, user.name, token)
    return {"message": "E-posta adresinize şifre sıfırlama linki gönderildi"}

# ============================================================
# TOKEN İLE GÜVENLİ ŞİFRE SIFIRLAMA
# ============================================================
@router.post("/reset-password-with-token")
async def reset_password_with_token(data: ResetPasswordWithToken, db: AsyncSession = Depends(get_db)):
    """Token doğrulayarak güvenli şifre sıfırlar"""
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.token == data.token,
            EmailVerification.token_type == "reset_password",
            EmailVerification.used == False
        )
    )
    verification = result.scalars().first()
    
    if not verification:
        raise HTTPException(status_code=400, detail="Geçersiz veya kullanılmış sıfırlama linki")
    
    if verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Sıfırlama linkinin süresi dolmuş. Yeni link isteyin.")
    
    # Kullanıcıyı bul
    user_result = await db.execute(select(User).where(User.id == verification.user_id))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Şifreyi güncelle
    user.password_hash = get_password_hash(data.new_password)
    verification.used = True
    
    # E-posta da doğrulanmış sayılsın (e-postasına erişebildi)
    user.email_verified = True
    await db.commit()
    
    return {"message": "Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz. ✅"}

# ============================================================
# TOKEN GEÇERLİLİK KONTROLÜ
# ============================================================
@router.get("/verify-token/{token}")
async def check_token_validity(token: str, db: AsyncSession = Depends(get_db)):
    """Frontend'in token geçerliliğini kontrol etmesi için"""
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.token == token,
            EmailVerification.used == False
        )
    )
    verification = result.scalars().first()
    
    if not verification:
        return {"valid": False, "reason": "Geçersiz veya kullanılmış link"}
    
    if verification.expires_at < datetime.utcnow():
        return {"valid": False, "reason": "Link süresi dolmuş"}
    
    return {"valid": True, "type": verification.token_type}

# ============================================================
# PROFİL VE MEVCUT KULLANICI
# ============================================================
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
        "email_verified": current_user.email_verified,
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
    
    # E-posta değişikliği
    if profile.email is not None and profile.email != current_user.email:
        # Yeni e-posta başka kullanıcıda var mı?
        if profile.email:
            email_check = await db.execute(select(User).where(User.email == profile.email, User.id != current_user.id))
            if email_check.scalars().first():
                raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kullanılıyor")
        current_user.email = profile.email
        current_user.email_verified = False  # Yeni e-posta doğrulanmamış
        
        # Doğrulama maili gönder
        if profile.email:
            token = generate_token()
            verification = EmailVerification(
                user_id=current_user.id,
                token=token,
                token_type="verify_email",
                expires_at=datetime.utcnow() + timedelta(hours=24)
            )
            db.add(verification)
            await send_verification_email(profile.email, current_user.name, token)
        
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
