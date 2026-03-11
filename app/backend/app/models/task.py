from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(String, default="normal") # urgent, normal, low
    status = Column(String, default="todo") # todo, in_progress, done
    due_date = Column(DateTime(timezone=True), nullable=True)
    estimated_minutes = Column(Integer, nullable=True)
    actual_minutes = Column(Integer, default=0)
    ai_category = Column(String, nullable=True)
    ai_suggested_priority = Column(String, nullable=True)
    ai_analysis = Column(String, nullable=True)
    ai_analysis_history = Column(JSON, default=list)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    sort_order = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    subtasks = relationship("Task", backref="parent_task", remote_side=[id])
