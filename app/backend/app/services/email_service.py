"""E-posta gönderim servisi — Gmail SMTP üzerinden çalışır"""
import secrets
from datetime import datetime, timedelta
from typing import Optional

from app.config import settings


def generate_token() -> str:
    """Benzersiz 64 karakterlik güvenli token üretir"""
    return secrets.token_urlsafe(48)


import httpx

async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Resend API ile e-posta gönderir"""
    if not settings.resend_api_key:
        print("[EMAIL] Resend API Key bulunamadı, e-posta gönderilemedi.")
        return False

    headers = {
        "Authorization": f"Bearer {settings.resend_api_key}",
        "Content-Type": "application/json"
    }
    
    # Alan adı Resend üzerinden doğrulandı (pikselai.com)
    from_email = "info@pikselai.com"
    
    payload = {
        "from": f"{settings.smtp_from_name} <{from_email}>",
        "to": [to],
        "subject": subject,
        "html": html_body
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post("https://api.resend.com/emails", json=payload, headers=headers)
            response.raise_for_status()
            print(f"[EMAIL] Gönderildi (Resend) → {to}")
            return True
    except Exception as e:
        print(f"[EMAIL] Resend gönderim hatası → {to}: {e}")
        return False


def _base_template(content: str) -> str:
    """Tüm e-postalar için ortak HTML şablonu - Premium Dark Tema Uyumlu"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="background-color:#0f1117;padding:40px 20px;">
            <div style="max-width:560px;margin:0 auto;background-color:#111421;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:0 20px 40px rgba(0,0,0,0.4);">
                
                <!-- Başlık Alanı (Gradient) -->
                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 32px;text-align:center;position:relative;overflow:hidden;">
                    <!-- Dekoratif blur çemberi -->
                    <div style="position:absolute;top:-50%;left:-20%;width:100%;height:200%;background:rgba(255,255,255,0.1);filter:blur(50px);border-radius:50%;"></div>
                    
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;position:relative;z-index:1;">✨ My World</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;font-weight:500;position:relative;z-index:1;">Kişisel Yönetim Sistemi</p>
                </div>
                
                <!-- İçerik Alanı -->
                <div style="padding:40px 32px;">
                    {content}
                </div>
                
                <!-- Alt Bilgi (Footer) -->
                <div style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;background-color:rgba(255,255,255,0.02);">
                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                        Bu mesaj <strong>My World</strong> sistemi tarafından otomatik olarak gönderilmiştir.<br>
                        Lütfen bu e-postayı yanıtlamayınız.
                    </p>
                </div>
                
            </div>
            
            <!-- Ekstra Alt Metin -->
            <div style="max-width:560px;margin:24px auto 0;text-align:center;">
                <p style="margin:0;color:#475569;font-size:12px;">
                    &copy; {datetime.now().year} My World. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    </body>
    </html>
    """


async def send_verification_email(to: str, name: str, token: str) -> bool:
    """E-posta doğrulama maili gönderir"""
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"

    content = f"""
    <h2 style="color:#f1f5f9;margin:0 0 20px;font-size:22px;font-weight:700;">Merhaba {name}, 👋</h2>
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 28px;font-size:16px;">
        My World'e katıldığınız için teşekkür ederiz. Hesabınızı güvenle kullanmaya başlamak için e-posta adresinizi doğrulamanız gerekmektedir. 
        Bu doğrulama linki güvenliğiniz için <strong style="color:#cbd5e1;">24 saat</strong> boyunca geçerlidir.
    </p>
    
    <div style="text-align:center;margin:36px 0;">
        <a href="{verify_url}" 
           style="display:inline-block;background:linear-gradient(to right,#4f46e5,#6366f1);color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:600;font-size:16px;box-shadow:0 10px 25px rgba(79,70,229,0.3);letter-spacing:0.3px;">
            E-posta Adresimi Doğrula
        </a>
    </div>
    
    <div style="margin-top:32px;padding-top:24px;border-top:1px dashed rgba(255,255,255,0.1);">
        <p style="color:#64748b;font-size:13px;margin:0 0 8px;line-height:1.5;">
            Butona tıklamakta sorun yaşıyorsanız, aşağıdaki bağlantıyı kopyalayıp tarayıcınızın adres çubuğuna yapıştırabilirsiniz:
        </p>
        <a href="{verify_url}" style="color:#818cf8;word-break:break-all;font-size:13px;text-decoration:underline;">{verify_url}</a>
    </div>
    """
    return await send_email(to, "My World — E-posta Adresinizi Doğrulayın", _base_template(content))


async def send_password_reset_email(to: str, name: str, token: str) -> bool:
    """Şifre sıfırlama maili gönderir"""
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"

    content = f"""
    <h2 style="color:#f1f5f9;margin:0 0 20px;font-size:22px;font-weight:700;">Şifre Sıfırlama Talebi 🔐</h2>
    
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 12px;font-size:16px;">
        Merhaba {name},
    </p>
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 28px;font-size:16px;">
        Hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak yeni şifrenizi güvenli bir şekilde belirleyebilirsiniz. 
        Bu link <strong style="color:#cbd5e1;">1 saat</strong> boyunca geçerlidir.
    </p>
    
    <div style="text-align:center;margin:36px 0;">
        <a href="{reset_url}" 
           style="display:inline-block;background:linear-gradient(to right,#4f46e5,#6366f1);color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:600;font-size:16px;box-shadow:0 10px 25px rgba(79,70,229,0.3);letter-spacing:0.3px;">
            Yeni Şifre Belirle
        </a>
    </div>
    
    <div style="background-color:rgba(239,68,68,0.1);border-left:4px solid #ef4444;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="color:#fca5a5;margin:0;font-size:14px;line-height:1.5;">
            <strong>Güvenlik Uyarısı:</strong> Bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın. Hesabınız şu an güvendedir.
        </p>
    </div>
    
    <div style="margin-top:16px;padding-top:24px;border-top:1px dashed rgba(255,255,255,0.1);">
        <p style="color:#64748b;font-size:13px;margin:0 0 8px;line-height:1.5;">
            Alternatif bağlantı:
        </p>
        <a href="{reset_url}" style="color:#818cf8;word-break:break-all;font-size:13px;text-decoration:underline;">{reset_url}</a>
    </div>
    """
    return await send_email(to, "My World — Şifrenizi Sıfırlayın", _base_template(content))


async def send_welcome_email(to: str, name: str, username: str, temp_password: Optional[str] = None) -> bool:
    """Admin tarafından oluşturulan kullanıcıya hoşgeldin maili gönderir"""
    login_url = f"{settings.frontend_url}"

    password_info = ""
    if temp_password:
        password_info = f"""
        <div style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin:24px 0;">
            <h3 style="color:#cbd5e1;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Giriş Bilgileriniz</h3>
            
            <div style="margin-bottom:12px;">
                <span style="color:#64748b;font-size:14px;display:inline-block;width:100px;">Kullanıcı Adı:</span>
                <strong style="color:#f1f5f9;font-size:16px;font-family:monospace;background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:6px;">{username}</strong>
            </div>
            
            <div>
                <span style="color:#64748b;font-size:14px;display:inline-block;width:100px;">Geçici Şifre:</span>
                <strong style="color:#f1f5f9;font-size:16px;font-family:monospace;background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:6px;">{temp_password}</strong>
            </div>
        </div>
        
        <p style="color:#fbbf24;font-size:14px;margin:16px 0 24px;display:flex;align-items:center;">
            <span>⚠️</span> 
            <span style="margin-left:8px;">Güvenliğiniz için sisteme ilk girişinizde profil ayarlarından şifrenizi değiştirmenizi önemle tavsiye ederiz.</span>
        </p>
        """

    content = f"""
    <h2 style="color:#f1f5f9;margin:0 0 20px;font-size:22px;font-weight:700;">Aramıza Hoş Geldiniz! 🎉</h2>
    
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 16px;font-size:16px;">
        Merhaba {name}, My World hesabınız başarıyla oluşturulmuştur. Artık kişisel yönetim sistemini kullanmaya başlayabilirsiniz.
    </p>
    
    {password_info}
    
    <div style="text-align:center;margin:36px 0;">
        <a href="{login_url}" 
           style="display:inline-block;background:linear-gradient(to right,#4f46e5,#6366f1);color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:600;font-size:16px;box-shadow:0 10px 25px rgba(79,70,229,0.3);letter-spacing:0.3px;">
            Sisteme Giriş Yap
        </a>
    </div>
    """
    return await send_email(to, "My World — Hesabınız Oluşturuldu", _base_template(content))


def generate_numeric_otp(length: int = 6) -> str:
    """Rastgele rakamlardan oluşan OTP üretir"""
    import random
    return "".join(str(random.randint(0, 9)) for _ in range(length))


async def send_login_otp_email(to: str, name: str, otp_code: str) -> bool:
    """Şifresiz giriş için 6 haneli OTP kodu gönderir"""
    content = f"""
    <h2 style="color:#f1f5f9;margin:0 0 20px;font-size:22px;font-weight:700;">Giriş Doğrulama Kodu ✨</h2>
    
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;font-size:16px;">
        Merhaba {name}, sisteme şifresiz giriş yapmak için tek kullanımlık güvenlik kodunuz aşağıdadır:
    </p>
    
    <div style="text-align:center;margin:40px 0;">
        <div style="display:inline-block;background-color:rgba(79,70,229,0.1);border:1px solid rgba(79,70,229,0.3);padding:20px 40px;border-radius:16px;">
            <span style="color:#818cf8;font-size:42px;font-weight:800;letter-spacing:12px;font-family:monospace;">{otp_code}</span>
        </div>
    </div>
    
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;font-size:15px;text-align:center;">
        Bu kod güvenliğiniz için <strong style="color:#cbd5e1;">5 dakika</strong> sonra geçersiz olacaktır.
    </p>
    
    <div style="margin-top:32px;padding-top:24px;border-top:1px dashed rgba(255,255,255,0.1);">
        <p style="color:#64748b;font-size:13px;margin:0;line-height:1.5;">
            Giriş talebinde bulunmadıysanız bu mesajı görmezden gelebilirsiniz. Hesabınızın güvenliği için bu kodu kimseyle paylaşmayınız.
        </p>
    </div>
    """
    return await send_email(to, "My World — Giriş Kodunuz", _base_template(content))
