from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.services.gemini import generate_chat_response

router = APIRouter()

MOCK_USER_ID = 1

@router.get("/", response_model=List[NoteResponse])
async def get_notes(db: AsyncSession = Depends(get_db)):
    query = select(Note).where(Note.user_id == MOCK_USER_ID).order_by(Note.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=NoteResponse)
async def create_note(note: NoteCreate, db: AsyncSession = Depends(get_db)):
    note_data = note.model_dump()
    db_note = Note(**note_data, user_id=MOCK_USER_ID)
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: int, note_update: NoteUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Note).where(Note.id == note_id, Note.user_id == MOCK_USER_ID)
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
async def delete_note(note_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Note).where(Note.id == note_id, Note.user_id == MOCK_USER_ID)
    result = await db.execute(query)
    db_note = result.scalars().first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    await db.delete(db_note)
    await db.commit()
    return {"status": "ok"}


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
    prompt = f"""Bekircan sana hızlı bir not yazıyor. Bunu analiz edip zenginleştirmen gerekiyor.

NOT İÇERİĞİ:
\"\"\"{request.content}\"\"\"

Şimdi bu notu şu kurallara göre işle ve SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

{{
  "enhanced_content": "Notun zenginleştirilmiş, düzenli, detaylı hali. Yazım hatalarını düzelt, markdownla formatla, emojilerle güzelleştir, eksik noktaları akıllıca tamamla. Bekircan'ın söylediği her şeyi koru ama daha profesyonel ve detaylı hale getir.",
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
            return EnhanceResponse(
                enhanced_content=data.get("enhanced_content", request.content),
                tasks_found=data.get("tasks_found", []),
                ideas=data.get("ideas", [])
            )
    except (json.JSONDecodeError, AttributeError):
        pass
    
    # JSON parse başarısızsa raw notla dön
    return EnhanceResponse(
        enhanced_content=raw_reply[:2000] if raw_reply else request.content,
        tasks_found=[],
        ideas=[]
    )
