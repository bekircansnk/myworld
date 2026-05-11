from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # None ise sistem
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)  # Hangi firmada yapıldı
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Başka kullanıcıya yapılan aksiyon
    action = Column(String(100), nullable=False)  # örn: "user_login", "note_create", "access_denied"
    module = Column(String(50), nullable=False)  # örn: "auth", "notes", "tasks", "admin"
    details = Column(JSON, default={})  # Detaylı veriler
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    target_user = relationship("User", foreign_keys=[target_user_id])
    project = relationship("Project")
