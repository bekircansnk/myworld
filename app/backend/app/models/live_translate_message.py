from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import Base

class LiveTranslateMessage(Base):
    __tablename__ = "live_translate_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("live_translate_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker = Column(String(20), nullable=False) # "me" or "other"
    original_text = Column(Text, nullable=True) # Input transcription
    translated_text = Column(Text, nullable=True) # Output transcription
    is_final = Column(Boolean, default=True) # Usually saved when final, but good to have
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("LiveTranslateSession", back_populates="messages")
