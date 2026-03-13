from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime, timezone

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)  # Cross-reference to task
    content = Column(String, nullable=False)
    title = Column(String, nullable=True)
    ai_category = Column(String, nullable=True)
    ai_tags = Column(JSON, default=[])
    ai_analysis = Column(String, nullable=True)
    ai_analysis_history = Column(JSON, default=list)
    source = Column(String, default="web") # web, telegram, ai
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notes")
    project = relationship("Project", back_populates="notes")
    task = relationship("Task")

