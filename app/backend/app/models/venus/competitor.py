from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON
from app.models.base import Base

class VenusCompetitor(Base):
    __tablename__ = "venus_competitors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    brand_name = Column(String, nullable=False)
    website_url = Column(String, nullable=True)
    ad_library_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    
    notes = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    creative_style = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
