from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta
from app.models.task import Task
from app.models.report import DailyReport
from app.services.gemini import generate_chat_response
from app.services.telegram import send_telegram_message

MOCK_USER_ID = 1

async def generate_daily_report(db: AsyncSession, target_date: date = None) -> DailyReport:
    """Belirtilen gün (veya bugün) için veritabanından biten işleri tarar, AI ile yorumlar ve Rapor oluşturur."""
    if target_date is None:
        target_date = date.today()

    # Eğer o güne ait rapor zaten varsa ondan dön
    query = select(DailyReport).where(DailyReport.user_id == MOCK_USER_ID, DailyReport.report_date == target_date)
    result = await db.execute(query)
    existing_report = result.scalars().first()
    if existing_report:
        return existing_report

    # O gün oluşturulan görevler
    # SQLite / Postgres date filtreleme için basit gün kontrolü
    # Not: Gerçekte created_at.cast(Date) == target_date sorgusu yapılır
    tasks_query = select(Task).where(Task.user_id == MOCK_USER_ID)
    all_tasks = (await db.execute(tasks_query)).scalars().all()
    
    # Python seviyesi filtreleme (Mock)
    today_added = [t for t in all_tasks if t.created_at and t.created_at.date() == target_date]
    today_completed = [t for t in all_tasks if t.completed_at and t.completed_at.date() == target_date and t.status == "done"]
    
    total_minutes = sum([t.actual_minutes for t in today_completed if t.actual_minutes]) or 0

    # Yapay Zekadan Yorum İste (AI Sentezi)
    completed_titles = ", ".join([f"'{t.title}'" for t in today_completed]) if today_completed else "Hiçbir şey bitirilmedi"
    prompt = f"""
    Bugün Kullanıcı şu görevleri tamamladı: {completed_titles}.
    Toplam çalışma süresi yaklaşık: {total_minutes} dakika.
    Bugün eklenen yeni görev sayısı: {len(today_added)}.
    
    Kullanıcıya samimi, cesaretlendirici, maksimum 2-3 cümlelik bir "Günün Özeti" raporu yorumu yaz.
    Sadece özeti / motivasyonu dön. Markdown olabilir.
    """
    
    ai_summary = "İyi bir gündü, yarın daha da harika olacak!"
    try:
        if today_completed or today_added:
             ai_summary = generate_chat_response([{"role": "user", "parts": prompt}], "Sen My World kullanıcısına günlük performansını özetleyen asistanısın.")
    except Exception as e:
        print("AI Review Error:", e)

    # Veritabanına Raporu Kaydetme
    new_report = DailyReport(
        user_id=MOCK_USER_ID,
        report_date=target_date,
        tasks_completed=len(today_completed),
        tasks_added=len(today_added),
        total_work_minutes=total_minutes,
        ai_summary=ai_summary,
        mood_score=8  # Mock
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    # Telegram Entegrasyonu: Kullanıcıya Gece Raporunu Gönder
    msg = f"🌙 <b>Günün Özeti ({target_date})</b>\n\n"
    msg += f"✅ Biten Görev: {len(today_completed)}\n"
    msg += f"➕ Yeni Eklenen: {len(today_added)}\n"
    msg += f"⏱ Toplam Odak: {total_minutes} dk\n\n"
    msg += f"💡 <i>AI Yorumu:</i> {ai_summary}"
    
    await send_telegram_message(msg)

    return new_report
