import smtplib
from app.config import settings

print(f"Host: {settings.smtp_host}, Port: {settings.smtp_port}, User: {settings.smtp_user}")
try:
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
        server.set_debuglevel(1)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        print("SMTP Connection successful!")
except Exception as e:
    print(f"SMTP Error: {e}")
