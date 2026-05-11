"""E-posta gönderim servisi — Gmail SMTP üzerinden çalışır"""
import smtplib
import secrets
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from typing import Optional

from app.config import settings


def generate_token() -> str:
    """Benzersiz 64 karakterlik güvenli token üretir"""
    return secrets.token_urlsafe(48)


async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Gmail SMTP ile e-posta gönderir"""
    if not settings.smtp_user or not settings.smtp_password:
        print("[EMAIL] SMTP ayarları yapılandırılmamış, e-posta gönderilemedi.")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email or settings.smtp_user}>"
    msg["To"] = to
    msg["Subject"] = subject

    # HTML gövdesi
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to, msg.as_string())
        print(f"[EMAIL] Gönderildi → {to}")
        return True
    except Exception as e:
        print(f"[EMAIL] Gönderim hatası → {to}: {e}")
        return False


def _base_template(content: str) -> str:
    """Tüm e-postalar için ortak HTML şablonu"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
            <!-- Başlık -->
            <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 24px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🌍 My World</h1>
            </div>
            <!-- İçerik -->
            <div style="padding:32px 24px;">
                {content}
            </div>
            <!-- Alt bilgi -->
            <div style="padding:16px 24px;border-top:1px solid #334155;text-align:center;">
                <p style="margin:0;color:#64748b;font-size:12px;">Bu e-posta My World sistemi tarafından otomatik gönderilmiştir.</p>
            </div>
        </div>
    </body>
    </html>
    """


async def send_verification_email(to: str, name: str, token: str) -> bool:
    """E-posta doğrulama maili gönderir"""
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"

    content = f"""
    <h2 style="color:#e2e8f0;margin:0 0 16px;font-size:20px;">Merhaba {name}! 👋</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
        Hesabınızı doğrulamak için aşağıdaki butona tıklayın. 
        Bu link <strong style="color:#e2e8f0;">24 saat</strong> geçerlidir.
    </p>
    <div style="text-align:center;margin:24px 0;">
        <a href="{verify_url}" 
           style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
            ✉️ E-postamı Doğrula
        </a>
    </div>
    <p style="color:#64748b;font-size:13px;margin:16px 0 0;">
        Buton çalışmıyorsa bu linki kopyalayıp tarayıcınıza yapıştırın:<br>
        <a href="{verify_url}" style="color:#818cf8;word-break:break-all;">{verify_url}</a>
    </p>
    """
    return await send_email(to, "My World — E-posta Adresinizi Doğrulayın", _base_template(content))


async def send_password_reset_email(to: str, name: str, token: str) -> bool:
    """Şifre sıfırlama maili gönderir"""
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"

    content = f"""
    <h2 style="color:#e2e8f0;margin:0 0 16px;font-size:20px;">Şifre Sıfırlama Talebi 🔑</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 8px;">
        Merhaba {name}, şifrenizi sıfırlamak için bir talep aldık.
    </p>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
        Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
        Bu link <strong style="color:#e2e8f0;">1 saat</strong> geçerlidir.
    </p>
    <div style="text-align:center;margin:24px 0;">
        <a href="{reset_url}" 
           style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
            🔑 Şifremi Sıfırla
        </a>
    </div>
    <p style="color:#64748b;font-size:13px;margin:16px 0 0;">
        Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.<br>
        <a href="{reset_url}" style="color:#818cf8;word-break:break-all;">{reset_url}</a>
    </p>
    """
    return await send_email(to, "My World — Şifre Sıfırlama", _base_template(content))


async def send_welcome_email(to: str, name: str, username: str, temp_password: Optional[str] = None) -> bool:
    """Admin tarafından oluşturulan kullanıcıya hoşgeldin maili gönderir"""
    login_url = f"{settings.frontend_url}"

    password_info = ""
    if temp_password:
        password_info = f"""
        <div style="background:#1a1f2e;border:1px solid #334155;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="color:#94a3b8;margin:0 0 8px;font-size:13px;">Giriş Bilgileriniz:</p>
            <p style="color:#e2e8f0;margin:0;font-size:14px;">
                <strong>Kullanıcı Adı:</strong> {username}<br>
                <strong>Geçici Şifre:</strong> {temp_password}
            </p>
        </div>
        <p style="color:#f59e0b;font-size:13px;margin:8px 0 0;">
            ⚠️ Güvenliğiniz için ilk girişte şifrenizi değiştirmenizi öneririz.
        </p>
        """

    content = f"""
    <h2 style="color:#e2e8f0;margin:0 0 16px;font-size:20px;">Hoş Geldiniz! 🎉</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
        Merhaba {name}, My World hesabınız başarıyla oluşturuldu.
    </p>
    {password_info}
    <div style="text-align:center;margin:24px 0;">
        <a href="{login_url}" 
           style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
            🚀 Sisteme Giriş Yap
        </a>
    </div>
    """
    return await send_email(to, "My World — Hesabınız Oluşturuldu", _base_template(content))
