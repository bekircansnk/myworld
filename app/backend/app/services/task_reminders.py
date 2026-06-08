import logging
import pytz
from datetime import datetime, timedelta, timezone
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from app.database import AsyncSessionLocal
from app.config import settings
from app.models.task import Task
from app.models.user import User
from app.models.calendar_event import CalendarEvent
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
                await send_email(email, f"Planla — Yarınki Görevler ({len(task_list)})", _base_template(content))
                logger.info(f"✅ Günlük hatırlatıcı gönderildi: {email} ({len(task_list)} görev)")
                
    except Exception as e:
        logger.error(f"❌ Günlük görev hatırlatıcı hatası: {e}")

async def send_hourly_reminders():
    """
    Her 15 dakikada bir çalışır.
    Kullanıcıların özel hatırlatma sürelerine (settings.email_reminder_offset_minutes) göre 
    yaklaşan görevleri e-posta ile hatırlatır.
    """
    logger.info("⏱️ Dinamik e-posta görev hatırlatıcı taraması başlatılıyor...")
    try:
        now = datetime.now(timezone.utc)
        # En fazla 3 günlük hatırlatma pencerelerini kapsayacak şekilde gelecek görevleri çekelim
        max_offset = timedelta(days=3)
        target_end = now + max_offset

        async with AsyncSessionLocal() as db:
            stmt = select(Task, User).join(User, Task.user_id == User.id).where(
                and_(
                    Task.due_date >= now,
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
                user_settings = user.settings or {}
                # E-posta bildirimleri kapatılmışsa pas geç
                email_notifications_enabled = user_settings.get("email_notifications_enabled", True)
                if not email_notifications_enabled:
                    continue
                
                # Özel offset süresi (dakika olarak), varsayılan 1 gün (1440 dk)
                offset_minutes = int(user_settings.get("email_reminder_offset_minutes", 1440))
                
                # Görevin hatırlatma vakti
                reminder_time = task.due_date - timedelta(minutes=offset_minutes)
                
                # Tolerans: ± 7.5 dakika (Cron her 15 dakikada bir çalıştığı için tam 1 kere tetiklenir)
                time_diff_seconds = (now - reminder_time).total_seconds()
                if abs(time_diff_seconds) <= 7.5 * 60:
                    due_time = task.due_date.strftime("%H:%M")
                    # Süre gösterimi (Örn: "1 saat", "30 dakika", "1 gün")
                    if offset_minutes >= 1440:
                        offset_str = f"{offset_minutes // 1440} gün"
                    elif offset_minutes >= 60:
                        offset_str = f"{offset_minutes // 60} saat"
                    else:
                        offset_str = f"{offset_minutes} dakika"
                    
                    content = f"""
                    <h2 style="color:#f59e0b;margin:0 0 16px;font-size:20px;">Yaklaşan Görev ⏱️</h2>
                    <p style="color:#1a1a1a;line-height:1.6;margin:0 0 16px;">
                        Merhaba {user.name}, aşağıdaki görevinizin teslim saati yaklaşıyor:
                    </p>
                    <div style="background:#f9f8f4;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;border:1px solid #e8e5d8;border-left-width:4px;">
                        <h3 style="color:#1a1a1a;margin:0 0 8px;font-size:16px;">{task.title}</h3>
                        <p style="color:#6b7280;margin:0;font-size:14px;">
                            Teslim Saati: <strong style="color:#f59e0b;">{due_time}</strong> (Yaklaşık {offset_str} kaldı)
                        </p>
                    </div>
                    <div style="text-align:center;margin:18px 0;">
                        <a href="{settings.frontend_url}/tasks" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:10px;font-weight:600;font-size:14px;">
                            Göreve Git
                        </a>
                    </div>
                    """
                    await send_email(user.email, f"Planla — Hatırlatma: {task.title}", _base_template(content))
                    logger.info(f"✅ Saatlik hatırlatıcı gönderildi: {user.email} (Görev: {task.id}, Offset: {offset_str})")

    except Exception as e:
        logger.error(f"❌ Saatlik görev hatırlatıcı hatası: {e}")


async def send_tomorrow_plan_emails():
    """
    Her akşam saat 20:00'de çalışır.
    Kullanıcılara yarınki planlarını (etkinlik ve görevler) şık bir zaman tüneli olarak e-posta ile gönderir.
    """
    logger.info("📅 Günlük yarının planı özet e-posta taraması başlatılıyor...")
    try:
        async with AsyncSessionLocal() as db:
            # Tüm aktif ve e-postası olan kullanıcıları al
            stmt = select(User).where(
                and_(
                    User.email.isnot(None),
                    User.is_active == True
                )
            )
            users_res = await db.execute(stmt)
            users = users_res.scalars().all()

            for user in users:
                user_settings = user.settings or {}
                # Günlük plan özeti kapatılmışsa gönderme
                daily_summary_enabled = user_settings.get("daily_summary_enabled", True)
                if not daily_summary_enabled:
                    continue

                # Kullanıcının zaman diliminde yarını hesapla
                tz_name = user.timezone or "Europe/Istanbul"
                try:
                    user_tz = pytz.timezone(tz_name)
                except Exception:
                    user_tz = pytz.timezone("Europe/Istanbul")

                user_now = datetime.now(user_tz)
                tomorrow = user_now + timedelta(days=1)
                
                # Yarının yerel saatle 00:00:00 ile 23:59:59 arası
                tomorrow_start = user_tz.localize(datetime(tomorrow.year, tomorrow.month, tomorrow.day, 0, 0, 0))
                tomorrow_end = user_tz.localize(datetime(tomorrow.year, tomorrow.month, tomorrow.day, 23, 59, 59, 999999))

                # Yarınki etkinlikleri çek
                events_stmt = select(CalendarEvent).where(
                    and_(
                        CalendarEvent.user_id == user.id,
                        CalendarEvent.is_deleted == False,
                        CalendarEvent.start_time >= tomorrow_start,
                        CalendarEvent.start_time <= tomorrow_end
                    )
                ).order_by(CalendarEvent.start_time.asc())
                events_res = await db.execute(events_stmt)
                events = events_res.scalars().all()

                # Yarınki tamamlanmamış görevleri çek
                tasks_stmt = select(Task).where(
                    and_(
                        Task.user_id == user.id,
                        Task.is_deleted == False,
                        Task.status != "done",
                        Task.due_date >= tomorrow_start,
                        Task.due_date <= tomorrow_end
                    )
                ).order_by(Task.due_date.asc())
                tasks_res = await db.execute(tasks_stmt)
                tasks = tasks_res.scalars().all()

                # Eğer yarın hiç etkinlik veya görev yoksa mail atma (boş mail atmamak için)
                if not events and not tasks:
                    continue

                # HTML Şablonunu Oluştur
                tomorrow_date_str = tomorrow.strftime("%d.%m.%Y")
                
                # 1. Takvim Etkinlikleri HTML
                events_html = ""
                if events:
                    events_html += "<div style='margin-bottom: 24px;'>"
                    events_html += "<h3 style='color:#1a1a1a;border-bottom:2px solid #f59e0b;padding-bottom:6px;font-size:16px;'>📅 Takvim Etkinleriniz</h3>"
                    events_html += "<table style='width:100%; border-collapse: collapse; margin-top: 12px;'>"
                    for ev in events:
                        # Yerel saate çevirerek göster
                        ev_start_local = ev.start_time.astimezone(user_tz)
                        ev_end_local = ev.end_time.astimezone(user_tz)
                        
                        time_str = "Tüm Gün" if ev.is_all_day else f"{ev_start_local.strftime('%H:%M')} - {ev_end_local.strftime('%H:%M')}"
                        desc_html = f"<div style='color:#6b7280;font-size:12px;margin-top:2px;'>{ev.description}</div>" if ev.description else ""
                        
                        events_html += f"""
                        <tr style='border-bottom: 1px solid #f0ede1;'>
                            <td style='padding:10px 0;width:100px;font-weight:700;color:#f59e0b;font-size:13px;vertical-align:top;'>{time_str}</td>
                            <td style='padding:10px 0;color:#1a1a1a;font-size:14px;vertical-align:top;'>
                                <div style='font-weight:600;'>{ev.title}</div>
                                {desc_html}
                            </td>
                        </tr>
                        """
                    events_html += "</table></div>"
                else:
                    events_html += f"""
                    <div style='margin-bottom: 24px;'>
                        <h3 style='color:#1a1a1a;border-bottom:2px solid #f59e0b;padding-bottom:6px;font-size:16px;'>📅 Takvim Etkinleriniz</h3>
                        <p style='color:#9ca3af;font-size:13px;font-style:italic;'>Yarın için planlanmış bir etkinlik bulunmuyor.</p>
                    </div>
                    """

                # 2. Görevler HTML
                tasks_html = ""
                if tasks:
                    tasks_html += "<div style='margin-bottom: 24px;'>"
                    tasks_html += "<h3 style='color:#1a1a1a;border-bottom:2px solid #1a1a1a;padding-bottom:6px;font-size:16px;'>📋 Yarın Teslim Edilecek Görevler</h3>"
                    tasks_html += "<ul style='padding-left: 20px; margin-top: 12px; color:#1a1a1a; font-size:14px; line-height: 1.6;'>"
                    for t in tasks:
                        t_due_local = t.due_date.astimezone(user_tz)
                        due_str = f" ({t_due_local.strftime('%H:%M')})" if t.due_date else ""
                        priority_badge = ""
                        if t.priority == "urgent":
                            priority_badge = " <span style='color:#ef4444;font-size:11px;font-weight:700;'>[ACİL]</span>"
                        elif t.priority == "low":
                            priority_badge = " <span style='color:#9ca3af;font-size:11px;'>[Düşük]</span>"
                            
                        tasks_html += f"""
                        <li style='margin-bottom: 8px;'>
                            <strong>{t.title}</strong>{due_str}{priority_badge}
                        </li>
                        """
                    tasks_html += "</ul></div>"

                content = f"""
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="background: #fef9ec; color: #d97706; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #fef3c7;">GÜNLÜK PLAN ÖZETİ</span>
                </div>
                <h2 style="color:#1a1a1a;margin:0 0 8px;font-size:20px;text-align:center;">Yarın Sizi Neler Bekliyor? 🚀</h2>
                <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;text-align:center;font-size:14px;">
                    Merhaba {user.name}, <strong>{tomorrow_date_str}</strong> günü için hazırladığınız plan aşağıdadır:
                </p>
                
                {events_html}
                {tasks_html}
                
                <div style="text-align:center;margin:28px 0 10px;">
                    <a href="{settings.frontend_url}/calendar" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:10px;font-weight:700;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                        Takvim & Paneli Aç ↗
                    </a>
                </div>
                """
                
                await send_email(user.email, f"Planla — Yarının Gün Planı Özeti ({tomorrow_date_str})", _base_template(content))
                logger.info(f"✅ Günlük plan özeti e-postası gönderildi: {user.email}")
                
    except Exception as e:
        logger.error(f"❌ Günlük plan özeti gönderim hatası: {e}")
