from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=True, index=True)
    role = Column(String(20), nullable=False) # "user" or "ai"
    content = Column(Text, nullable=False)
    actions = Column(JSON, nullable=True) # list of ActionLogs stored as JSON
    model_used = Column(String(50), nullable=True)
    token_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="chat_messages")
    session = relationship("ChatSession", back_populates="messages")
