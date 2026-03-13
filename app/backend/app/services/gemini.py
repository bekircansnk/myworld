from google import genai
from google.genai import types
from pydantic import BaseModel, Field
import json
import asyncio
from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified

from app.config import settings
from app.ai.personality import get_personality_instruction
from app.ai.prompts import CATEGORIZE_TASK_PROMPT, BREAKDOWN_TASK_PROMPT, MOTIVATION_PROMPT

# Import AsyncSessionLocal inside functions, or globally if setup
# ama cross-import hatası vermesin diye local veya geç dahil edebiliriz
from app.database import AsyncSessionLocal
from app.models.user import User

# Initialize Gemini client
client = genai.Client(api_key=settings.gemini_api_key)

def _get_gemini_client():
    """Returns the initialized Gemini client."""
    return client

# Model Definitions
MODEL_LITE = "gemini-3.1-flash-lite-preview"
MODEL_PRO = "gemini-3.1-pro-preview"
MODEL_IMAGE = "gemini-3.1-flash-image-preview"

async def _log_cost_async(input_tokens: int, output_tokens: int, model_name: str):
    print(f"[COST TRACKING STARTED] In: {input_tokens}, Out: {output_tokens}, Model: {model_name}")
    cost_in = 0.0
    cost_out = 0.0
    
    if "flash-lite" in model_name:
        cost_in = 0.25 / 1000000
        cost_out = 1.50 / 1000000
    elif "flash-image" in model_name:
        cost_in = 0.25 / 1000000
        cost_out = 0.067
    elif "pro-image" in model_name:
        cost_in = 2.0 / 1000000
        cost_out = 0.134
    elif "flash" in model_name and "lite" not in model_name:
        cost_in = 0.50 / 1000000
        cost_out = 3.0 / 1000000
    else: # pro-preview
        cost_in = 2.0 / 1000000
        cost_out = 12.0 / 1000000
        
    usd_added = (input_tokens * cost_in) + (output_tokens * cost_out)
    
    try:
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(User).where(User.id == 1))
            user = res.scalars().first()
            if user:
                settings_dict = dict(user.settings) if getattr(user, "settings", None) else {}
                api_cost = settings_dict.get("api_cost", {"input_tokens": 0, "output_tokens": 0, "total_usd": 0.0})
                if not isinstance(api_cost, dict):
                    api_cost = {"input_tokens": 0, "output_tokens": 0, "total_usd": 0.0}
                
                api_cost["input_tokens"] += input_tokens
                api_cost["output_tokens"] += output_tokens
                api_cost["total_usd"] += usd_added
                
                settings_dict["api_cost"] = api_cost
                user.settings = settings_dict
                flag_modified(user, "settings")
                await db.commit()
                print(f"[COST SAVED] New USD: {api_cost['total_usd']}")
            else:
                print("[COST TRACKING ERROR] User 1 not found")
    except Exception as e:
        import traceback
        print(f"[COST TRACKING DB ERROR] {e}")
        traceback.print_exc()

def log_cost_sync(response, model_name: str):
    """Log API cost from a Gemini response. Works in both sync (threadpool) and async contexts."""
    try:
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            in_tokens = getattr(response.usage_metadata, "prompt_token_count", 0) or 0
            out_tokens = getattr(response.usage_metadata, "candidates_token_count", 0) or 0
            print(f"[COST SYNC] usage_metadata found: In={in_tokens}, Out={out_tokens}, Model={model_name}")
            if in_tokens > 0 or out_tokens > 0:
                try:
                    loop = asyncio.get_running_loop()
                    # We're inside an async context (e.g. called from async endpoint)
                    loop.create_task(_log_cost_async(in_tokens, out_tokens, model_name))
                    print(f"[COST SYNC] Scheduled via create_task")
                except RuntimeError:
                    # No running loop — we're in a sync thread (FastAPI threadpool).
                    # Use asyncio.run() to create a temporary loop.
                    print(f"[COST SYNC] No loop, using asyncio.run()")
                    asyncio.run(_log_cost_async(in_tokens, out_tokens, model_name))
        else:
            print(f"[COST SYNC] response has no usage_metadata")
    except Exception as e:
        import traceback
        print(f"[COST SYNC ERROR] {e}")
        traceback.print_exc()

async def log_cost_awaitable(response, model_name: str):
    """Async version: directly await cost logging from async endpoints."""
    try:
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            in_tokens = getattr(response.usage_metadata, "prompt_token_count", 0) or 0
            out_tokens = getattr(response.usage_metadata, "candidates_token_count", 0) or 0
            print(f"[COST ASYNC] In={in_tokens}, Out={out_tokens}, Model={model_name}")
            if in_tokens > 0 or out_tokens > 0:
                await _log_cost_async(in_tokens, out_tokens, model_name)
    except Exception as e:
        print(f"[COST ASYNC ERROR] {e}")

class IntentClassification(BaseModel):
    intent: str = Field(description="The user's intent. Must be exactly one of: 'STANDARD_CHAT' or 'DEEP_ANALYSIS'")

