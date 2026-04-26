from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
from app.models.base import Base

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    is_all_day = Column(Boolean, default=False)
    event_type = Column(String(50), default="task") # task, routine, personal, etc.
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True) # Optional link to a task
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=True) # Optional link to a note
    is_completed = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", overlaps="calendar_events")
    task = relationship("Task")
    note = relationship("Note")

