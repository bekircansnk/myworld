from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class VenusCreative(Base):
    __tablename__ = "venus_creatives"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    creative_name = Column(String, nullable=False)
    creative_type = Column(String, nullable=False) # image, video, carousel, text
    format = Column(String, nullable=True) # 1x1, 9x16, 16x9
    url = Column(String, nullable=True) 
    thumbnail_url = Column(String, nullable=True)
    
    designer = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    performance_score = Column(Float, nullable=True)
    status = Column(String, default="active") # active, testing, retired
    tags = Column(JSON, default=list)
