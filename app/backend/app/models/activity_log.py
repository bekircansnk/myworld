from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # None ise sistem
    action = Column(String(100), nullable=False) # örn: "user_created", "task_deleted", "login"
    module = Column(String(50), nullable=False) # örn: "admin", "tasks", "auth"
    details = Column(JSON, default={}) # Detaylı veriler
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
