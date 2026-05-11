from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class PhotoRevision(Base):
    __tablename__ = "photo_revisions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("photo_models.id"), nullable=False)
    color_id = Column(Integer, ForeignKey("photo_model_colors.id"), nullable=True)
    
    description = Column(Text, nullable=False)
    revised_count = Column(Integer, default=0)
    
    revised_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    model = relationship("PhotoModel", back_populates="revisions")
