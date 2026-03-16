import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from datetime import datetime, timezone

from app.database import get_db
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.services.gemini import generate_chat_response, _get_gemini_client, log_cost_awaitable

router = APIRouter(prefix="/notes", tags=["notes"])

from app.dependencies.auth import get_current_user
from app.models.user import User

@router.get("", response_model=List[NoteResponse])
async def get_notes(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(Note).where(Note.user_id == current_user.id).order_by(Note.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=NoteResponse)
async def create_note(note: NoteCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    note_data = note.model_dump()
    
    # AI Auto Title & Category Generation Feature
    if not note_data.get('title') or not note_data.get('ai_category'):
        client = _get_gemini_client()
        if client:
            try:
                prompt = f"""Şu nota bir başlık ver (maksimum 4 kelime) ve kategorisini belirle.
Kategoriler şunlardan biri olmalı: "Yaratıcı Fikirler", "Genel Notlar", "Yazılım"

SADECE JSON döndür:
{{
    "title": "Bulduğun Başlık",
    "category": "Kategori"
}}

İçerik: "{note_data.get('content')}"
"""
                response = await client.aio.models.generate_content(
                    model='gemini-3.1-flash-lite-preview',
                    contents=prompt,
                )
                await log_cost_awaitable(response, 'gemini-3.1-flash-lite-preview')
                import json
                import re
                raw_reply = response.text
                json_match = re.search(r'\{[\s\S]*\}', raw_reply)
                if json_match:
                    data = json.loads(json_match.group(0))
                    if not note_data.get('title'):
                        note_data['title'] = data.get('title', 'İsimsiz Not')
                    if not note_data.get('ai_category'):
                        note_data['ai_category'] = data.get('category', 'Genel Notlar')
            except Exception as e:
                print(f"Bilinmeyen hata (AI başlık): {e}")

    if not note_data.get('title'):
        note_data['title'] = "İsimsiz Not"

    db_note = Note(**note_data, user_id=current_user.id)
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: int, note_update: NoteUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    result = await db.execute(query)
    db_note = result.scalars().first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    update_data = note_update.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_note, k, v)
        
    await db.commit()
    await db.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
async def delete_note(note_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    result = await db.execute(query)
    db_note = result.scalars().first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    # Prevent IntegrityError by unlinking CalendarEvents that reference this note
    from sqlalchemy import update
    from app.models.calendar_event import CalendarEvent
    await db.execute(update(CalendarEvent).where(CalendarEvent.note_id == note_id).values(note_id=None))
    
    await db.delete(db_note)
    await db.commit()
    return {"status": "ok"}

@router.post("/{note_id}/ai-analysis", response_model=NoteResponse)
async def generate_note_ai_analysis(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    result = await db.execute(query)
    db_note = result.scalars().first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    client = _get_gemini_client()
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API not configured")

    prompt = f"""Şu not hakkında kısa bir özet, analiz veya içgörü üret (3-4 satır, motivasyonel veya analitik):
Not Başlığı: "{db_note.title or 'İsimsiz Not'}"
İçerik: "{db_note.content}"
Kategori: {db_note.ai_category or 'Belirsiz'}
⚠️ Sadece analiz yaz."""

    try:
        response = await client.aio.models.generate_content(
            model='gemini-3.1-flash-lite-preview',
            contents=prompt,
        )
        await log_cost_awaitable(response, 'gemini-3.1-flash-lite-preview')
        new_analysis = response.text

        history = list(db_note.ai_analysis_history) if db_note.ai_analysis_history else []
        if db_note.ai_analysis:
            history.append({
                "text": db_note.ai_analysis,
                "title": db_note.title, # preserve previous title
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
        # Parse potential new title from the response if we asked for it, or just make it an analysis.
        # It's better to update the title during analysis too if asked.
        prompt2 = f"""Şu notun başlığını içeriğe uygun şekilde güncelle (maks 4 kelime). SADECE başlık metnini yaz:
İçerik: "{db_note.content}"
"""
        try:
            res_title = await client.aio.models.generate_content(
                model='gemini-3.1-flash-lite-preview',
                contents=prompt2,
            )
            await log_cost_awaitable(res_title, 'gemini-3.1-flash-lite-preview')
            new_title = res_title.text.strip()
            if new_title and len(new_title) < 50:
                db_note.title = new_title
        except:
            pass

        db_note.ai_analysis = new_analysis
        db_note.ai_analysis_history = history
        
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(db_note, "ai_analysis_history")
        
        await db.commit()
        await db.refresh(db_note)
        
        return db_note
    except Exception as e:
        print(f"Note Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run AI analysis for note")


# ====== AI NOT ZENGİNLEŞTİRME ======

class EnhanceRequest(BaseModel):
    content: str

class EnhanceResponse(BaseModel):
    enhanced_content: str
    tasks_found: List[str]
    ideas: List[str]

@router.post("/enhance", response_model=EnhanceResponse)
async def enhance_note_with_ai(request: EnhanceRequest):
    """
    Kullanıcının hızlı notunu AI ile zenginleştirir:
    - Yazım hatalarını düzeltir
    - Detaylandırır ve yapılandırır
    - İçinden görev çıkarır
    - Ek fikirler/araştırma önerileri verir
    """
    prompt = f"""Kullanıcı sana hızlı bir not yazıyor. Bunu analiz edip zenginleştirmen gerekiyor.

NOT İÇERİĞİ:
\"\"\"{request.content}\"\"\"

Şimdi bu notu şu kurallara göre işle ve SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

{{
  "enhanced_content": "Notun zenginleştirilmiş, düzenli, detaylı hali. Yazım hatalarını düzelt, markdownla formatla, emojilerle güzelleştir, eksik noktaları akıllıca tamamla. Kullanıcının söylediği her şeyi koru ama daha profesyonel ve detaylı hale getir.",
  "tasks_found": ["Notun içinden çıkan yapılabilecek görevler listesi (varsa)", "İkinci görev"],
  "ideas": ["Bu konuyla ilgili ek fikir veya araştırma önerisi", "İkinci öneri"]
}}

KURALLAR:
- enhanced_content: Emojili, düzenli, güzel bir not olsun. Markdownsız, sade ama çekici.
- tasks_found: Nottan somut yapılabilecek görev çıkıyorsa listele. Yoksa boş liste [].
- ideas: İlgili yaratıcı fikirler, araştırma önerileri. Yoksa boş liste [].
- SADECE JSON döndür, başka metin yazma."""

    raw_reply = generate_chat_response(
        [{"role": "user", "content": prompt}],
        context=""
    )
    
    # JSON parse
    import json
    import re
    
    try:
        # JSON bloğunu bul (```json ... ``` içinde olabilir)
        json_match = re.search(r'\{[\s\S]*\}', raw_reply)
        if json_match:
            data = json.loads(json_match.group(0))
            # Pydantic v2 model_validate check or dict unpack
            return EnhanceResponse.model_validate({
                "enhanced_content": data.get("enhanced_content", request.content),
                "tasks_found": data.get("tasks_found", []),
                "ideas": data.get("ideas", [])
            })
    except (json.JSONDecodeError, AttributeError):
        pass
    
    # JSON parse başarısızsa raw notla dön
    return EnhanceResponse(
        enhanced_content=raw_reply[:2000] if raw_reply else request.content,
        tasks_found=[],
        ideas=[]
    )

@router.post("/{note_id}/upload-audio", response_model=NoteResponse)
async def upload_note_audio(
    note_id: int,
    audio_file: UploadFile = File(...),
    tts_text: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    result = await db.execute(query)
    db_note = result.scalars().first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    os.makedirs("static/audio", exist_ok=True)
    ext = audio_file.filename.split('.')[-1] if '.' in audio_file.filename else 'wav'
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = f"static/audio/{filename}"
    
    # Save the file
    content = await audio_file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    db_note.tts_audio_url = f"/{file_path}"
    db_note.tts_text = tts_text
    
    await db.commit()
    await db.refresh(db_note)
    return db_note