def classify_intent(message: str) -> str:
    """
    Kullanıcının mesajını analiz ederek hangi modelin kullanılması gerektiğine karar verir.
    """
    try:
        system_instruction = (
            "Sen bir niyet analizatörüsün. Kullanıcının mesajını okuyup ne istediğine karar vereceksin. "
            "Sadece 2 niyet türü olabilir:\\n"
            "1. 'STANDARD_CHAT': Normal sohbet, günlük işler, kısa sorular, özetlemeler, hatırlatmalar, şakalar, sistem durmunu sorma.\\n"
            "2. 'DEEP_ANALYSIS': Çok karmaşık projeler, uzun vadeli ve detaylı stratejik planlamalar, yazılım mimarisi çizimleri, derin hukuki veya bilimsel analiz istekleri.\\n"
            "Kullanıcı resim, fotoğraf veya görsel üretilmesini istese BİLE, bunu STANDARD_CHAT veya DEEP_ANALYSIS olarak algıla. ASLA görsel üretme.\\n"
        )
        
        response = client.models.generate_content(
            model=MODEL_LITE, # Hızlı analiz için Lite modelini kullanıyoruz
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=IntentClassification,
                temperature=0.1 # Düşük sıcaklık, kesin kararlar için
            ),
        )
        
        log_cost_sync(response, MODEL_LITE)
        
        result = json.loads(response.text)
        intent = result.get("intent", "STANDARD_CHAT")
        
        # Validasyon
        if intent not in ["STANDARD_CHAT", "DEEP_ANALYSIS"]:
            return "STANDARD_CHAT"
            
        return intent
    except Exception as e:
        print(f"Intent Classification Error: {e}")
        return "STANDARD_CHAT" # Hata anında varsayılan Lite modeli

from app.ai.prompts import DAY_PLANNING_PROMPT

def generate_chat_response(messages: list, context: str = "", is_day_planning: bool = False) -> str:
    """
    Generates a chat response using Gemini API with intelligent model routing.
    """
    try:
        # 1. Niyet Analizi (Son kullanıcı mesajına göre)
        last_user_message = next((msg.get('content') for msg in reversed(messages) if msg.get('role') == 'user'), "")
        if not last_user_message:
            return "Boş mesaj gönderdiniz."
            
        intent = classify_intent(last_user_message)
        print(f"🧠 AI Router: Tespit Edilen Niyet -> {intent}")

        # 2. İşleme (Routing)
        selected_model = MODEL_PRO if intent == "DEEP_ANALYSIS" or is_day_planning else MODEL_LITE
        print(f"🤖 Metin Motoru Seçildi: {selected_model}")
        
        persona_base = get_personality_instruction()
        
        if is_day_planning:
            from datetime import datetime
            current_date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            planning_instruction = DAY_PLANNING_PROMPT.format(
                current_date=current_date_str, 
                tasks_context=context, 
                user_message=last_user_message
            )
            system_instruction = f"{persona_base}\n\n{planning_instruction}"
        else:
            system_instruction = (
                f"{persona_base}\n\n"
                f"SİSTEM/MÜŞTERİ VERİLERİ (BAĞLAM):\n{context}"
            )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        )
        
        # Formulate the prompt history
        prompt = ""
        for msg in messages:
            role = "Kullanıcı" if msg.get("role") == "user" else "AI"
            prompt += f"{role}: {msg.get('content')}\\n"
            
        prompt += "AI: "

        response = client.models.generate_content(
            model=selected_model,
            contents=prompt,
            config=config,
        )
        
        log_cost_sync(response, selected_model)
        
        return response.text
            
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Genel hata
        return "Üzgünüm, AI servisine erişirken bölgesel bir limit veya API sorunuyla karşılaştım: " + str(e)


from datetime import datetime

def categorize_task(task_text: str, projects_context: str, tasks_context: str = "") -> dict:
    """Yeni eklenen görevi AI ile analiz ederek öncelik, süre, proje ve hedef tarihi tahmin eder."""
    try:
        current_date = datetime.now().isoformat()
        prompt = CATEGORIZE_TASK_PROMPT.format(
            projects_context=projects_context, 
            task_text=task_text,
            tasks_context=tasks_context,
            current_date=current_date
        )
        
        response = client.models.generate_content(
            model=MODEL_LITE, # Hızlı analiz
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            ),
        )
        
        log_cost_sync(response, MODEL_LITE)
        
        result = json.loads(response.text)
        return result
    except Exception as e:
        print(f"Task Categorization Error: {e}")
        return {}


def breakdown_task_with_ai(task_title: str, task_description: str) -> list:
    """Belirli bir görevi alt görevlere böler."""
    try:
        prompt = BREAKDOWN_TASK_PROMPT.format(task_title=task_title, task_description=task_description)
        
        response = client.models.generate_content(
            model=MODEL_LITE,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            ),
        )
        
        log_cost_sync(response, MODEL_LITE)
        
        result = json.loads(response.text)
        return result if isinstance(result, list) else []
    except Exception as e:
        print(f"Task Breakdown Error: {e}")
        return []

def get_dynamic_motivation(time_of_day: str, completed_count: int, pending_count: int) -> str:
    """Zamana ve görev duruma göre kişiselleşmiş Türkçe motivasyon cümlesi üretir."""
    try:
        persona_base = get_personality_instruction()
        system_instruction = f"{persona_base}\\nSen kısacık (1-2 cümle) samimi günlük motivasyon sözü üretiyorsun."
        
        prompt = MOTIVATION_PROMPT.format(
            time_of_day=time_of_day, 
            completed_tasks_count=completed_count, 
            pending_tasks_count=pending_count
        )
        
        response = client.models.generate_content(
            model=MODEL_LITE,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7 # Doğallık ve hafif rastgelelik için
            ),
        )
        
        log_cost_sync(response, MODEL_LITE)
        
        return response.text.strip()
    except Exception as e:
        print(f"Motivation Error: {e}")
        return "Bugün kendi dünyanı yaratabileceğin harika bir gün. 🌍"
