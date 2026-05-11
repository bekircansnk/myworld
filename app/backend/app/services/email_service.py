"""E-posta gönderim servisi — Resend API üzerinden çalışır"""
import secrets
from datetime import datetime
from typing import Optional

from app.config import settings
import httpx


def generate_token() -> str:
    """Benzersiz 64 karakterlik güvenli token üretir"""
    return secrets.token_urlsafe(48)


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
    """Tüm e-postalar için ortak HTML şablonu — Açık tema, kompakt yapı"""
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f0ede1;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,Arial,sans-serif;">
    <div style="padding:24px 16px;">
        <div style="max-width:460px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);border:1px solid #e8e5d8;">

            <!-- Başlık -->
            <div style="background:#1a1a1a;padding:18px 24px;text-align:center;">
                <span style="color:#f59e0b;font-size:17px;font-weight:800;letter-spacing:-0.3px;">My World</span>
            </div>

            <!-- İçerik -->
            <div style="padding:24px;">
                {content}
            </div>

            <!-- Footer -->
            <div style="padding:12px 24px;border-top:1px solid #f0ede1;background:#faf9f5;">
                <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;line-height:1.5;">
                    My World tarafından otomatik gönderilmiştir &mdash; lütfen yanıtlamayınız. &copy; {datetime.now().year}
                </p>
            </div>

        </div>
    </div>
</body>
</html>"""


async def send_verification_email(to: str, name: str, token: str) -> bool:
    """E-posta doğrulama maili gönderir"""
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"

    content = f"""
    <p style="margin:0 0 4px;color:#1a1a1a;font-size:16px;font-weight:700;">Merhaba {name},</p>
    <p style="margin:0 0 18px;color:#6b7280;font-size:14px;line-height:1.6;">E-posta adresinizi doğrulamak için butona tıklayın. Link <strong style="color:#1a1a1a;">24 saat</strong> geçerlidir.</p>

    <div style="text-align:center;margin:18px 0;">
        <a href="{verify_url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:10px;font-weight:600;font-size:14px;">
            E-postamı Doğrula
        </a>
    </div>

    <p style="margin:14px 0 0;color:#9ca3af;font-size:12px;word-break:break-all;">
        Buton çalışmıyorsa: <a href="{verify_url}" style="color:#f59e0b;">{verify_url}</a>
    </p>
    """
    return await send_email(to, "My World — E-posta Doğrulama", _base_template(content))


async def send_password_reset_email(to: str, name: str, token: str) -> bool:
    """Şifre sıfırlama maili gönderir"""
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"

    content = f"""
    <p style="margin:0 0 4px;color:#1a1a1a;font-size:16px;font-weight:700;">Şifre Sıfırlama</p>
    <p style="margin:0 0 18px;color:#6b7280;font-size:14px;line-height:1.6;">Merhaba {name}, şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyin. Link <strong style="color:#1a1a1a;">1 saat</strong> geçerlidir.</p>

    <div style="text-align:center;margin:18px 0;">
        <a href="{reset_url}" style="display:inline-block;background:#f59e0b;color:#1a1a1a;text-decoration:none;padding:11px 26px;border-radius:10px;font-weight:700;font-size:14px;">
            Yeni Şifre Belirle
        </a>
    </div>

    <div style="background:#fef9ec;border-left:3px solid #f59e0b;padding:9px 13px;border-radius:0 8px 8px 0;margin:14px 0 0;">
        <p style="margin:0;color:#92400e;font-size:12px;line-height:1.5;">Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
    </div>
    """
    return await send_email(to, "My World — Şifre Sıfırlama", _base_template(content))


async def send_welcome_email(to: str, name: str, username: str, temp_password: Optional[str] = None) -> bool:
    """Admin tarafından oluşturulan kullanıcıya hoşgeldin maili gönderir"""
    login_url = f"{settings.frontend_url}"

    password_info = ""
    if temp_password:
        password_info = f"""
        <div style="background:#f9f8f4;border:1px solid #e8e5d8;border-radius:10px;padding:13px 16px;margin:14px 0;">
            <p style="margin:0 0 6px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Giriş Bilgileri</p>
            <p style="margin:0 0 3px;color:#1a1a1a;font-size:13px;"><strong>Kullanıcı Adı:</strong> <code style="background:#e8e5d8;padding:2px 5px;border-radius:4px;">{username}</code></p>
            <p style="margin:0;color:#1a1a1a;font-size:13px;"><strong>Geçici Şifre:</strong> <code style="background:#e8e5d8;padding:2px 5px;border-radius:4px;">{temp_password}</code></p>
        </div>
        <p style="margin:0 0 14px;color:#92400e;font-size:12px;background:#fef9ec;padding:8px 12px;border-radius:6px;">
            İlk girişinizde şifrenizi değiştirmenizi öneririz.
        </p>
        """

    content = f"""
    <p style="margin:0 0 4px;color:#1a1a1a;font-size:16px;font-weight:700;">Hoş Geldiniz, {name}!</p>
    <p style="margin:0 0 14px;color:#6b7280;font-size:14px;line-height:1.6;">My World hesabınız oluşturuldu. Kişisel yönetim sistemine hemen erişebilirsiniz.</p>

    {password_info}

    <div style="text-align:center;margin:18px 0;">
        <a href="{login_url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:10px;font-weight:600;font-size:14px;">
            Sisteme Giriş Yap
        </a>
    </div>
    """
    return await send_email(to, "My World — Hesabınız Hazır", _base_template(content))


def generate_numeric_otp(length: int = 6) -> str:
    """Rastgele rakamlardan oluşan OTP üretir"""
    import random
    return "".join(str(random.randint(0, 9)) for _ in range(length))


async def send_login_otp_email(to: str, name: str, otp_code: str) -> bool:
    """Şifresiz giriş için 6 haneli OTP kodu gönderir"""
    content = f"""
    <p style="margin:0 0 4px;color:#1a1a1a;font-size:16px;font-weight:700;">Giriş Kodunuz</p>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">Merhaba {name}, tek kullanımlık giriş kodunuz:</p>

    <div style="text-align:center;margin:16px 0;">
        <div style="display:inline-block;background:#1a1a1a;padding:14px 28px;border-radius:12px;">
            <span style="color:#f59e0b;font-size:32px;font-weight:800;letter-spacing:10px;font-family:monospace;">{otp_code}</span>
        </div>
    </div>

    <p style="margin:14px 0 0;color:#9ca3af;font-size:12px;text-align:center;">
        Bu kod <strong style="color:#1a1a1a;">5 dakika</strong> geçerlidir. Kimseyle paylaşmayın.
    </p>
    """
    return await send_email(to, "My World — Giriş Kodunuz", _base_template(content))
