import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from app.database import AsyncSessionLocal
from app.models.task import Task
from app.models.user import User
from app.services.email_service import send_email, _base_template

logger = logging.getLogger(__name__)

async def send_daily_reminders():
    """
    Her sabah 08:00'de çalışır.
    Ertesi gün teslim edilecek görevleri bulur ve ilgili kullanıcılara e-posta gönderir.
    """
    logger.info("📅 Günlük görev hatırlatıcı taraması başlatılıyor...")
    try:
        now = datetime.now(timezone.utc)
        # Yarınki günün başlangıcı ve bitişi
        tomorrow_start = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow_end = tomorrow_start + timedelta(days=1, microseconds=-1)

        async with AsyncSessionLocal() as db:
            # Yarın teslim edilecek, tamamlanmamış ve silinmemiş görevleri bul
            stmt = select(Task, User).join(User, Task.user_id == User.id).where(
                and_(
                    Task.due_date >= tomorrow_start,
                    Task.due_date <= tomorrow_end,
                    Task.status != "done",
                    Task.is_deleted == False,
                    User.email.isnot(None),
                    User.is_active == True
                )
            )
            result = await db.execute(stmt)
            tasks = result.all()

            # Kullanıcılara göre grupla
            user_tasks = {}
            for task, user in tasks:
                if user.email not in user_tasks:
                    user_tasks[user.email] = {"name": user.name, "tasks": []}
                user_tasks[user.email]["tasks"].append(task)

            # E-postaları gönder
            for email, data in user_tasks.items():
                name = data["name"]
                task_list = data["tasks"]
                
                tasks_html = "".join([
                    f"<li style='margin-bottom:8px;'>"
                    f"<strong style='color:#e2e8f0;'>{t.title}</strong> "
                    f"<span style='color:#94a3b8;font-size:12px;'>(Öncelik: {t.priority})</span>"
                    f"</li>" 
                    for t in task_list
                ])

                content = f"""
                <h2 style="color:#e2e8f0;margin:0 0 16px;font-size:20px;">Yarının Görevleri 📅</h2>
                <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
                    Merhaba {name}, yarın teslim edilmesi gereken <strong>{len(task_list)}</strong> adet göreviniz bulunuyor:
                </p>
                <ul style="color:#94a3b8;line-height:1.6;margin:0 0 24px;padding-left:20px;">
                    {tasks_html}
                </ul>
                <p style="color:#64748b;font-size:13px;margin:16px 0 0;">
                    Planlamanızı yapmak için sisteme giriş yapabilirsiniz. İyi çalışmalar!
                </p>
                """
                await send_email(email, f"Pikseliş — Yarınki Görevler ({len(task_list)})", _base_template(content))
                logger.info(f"✅ Günlük hatırlatıcı gönderildi: {email} ({len(task_list)} görev)")
                
    except Exception as e:
        logger.error(f"❌ Günlük görev hatırlatıcı hatası: {e}")

async def send_hourly_reminders():
    """
    Her 15 dakikada bir çalışır.
    Tam 1 saat sonra (± 15 dakika toleransla) teslim edilecek görevleri hatırlatır.
    """
    logger.info("⏱️ Saatlik görev hatırlatıcı taraması başlatılıyor...")
    try:
        now = datetime.now(timezone.utc)
        # Yaklaşık 1 saat sonrası (45-60 dk arası veya 60-75 dk arası)
        # Çok sık mail atmamak için sadece tam "1 saat kala" olanları yakalamamız lazım.
        # Çalışma aralığı 15 dk olduğu için, [now + 45 dk, now + 60 dk] arasına bakabiliriz.
        target_start = now + timedelta(minutes=45)
        target_end = now + timedelta(minutes=60)

        async with AsyncSessionLocal() as db:
            stmt = select(Task, User).join(User, Task.user_id == User.id).where(
                and_(
                    Task.due_date >= target_start,
                    Task.due_date <= target_end,
                    Task.status != "done",
                    Task.is_deleted == False,
                    User.email.isnot(None),
                    User.is_active == True
                )
            )
            result = await db.execute(stmt)
            tasks = result.all()

            for task, user in tasks:
                # Format saat: 14:30
                due_time = task.due_date.strftime("%H:%M")
                
                content = f"""
                <h2 style="color:#f59e0b;margin:0 0 16px;font-size:20px;">Yaklaşan Görev ⏱️</h2>
                <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
                    Merhaba {user.name}, aşağıdaki görevin teslim saati yaklaşıyor:
                </p>
                <div style="background:#1e293b;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                    <h3 style="color:#e2e8f0;margin:0 0 8px;font-size:16px;">{task.title}</h3>
                    <p style="color:#94a3b8;margin:0;font-size:14px;">
                        Teslim Saati: <strong style="color:#f59e0b;">{due_time}</strong> (Yaklaşık 1 saat kaldı)
                    </p>
                </div>
                """
                await send_email(user.email, f"Pikseliş — Hatırlatma: {task.title}", _base_template(content))
                logger.info(f"✅ Saatlik hatırlatıcı gönderildi: {user.email} (Görev: {task.id})")

    except Exception as e:
        logger.error(f"❌ Saatlik görev hatırlatıcı hatası: {e}")
