from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class PhotoModelColor(Base):
    __tablename__ = "photo_model_colors"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("photo_models.id"), nullable=False)
    color_name = Column(String, nullable=False)
    
    ig_required = Column(Boolean, default=True)
    ig_completed = Column(Boolean, default=False)
    ig_completed_at = Column(DateTime, nullable=True)
    ig_photo_count = Column(Integer, default=0)
    
    banner_required = Column(Boolean, default=True)
    banner_completed = Column(Boolean, default=False)
    banner_completed_at = Column(DateTime, nullable=True)
    banner_photo_count = Column(Integer, default=0)
    
    revision_required = Column(Boolean, default=True)
    revision_completed = Column(Boolean, default=False)
    revision_completed_at = Column(DateTime, nullable=True)
    revision_photo_count = Column(Integer, default=0)
    revision_note = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    model = relationship("PhotoModel", back_populates="colors")
