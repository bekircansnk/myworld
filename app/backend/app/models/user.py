from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    settings = Column(JSON, default={})
    
    projects = relationship("Project", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    notes = relationship("Note", back_populates="user")
    calendar_events = relationship("CalendarEvent")
    chat_sessions = relationship("ChatSession", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")
