import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.chat_message import ChatMessage
from app.models.ai_memory import AIMemory
from app.services.gemini import client, get_personality_instruction, MODEL_LITE
from google.genai import types

logger = logging.getLogger(__name__)

async def generate_daily_summary():
    """Günün sonundaki chat loglarını okur ve kısa bir AIMemory özetine dönüştürür."""
    async with AsyncSessionLocal() as db:
        try:
            MOCK_USER_ID = 1
            yesterday_start = datetime.now(timezone.utc) - timedelta(days=1)
            
            # Son 24 saatin mesajlarını al
            query = select(ChatMessage).where(
                ChatMessage.user_id == MOCK_USER_ID,
                ChatMessage.created_at >= yesterday_start
            ).order_by(ChatMessage.created_at.asc())
            
            result = await db.execute(query)
            messages = result.scalars().all()
            
            if not messages:
                logger.info("Son 24 saatte incelenecek mesaj bulunamadı.")
                return

            chat_text = "\n".join([f"{m.role.upper()}: {m.content}" for m in messages])
            
            instruction = "Sen bir hafıza özetleyicisin. Kullanıcının son 24 saatteki diyaloglarını okuyup, önemli kararları, ruh halini ve yarım kalan ana konuları 3-4 cümleyle özetle. Gereksiz detayları atla."
            persona_base = get_personality_instruction()
            
            system_instruction = f"{persona_base}\n\nTALİMAT:\n{instruction}"
            
            response = client.models.generate_content(
                model=MODEL_LITE,
                contents=f"GÜNLÜK SOHBET GEÇMİŞİ:\n{chat_text}",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.3, # Daha analitik bir ton için düşük sıcaklık
                ),
            )
            
            summary_text = response.text.strip()
            
            # AIMemory tablosuna kaydet
            memory = AIMemory(
                user_id=MOCK_USER_ID,
                category="daily_summary",
                content=summary_text,
                extracted_from="chat_history",
                importance=3
            )
            db.add(memory)
            await db.commit()
            
            logger.info(f"✅ Gecelik Özet çıkarıldı ({len(messages)} mesaj incelendi)")

        except Exception as e:
            logger.error(f"Gecelik özet çıkarma hatası: {e}")

async def generate_weekly_synthesis():
    """Haftalık hafıza sentezi."""
    async with AsyncSessionLocal() as db:
        try:
            MOCK_USER_ID = 1
            last_week = datetime.now(timezone.utc) - timedelta(days=7)
            
            query = select(AIMemory).where(
                AIMemory.user_id == MOCK_USER_ID,
                AIMemory.category == "daily_summary",
                AIMemory.created_at >= last_week
            ).order_by(AIMemory.created_at.asc())
            
            result = await db.execute(query)
            summaries = result.scalars().all()
            
            if not summaries:
                logger.info("Sentezlenecek haftalık özet bulunamadı.")
                return

            summary_text = "\n\n".join([f"GÜN {i+1}: {s.content}" for i, s in enumerate(summaries)])
            
            instruction = "Sen bir haftalık sentezleyicisin. Kullanıcının son 1 haftalık günlük özetlerini okuyup genel bir değerlendirme (Haftalık Sentez) yap. Nelere odaklandı, nerede zorlandı, ne başardı? 4-5 cümle."
            persona_base = get_personality_instruction()
            
            system_instruction = f"{persona_base}\n\nTALİMAT:\n{instruction}"
            
            response = client.models.generate_content(
                model=MODEL_LITE,
                contents=f"HAFTALIK GÜNLÜK ÖZETLER:\n{summary_text}",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.4,
                ),
            )
            
            synthesis_text = response.text.strip()
            
            memory = AIMemory(
                user_id=MOCK_USER_ID,
                category="weekly_synthesis",
                content=synthesis_text,
                extracted_from="daily_summaries",
                importance=5
            )
            db.add(memory)
            await db.commit()
            
            logger.info(f"✅ Haftalık Sentez çıkarıldı.")

        except Exception as e:
            logger.error(f"Haftalık sentez çıkarma hatası: {e}")
