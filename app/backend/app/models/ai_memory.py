from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base

class AIMemory(Base):
    __tablename__ = "ai_memory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    memory_type = Column(String, nullable=False) # short_term, mid_term, long_term
    content = Column(JSON, nullable=False)
    summary = Column(String, nullable=True)
    importance_score = Column(Integer, default=0) # 1-10
    expires_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="ai_memories")
