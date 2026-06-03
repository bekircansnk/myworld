from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#000000")
    icon = Column(String, nullable=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    discord_webhook_url = Column(String, nullable=True)
    slack_webhook_url = Column(String, nullable=True)
    columns_config = Column(JSON, nullable=True) # Kanban sütun yapılandırması [ { id, label, statusKey, dotColor } ]

    user = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project")
    notes = relationship("Note", back_populates="project")
