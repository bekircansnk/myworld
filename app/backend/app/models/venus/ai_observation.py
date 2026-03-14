from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from app.models.base import Base

class VenusAIObservation(Base):
    __tablename__ = "venus_ai_observations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("venus_campaigns.id"), nullable=True)

    observation_type = Column(String, default="summary") 
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    severity = Column(String, default="info") 
    is_acknowledged = Column(Boolean, default=False)
    related_date_range = Column(String, default="last_7_days")
