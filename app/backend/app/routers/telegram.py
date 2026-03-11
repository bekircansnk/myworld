from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.services.telegram import send_telegram_message
from app.services.gemini import generate_chat_response, categorize_task
from app.models.task import Task
from app.models.project import Project

router = APIRouter()
MOCK_USER_ID = 1

@router.post("/webhook")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Faz 8: Telegram bot webhook alıcısı."""
    try:
        data = await request.json()
        if "message" not in data:
            return {"status": "ok"}
            
        message = data["message"]
        chat_id = str(message.get("chat", {}).get("id", ""))
        text = message.get("text", "")
        
        if not text:
             return {"status": "ok"}
             
        # Basit komutlar
        if text.startswith("/start"):
             await send_telegram_message("👋 Merhaba! Ben My World AI asistanın. Sisteme bağlanmak için hazırım.", chat_id)
             return {"status": "ok"}
             
        if text.startswith("/gorevler"):
             result = await db.execute(select(Task).where(Task.user_id == MOCK_USER_ID, Task.status != "done"))
             tasks = result.scalars().all()
             if not tasks:
                 await send_telegram_message("Şu an bekleyen görevin yok! Harikasın.", chat_id)
             else:
                 msg = "📋 <b>Aktif Görevlerin:</b>\\n\\n"
                 for t in tasks:
                     msg += f"- {t.title} ({t.priority})\\n"
                 await send_telegram_message(msg, chat_id)
             return {"status": "ok"}

        # NLP (Doğal Dil Görev/Not yönlendirmesi)
        # Eğer mesaj uzunsa veya normal konuşmaysa Gemini reponse üret veya görev kaydet
        if text.startswith("not:"):
             from app.models.note import Note
             note_content = text.replace("not:", "").strip()
             new_note = Note(user_id=MOCK_USER_ID, content=note_content, source="telegram")
             db.add(new_note)
             await db.commit()
             await send_telegram_message("✅ Not başarıyla sisteme kaydedildi.", chat_id)
        elif text.startswith("görev:"):
             task_title = text.replace("görev:", "").strip()
             
             # Proje tahmini için
             proj_result = await db.execute(select(Project).filter(Project.user_id == MOCK_USER_ID, Project.is_active == True))
             projects = proj_result.scalars().all()
             project_context = "\\n".join([f"- ID: {p.id}, İsim: {p.name}" for p in projects])

             ai_data = categorize_task(task_title, project_context)
             
             new_task = Task(
                 user_id=MOCK_USER_ID,
                 title=task_title,
                 project_id=ai_data.get("project_id") if ai_data else None,
                 priority=ai_data.get("priority", "normal") if ai_data else "normal",
                 estimated_minutes=ai_data.get("estimated_minutes") if ai_data else None
             )
             db.add(new_task)
             await db.commit()
             await send_telegram_message(f"✅ Yeni görev oluşturuldu:\\n<b>{task_title}</b>", chat_id)
        else:
             # Eğer komut değilse klasik Chat Response
             # Sistem promptuna sadece kısa bot formatını geçiyoruz şimdilik. (Veya phase 4 te yazılan kullanılabilir)
             reply = generate_chat_response([{"role": "user", "parts": text}], "Sen telegram üzerinden konuşan My World Botusun. Kısa, samimi chat tarzı cevaplar ver.")
             await send_telegram_message(reply, chat_id)
             
    except Exception as e:
        print("Webhook Error:", e)
        
    return {"status": "ok"}
