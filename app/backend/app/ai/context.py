from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timezone, timedelta
from app.models.task import Task
from app.models.project import Project
from app.models.note import Note
from app.models.calendar_event import CalendarEvent
from app.models.user import User
from app.models.chat_session import ChatSession
from app.services.location_service import utc_to_local, get_current_time_for_user, get_user_timezone
from app.services.prayer_times_service import get_prayer_times

async def build_system_context(db: AsyncSession, user_id: int) -> str:
    """
    Kullanıcının aktif proje, görev ve notlarını veritabanından çekip
    LLM prompuna yedirilecek tek bir string (bağlam/context) haline getirir.
    Tüm görevler dahil edilir: aktif, tamamlanmış, alt görevler.
    """
    # Projeler
    proj_result = await db.execute(
        select(Project).filter(Project.user_id == user_id, Project.is_active == True)
    )
    projects = proj_result.scalars().all()
    project_map = {p.id: p.name for p in projects}
    
    # TÜM görevler (tamamlanmış dahil — AI tam resmi görsün)
    all_tasks_result = await db.execute(
        select(Task).filter(Task.user_id == user_id).order_by(Task.created_at.desc())
    )
    all_tasks = all_tasks_result.scalars().all()
    
    # Görevleri kategorize et
    active_tasks = [t for t in all_tasks if t.status != "done" and not t.parent_task_id]
    done_tasks = [t for t in all_tasks if t.status == "done" and not t.parent_task_id]
    subtasks = [t for t in all_tasks if t.parent_task_id]
    
    # Notlar
    note_result = await db.execute(
        select(Note).filter(Note.user_id == user_id).order_by(Note.created_at.desc()).limit(15)
    )
    notes = note_result.scalars().all()
    
    # İstatistikler
    total_active = len(active_tasks)
    total_done = len(done_tasks)
    total_subtasks = len(subtasks)
    
    # Kullanıcı bilgileri
    user_res = await db.execute(select(User).filter(User.id == user_id))
    user = user_res.scalars().first()
    
    tz_str = get_user_timezone(user)
    local_time = get_current_time_for_user(user)
    
    # Son Sohbet Geçmişi
    sessions_res = await db.execute(
        select(ChatSession).filter(ChatSession.user_id == user_id, ChatSession.is_active == True)
        .order_by(ChatSession.updated_at.desc()).limit(3)
    )
    last_sessions = sessions_res.scalars().all()
    
    # Ezan Vakitleri
    location = user.location if getattr(user, "location", None) else {"city": "Istanbul", "district": "Basaksehir", "country": "Turkey"}
    city_str = location.get("city", "Istanbul")
    country_str = location.get("country", "Turkey")
    prayer_times = get_prayer_times(local_time.date(), city_str, country_str)

    # Bağlam oluştur
    context = "=== KONUM VE KİŞİSEL BİLGİLER ===\n"
    context += f"📍 Konum: {city_str}, {location.get('district', '')}, {country_str}\n"
    context += f"🕐 Yerel Saat: {local_time.strftime('%d %B %Y %A, %H:%M')} ({tz_str})\n"
    context += "🕌 Bugünün Ezan Vakitleri:\n"
    for name, time_ in prayer_times.items():
        if name == 'aksam':
            context += f"  - {name.capitalize()} (İftar): {time_}\n"
        else:
            context += f"  - {name.capitalize()}: {time_}\n"
            
    context += "\n=== SON SOHBET GEÇMİŞİ ===\n"
    if not last_sessions:
        context += "- Henüz geçmiş yok.\n"
    for s in last_sessions:
        if s.updated_at:
            t = utc_to_local(s.updated_at, tz_str).strftime('%d/%m %H:%M')
            context += f"- [{t}] \"{s.title}\" → Son Mesaj: {s.last_user_message or ''}\n"

    context += "\n=== SİSTEM DURUMU ===\n"
    context += f"Toplam Aktif Görev: {total_active} | Tamamlanmış: {total_done} | Alt Görev: {total_subtasks}\n\n"
    
    # Takvim Etkinlikleri
    today_start = local_time.replace(hour=0, minute=0, second=0).astimezone(timezone.utc)
    period_start = today_start - timedelta(days=7)
    period_end = today_start + timedelta(days=2)
    
    event_result = await db.execute(
        select(CalendarEvent)
        .filter(CalendarEvent.user_id == user_id,
                CalendarEvent.start_time >= period_start,
                CalendarEvent.start_time <= period_end)
        .order_by(CalendarEvent.start_time)
    )
    events = event_result.scalars().all()
    
    context += "=== TAKVİM ETKİNLİKLERİ (SON 7 GÜN + BUGÜN + YARIN) ===\n"
    context += "⚠️ AŞAĞIDAKİ ETKİNLİKLER ZATEN TAKVİMDE VAR. Benzer veya aynı etkinlik OLUŞTURMA! (Düzenleme veya silme işlemi için [ID: X] kullanın)\n"
    if not events:
        context += "- Yakın zamanda etkinlik yok.\n"
    for e in events:
        local_start = utc_to_local(e.start_time, tz_str)
        local_end = utc_to_local(e.end_time, tz_str) if e.end_time else None
        time_str = local_start.strftime('%d/%m %H:%M')
        end_str = local_end.strftime('%H:%M') if local_end else "?"
        task_ref = f" (Görev ID:{e.task_id})" if e.task_id else ""
        context += f"- [ID:{e.id}] [{time_str}-{end_str}] {e.title}{task_ref}\n"
    context += "\n"
    
    # Projeler
    context += "=== PROJELER / FİRMALAR ===\n"
    if not projects:
        context += "- Henüz proje yok.\n"
    for p in projects:
        project_tasks = [t for t in active_tasks if t.project_id == p.id]
        project_done = [t for t in done_tasks if t.project_id == p.id]
        context += f"- ID:{p.id} | {p.name} | Aktif: {len(project_tasks)} görev, Tamamlanmış: {len(project_done)}\n"
    
    # Projesiz görevler
    homeless_tasks = [t for t in active_tasks if not t.project_id]
    if homeless_tasks:
        context += f"- Projesiz Görevler: {len(homeless_tasks)} adet\n"
    
    # Aktif Görevler (detaylı)
    context += "\n=== AKTİF GÖREVLER ===\n"
    if not active_tasks:
        context += "- Henüz aktif görev yok.\n"
    for t in active_tasks[:30]:  # Max 30 görev
        proj_name = project_map.get(t.project_id, "Genel")
        due_str = ""
        if t.due_date:
            due_str = f", Son Tarih: {t.due_date.strftime('%d/%m/%Y')}"
        est_str = f", ~{t.estimated_minutes}dk" if t.estimated_minutes else ""
        
        # Bu görevin alt görevleri
        task_subtasks = [s for s in subtasks if s.parent_task_id == t.id]
        sub_str = ""
        if task_subtasks:
            done_subs = len([s for s in task_subtasks if s.status == 'done'])
            sub_str = f", Alt Görevler: {done_subs}/{len(task_subtasks)}"
        
        context += f"- ID:{t.id} [{proj_name}] {t.title} (Durum: {t.status}, Öncelik: {t.priority}{due_str}{est_str}{sub_str})\n"
    
    # Son tamamlanan görevler (AI ilerlemeyi görsün)
    context += "\n=== SON TAMAMLANAN GÖREVLER ===\n"
    if not done_tasks:
        context += "- Henüz tamamlanan görev yok.\n"
    for t in done_tasks[:10]:  # Son 10 tamamlanan
        proj_name = project_map.get(t.project_id, "Genel")
        completed_str = ""
        if t.completed_at:
            completed_str = f", Tamamlandı: {t.completed_at.strftime('%d/%m %H:%M')}"
        context += f"- ID:{t.id} [{proj_name}] {t.title}{completed_str}\n"
    
    # Notlar
    context += "\n=== SON NOTLAR ===\n"
    if not notes:
        context += "- Henüz not yok.\n"
    for n in notes:
        content_preview = n.content.replace("\n", " ")[:80]
        source_str = f"({n.source})" if n.source else ""
        context += f"- ID:{n.id} {source_str} {content_preview}...\n"
        
    return context
