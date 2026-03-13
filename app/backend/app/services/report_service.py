from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta
from app.models.task import Task
from app.models.report import DailyReport
from app.services.gemini import generate_chat_response
from app.services.telegram import send_telegram_message

MOCK_USER_ID = 1

async def generate_daily_report(db: AsyncSession, user_id: int, target_date: date = None) -> DailyReport:
    """Belirli bir gün için kullanıcının başarı/rapor özetini oluşturur."""
    if target_date is None:
        target_date = date.today()

    # Eğer o güne ait rapor zaten varsa ondan dön
    query = select(DailyReport).where(DailyReport.user_id == user_id, DailyReport.report_date == target_date)
    result = await db.execute(query)
    existing_report = result.scalars().first()
    
    # 2. O günkü tamamlanmış görevleri seç
    # Geliştirme notu: `completed_at` sahası olmadığı için status üzerinden tahmin yürütüyoruz veya 
    # güncellenme tarihine bakılabilir. Şimdilik basitleştirilmiş bir sorgu:
    tasks_query = select(Task).where(Task.user_id == user_id)
    tasks_res = await db.execute(tasks_query)
    all_tasks = tasks_res.scalars().all()
    
    completed_tasks = [t for t in all_tasks if t.status == 'done']
    pending_tasks = [t for t in all_tasks if t.status != 'done']
    
    # 3. Odak süresi / Timer hesaplaması (Yoksa opsiyonel varsayıyoruz)
    # query = select(func.sum(TimerSession.duration_minutes)).where(...)
    total_focus_minutes = 0 # Placeholder
    
    # 4. AI'dan analiz iste:
    # This function is not defined in the original document, assuming it's a placeholder or needs to be added.
    # For now, we'll use a mock or adapt the existing AI summary logic.
    
    # Adapting existing AI summary logic for the new structure
    today_added = [t for t in all_tasks if t.created_at and t.created_at.date() == target_date] # Re-introduce for AI prompt
    today_completed = [t for t in all_tasks if t.completed_at and t.completed_at.date() == target_date and t.status == "done"] # Re-introduce for AI prompt
    
    total_minutes_for_ai = sum([t.actual_minutes for t in today_completed if t.actual_minutes]) or 0

    completed_titles = ", ".join([f"'{t.title}'" for t in today_completed]) if today_completed else "Hiçbir şey bitirilmedi"
    prompt = f"""
    Bugün Kullanıcı şu görevleri tamamladı: {completed_titles}.
    Toplam çalışma süresi yaklaşık: {total_minutes_for_ai} dakika.
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
