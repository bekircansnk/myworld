from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.live_translate_session import LiveTranslateSession
from app.models.live_translate_message import LiveTranslateMessage
from app.schemas.live_translate import (
    LiveTranslateSessionCreate,
    LiveTranslateSessionOut,
    LiveTranslateSessionDetailOut,
    LiveTranslateMessageCreate,
    LiveTranslateMessageOut
)

router = APIRouter(
    prefix="/live-translate",
    tags=["Live Translate"]
)

@router.get("/sessions", response_model=List[LiveTranslateSessionOut])
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Kullanıcının canlı çeviri oturumlarını listeler."""
    sessions = db.query(LiveTranslateSession).filter(
        LiveTranslateSession.user_id == current_user.id
    ).order_by(desc(LiveTranslateSession.updated_at)).all()
    return sessions

@router.post("/sessions", response_model=LiveTranslateSessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    session_in: LiveTranslateSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Yeni bir canlı çeviri oturumu başlatır."""
    new_session = LiveTranslateSession(
        user_id=current_user.id,
        title=session_in.title,
        source_language=session_in.source_language,
        target_language=session_in.target_language
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/sessions/{session_id}", response_model=LiveTranslateSessionDetailOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Belirli bir oturumun detaylarını ve mesajlarını getirir."""
    db_session = db.query(LiveTranslateSession).filter(
        LiveTranslateSession.id == session_id,
        LiveTranslateSession.user_id == current_user.id
    ).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı")
    return db_session

@router.post("/sessions/{session_id}/messages", response_model=LiveTranslateMessageOut, status_code=status.HTTP_201_CREATED)
def add_message(
    session_id: int,
    message_in: LiveTranslateMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Oturuma yeni bir mesaj ekler."""
    db_session = db.query(LiveTranslateSession).filter(
        LiveTranslateSession.id == session_id,
        LiveTranslateSession.user_id == current_user.id
    ).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı")
        
    new_msg = LiveTranslateMessage(
        session_id=session_id,
        speaker=message_in.speaker,
        original_text=message_in.original_text,
        translated_text=message_in.translated_text,
        is_final=message_in.is_final
    )
    db.add(new_msg)
    
    # Update message count and updated_at
    db_session.message_count += 1
    
    # Generate title automatically if empty and we have a message
    if not db_session.title and new_msg.original_text:
        preview = new_msg.original_text[:30] + "..." if len(new_msg.original_text) > 30 else new_msg.original_text
        db_session.title = f"Çeviri: {preview}"
        
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Belirli bir oturumu siler."""
    db_session = db.query(LiveTranslateSession).filter(
        LiveTranslateSession.id == session_id,
        LiveTranslateSession.user_id == current_user.id
    ).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı")
        
    db.delete(db_session)
    db.commit()
    return None
