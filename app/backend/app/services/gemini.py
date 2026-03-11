from google import genai
from google.genai import types
from pydantic import BaseModel, Field
import json
from app.config import settings
from app.ai.personality import get_personality_instruction
from app.ai.prompts import CATEGORIZE_TASK_PROMPT, BREAKDOWN_TASK_PROMPT, MOTIVATION_PROMPT

# Initialize Gemini client
client = genai.Client(api_key=settings.gemini_api_key)

# Model Definitions
MODEL_LITE = "gemini-3.1-flash-lite-preview"
MODEL_PRO = "gemini-3.1-pro-preview"
MODEL_IMAGE = "gemini-3.1-flash-image-preview"

class IntentClassification(BaseModel):
    intent: str = Field(description="The user's intent. Must be exactly one of: 'STANDARD_CHAT', 'DEEP_ANALYSIS', or 'IMAGE_GENERATION'")

def classify_intent(message: str) -> str:
    """
    Kullanıcının mesajını analiz ederek hangi modelin kullanılması gerektiğine karar verir.
    """
    try:
        system_instruction = (
            "Sen bir niyet analizatörüsün. Kullanıcının mesajını okuyup ne istediğine karar vereceksin. "
            "Sadece 3 niyet türü olabilir:\\n"
            "1. 'STANDARD_CHAT': Normal sohbet, günlük işler, kısa sorular, özetlemeler, hatırlatmalar, şakalar, sistem durmunu sorma.\\n"
            "2. 'DEEP_ANALYSIS': Çok karmaşık projeler, uzun vadeli ve detaylı stratejik planlamalar, yazılım mimarisi çizimleri, derin hukuki veya bilimsel analiz istekleri.\\n"
            "3. 'IMAGE_GENERATION': Resim, fotoğraf, logo veya görsel üretilmesi talebi.\\n"
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
        
        result = json.loads(response.text)
        intent = result.get("intent", "STANDARD_CHAT")
        
        # Validasyon
        if intent not in ["STANDARD_CHAT", "DEEP_ANALYSIS", "IMAGE_GENERATION"]:
            return "STANDARD_CHAT"
            
        return intent
    except Exception as e:
        print(f"Intent Classification Error: {e}")
        return "STANDARD_CHAT" # Hata anında varsayılan Lite modeli

def generate_chat_response(messages: list, context: str = "") -> str:
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
        if intent == "IMAGE_GENERATION":
            # Görüntü üretimi
            # Not: google-genai kütüphanesinde image generation işlemi genellikle generate_images metodu ile yapılır
            try:
                # Promptu birleştir
                prompt = last_user_message
                
                print("🎨 Görsel üretiliyor (gemini-3.1-flash-image-preview)...")
                # Warning: 3.1 image model might have specific requirements or might fallback to imagen
                # Using the standard genai.models.generate_images function if available, otherwise fallback
                result = client.models.generate_images(
                    model='imagen-3.0-generate-002', # Current recommended image generation endpoint in Vertex/AI Studio until 3.1 is unified seamlessly
                    prompt=prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images= 1,
                        output_mime_type= "image/jpeg",
                        aspect_ratio="1:1"
                    )
                )
                
                # Resim başarılı üretilirse, Frontend tarafına şimdilik base64 stringini embedleyerek veya açıklamalı verebiliriz.
                # En basiti markdown image etiketi ile data url dönmek
                if result and result.generated_images:
                    img = result.generated_images[0]
                    # Convert bytes to base64
                    import base64
                    b64_image = base64.b64encode(img.image.image_bytes).decode('utf-8')
                    return f"İşte istediğiniz görsel:\\n\\n![Üretilen Görsel](data:image/jpeg;base64,{b64_image})"
                else:
                   return "Görsel üretilemedi."

            except Exception as img_e:
                print(f"Image Gen Error: {img_e}")
                return "Resim üretilirken bir hata oluştu veya bu bölgede henüz desteklenmiyor olabilir. Lütfen normal sohbet ile devam edelim."

        # 3. Metinsel Modeller (Lite veya Pro)
        else:
            selected_model = MODEL_PRO if intent == "DEEP_ANALYSIS" else MODEL_LITE
            print(f"🤖 Metin Motoru Seçildi: {selected_model}")
            
            persona_base = get_personality_instruction()
            system_instruction = (
                f"{persona_base}\\n\\n"
                f"SİSTEM/MÜŞTERİ VERİLERİ (BAĞLAM):\\n{context}"
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
            
            return response.text
            
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Genel hata
        return "Üzgünüm, AI servisine erişirken bölgesel bir limit veya API sorunuyla karşılaştım: " + str(e)


def categorize_task(task_text: str, projects_context: str) -> dict:
    """Yeni eklenen görevi AI ile analiz ederek öncelik, süre ve projeyi tahmin eder."""
    try:
        prompt = CATEGORIZE_TASK_PROMPT.format(projects_context=projects_context, task_text=task_text)
        
        response = client.models.generate_content(
            model=MODEL_LITE, # Hızlı analiz
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            ),
        )
        
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
        return response.text.strip()
    except Exception as e:
        print(f"Motivation Error: {e}")
        return "Bugün kendi dünyanı yaratabileceğin harika bir gün. 🌍"
