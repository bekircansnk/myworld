import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.proactive import morning_greeting, task_staleness_check, evening_summary
from app.services.memory_service import generate_daily_summary, generate_weekly_synthesis
from app.services.task_reminders import send_daily_reminders, send_hourly_reminders

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

def start_scheduler():
    """APScheduler başlatır ve proaktif AI görevlerini tanımlar."""
    
    # 0. Günlük Görev Hatırlatıcı (Her sabah 08:00)
    scheduler.add_job(
        send_daily_reminders,
        CronTrigger(hour=8, minute=0),
        id="send_daily_reminders",
        replace_existing=True
    )
    
    # 0.1 Saatlik Görev Hatırlatıcı (Her 15 dakikada bir kontrol et, 1 saat kalmışsa yolla)
    scheduler.add_job(
        send_hourly_reminders,
        CronTrigger(minute='*/15'),
        id="send_hourly_reminders",
        replace_existing=True
    )

    # 1. Sabah Karşılama (Her gün 12:00'de Kullanıcının uyanma rutinine göre)
    scheduler.add_job(
        morning_greeting,
        CronTrigger(hour=12, minute=0),
        id="morning_greeting",
        replace_existing=True
    )
    
    # 2. Görev Bayatlığı / Motivasyon (Öğleden sonra 15:00)
    scheduler.add_job(
        task_staleness_check,
        CronTrigger(hour=15, minute=0),
        id="task_staleness",
        replace_existing=True
    )
    
    # 3. Akşam Kapanış (Her gün 21:00)
    scheduler.add_job(
        evening_summary,
        CronTrigger(hour=21, minute=0),
        id="evening_summary",
        replace_existing=True
    )

    # 4. Günlük Hafıza Özeti (Gece 03:00)
    scheduler.add_job(
        generate_daily_summary,
        CronTrigger(hour=3, minute=0),
        id="daily_summary",
        replace_existing=True
    )

    # 5. Haftalık Sentez (Pazar Gece 04:00)
    scheduler.add_job(
        generate_weekly_synthesis,
        CronTrigger(day_of_week='sun', hour=4, minute=0),
        id="weekly_synthesis",
        replace_existing=True
    )

    scheduler.start()
    logger.info("✅ APScheduler başlatıldı. Görev hatırlatıcıları ve AI görevleri aktif.")

def shutdown_scheduler():
    """APScheduler durdurur."""
    scheduler.shutdown()
    logger.info("🛑 APScheduler durduruldu.")
