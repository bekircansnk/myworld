from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class PhotoModel(Base):
    __tablename__ = "photo_models"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    sezon_kodu = Column(String, nullable=True)
    model_name = Column(String, nullable=False) # MADDE AÇIKLAMASI
    week_number = Column(Integer, default=1) # 1, 2, 3, 4
    month = Column(Integer, default=datetime.utcnow().month)
    year = Column(Integer, default=datetime.utcnow().year)
    
    status = Column(String, default="active") # active, completed, revision_pending
    delivery_date = Column(DateTime, nullable=True)
    total_photos = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    colors = relationship("PhotoModelColor", back_populates="model", cascade="all, delete-orphan")
    revisions = relationship("PhotoRevision", back_populates="model", cascade="all, delete-orphan")
