import logging
import json
from datetime import datetime, timezone
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.task import Task
from app.models.user import User
from app.routers.websocket import manager
from app.services.gemini import client, MODEL_LITE, get_personality_instruction
from google.genai import types

logger = logging.getLogger(__name__)

async def _send_proactive_message(message: str, action: str = "NOTIFICATION"):
    """WebSocket üzerinden UI'a proaktif mesaj gönderir."""
    payload = {
        "type": "PROACTIVE_AI_MESSAGE",
        "action": action,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await manager.broadcast(json.dumps(payload))
    logger.info(f"Proaktif mesaj gönderildi: {message[:50]}...")

def _generate_proactive_text(context: str, instruction: str) -> str:
    """Gemini kullanarak proaktif mesaj metni üretir."""
    try:
        persona_base = get_personality_instruction()
        system_instruction = f"{persona_base}\n\nPROAKTİF GÖREV TALİMATI:\n{instruction}"
        
        response = client.models.generate_content(
            model=MODEL_LITE,
            contents=f"Bağlam:\n{context}\n\nLütfen bu bağlama göre kısa, motive edici ve Bekircan'a uygun proaktif bir mesaj üret.",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Proaktif mesaj üretme hatası: {e}")
        return "Günaydın Bekir! Bugün harika işler başaracağız."

async def morning_greeting():
    """Sabah 09:00'da çalışır (başlangıç saati), günün özetini sunar."""
    async with AsyncSessionLocal() as db:
        try:
            # Tüm aktif kullanıcıları al
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            for user in users:
                # Bekleyen görevleri getir
                task_res = await db.execute(select(Task).filter(Task.user_id == user.id, Task.status != "done"))
                tasks = task_res.scalars().all()
                task_list = "\n".join([f"- {t.title} ({t.priority})" for t in tasks[:5]]) or "Bekleyen görev yok."
                
                instruction = f"Şu an sabah saati. {user.name} güne yeni başlıyor. Bekleyen görevlerine bakarak onu güne enerjik başlat. 1-2 cümle."
                msg = _generate_proactive_text(f"Bekleyen Görevler:\n{task_list}", instruction)
                
                # Sadece WebSocket bağlantısı varsa (manager içinde client varsa) broadcast yapılır ama burada user_id bazlı filtreleme yok manager'da şu an.
                # Şimdilik global broadcast yapıyoruz ama mesaj içeriği kişisel. (İleride manager.send_to_user yapılır)
                await _send_proactive_message(msg, "MORNING_GREETING")
        except Exception as e:
            logger.error(f"morning_greeting hatası: {e}")

async def task_staleness_check():
    """Öğleden sonraları çalışır, bekleyen görevleri hatırlatır."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            for user in users:
                task_res = await db.execute(select(Task).filter(Task.user_id == user.id, Task.status == "todo"))
                tasks = task_res.scalars().all()
                if not tasks:
                    continue
                    
                stale_task = tasks[0]
                context = f"Kullanıcı: {user.name}, Eski Görev: {stale_task.title}"
                instruction = f"{user.name} bu görevi uzun süredir bekletiyor. Onu motive ederek hatırlat."
                
                msg = _generate_proactive_text(context, instruction)
                await _send_proactive_message(msg, "STALENESS_WARNING")
        except Exception as e:
            logger.error(f"task_staleness_check hatası: {e}")

async def evening_summary():
    """Akşam saatlerinde çalışır, günü özetler."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            for user in users:
                context = f"Kullanıcı: {user.name}. Gün bitti, toparlanma zamanı."
                instruction = f"{user.name}'a günün yorgunluğunu atması için dinlenmesini tavsiye et. Kısa ve samimi."
                
                msg = _generate_proactive_text(context, instruction)
                await _send_proactive_message(msg, "EVENING_SUMMARY")
        except Exception as e:
            logger.error(f"evening_summary hatası: {e}")
