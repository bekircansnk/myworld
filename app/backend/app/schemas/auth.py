from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)
    name: str = Field(..., min_length=1)
    email: Optional[str] = None  # Opsiyonel, varsa doğrulama maili gönderilir

class UserLogin(BaseModel):
    username: str  # E-posta veya kullanıcı adı
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    avatar_url: Optional[str] = None
    role: str = "viewer"
    permissions: dict = {}
    email: Optional[str] = None
    email_verified: Optional[bool] = False
    is_active: bool = True
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None

# E-posta tabanlı şemalar
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordWithToken(BaseModel):
    token: str
    new_password: str = Field(..., min_length=4)

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: str

class SendOTPRequest(BaseModel):
    email: str

class LoginWithOTPRequest(BaseModel):
    email: str
    code: str = Field(..., min_length=6, max_length=6)
