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
    """Sabah 12:00'de çalışır, günün özetini ve ilk planı sunar."""
    async with AsyncSessionLocal() as db:
        try:
            MOCK_USER_ID = 1
            # Bekleyen görevleri getir
            result = await db.execute(select(Task).filter(Task.user_id == MOCK_USER_ID, Task.status != "done"))
            tasks = result.scalars().all()
            task_list = "\n".join([f"- {t.title} ({t.priority})" for t in tasks[:5]]) or "Bekleyen görev yok."
            
            instruction = "Şu an sabah saati. Kullanıcı güne yeni başlıyor. Bekleyen görevlerine bakarak onu güne enerjik başlat. 1-2 cümle."
            msg = _generate_proactive_text(f"Bekleyen Görevler:\n{task_list}", instruction)
            
            await _send_proactive_message(msg, "MORNING_GREETING")
        except Exception as e:
            logger.error(f"morning_greeting hatası: {e}")

async def task_staleness_check():
    """Öğleden sonraları çalışır, çok uzun süredir bekleyen görevleri hatırlatır."""
    async with AsyncSessionLocal() as db:
        try:
            MOCK_USER_ID = 1
            # Basitlik için tüm todo görevlerini alıyoruz, gerçekte created_at'e göre filtre konulabilir
            result = await db.execute(select(Task).filter(Task.user_id == MOCK_USER_ID, Task.status == "todo"))
            tasks = result.scalars().all()
            if not tasks:
                return
                
            stale_task = tasks[0] # İlkini seçelim örnek olarak
            context = f"Eski Görev: {stale_task.title}"
            instruction = "Bu görev uzun süredir bekliyor. Kullanıcıya bunu küçük, başarılabilir bir ilk adımla hatırlat. Yargılama, motive et."
            
            msg = _generate_proactive_text(context, instruction)
            await _send_proactive_message(msg, "STALENESS_WARNING")
        except Exception as e:
            logger.error(f"task_staleness_check hatası: {e}")

async def evening_summary():
    """Akşam saatlerinde çalışır, günü özetler."""
    async with AsyncSessionLocal() as db:
        try:
            MOCK_USER_ID = 1
            # Bugün bitenleri bulmak için normalde completion_time'a bakılır
            # Şimdilik örnek context
            context = "Bugün biten görevler ve kalan enerjiyi toparlama zamanı."
            instruction = "Kullanıcıya günün yorgunluğunu atması için dinlenmesini tavsiye et. Kısa ve samimi bir kapanış yap."
            
            msg = _generate_proactive_text(context, instruction)
            await _send_proactive_message(msg, "EVENING_SUMMARY")
        except Exception as e:
            logger.error(f"evening_summary hatası: {e}")
