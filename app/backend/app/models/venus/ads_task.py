from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, Boolean, JSON, TIMESTAMP
from sqlalchemy.orm import relationship
from app.models.base import Base

class VenusAdsTask(Base):
    __tablename__ = "venus_ads_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("venus_campaigns.id"), nullable=True)
    experiment_id = Column(Integer, ForeignKey("venus_experiments.id"), nullable=True)
    creative_id = Column(Integer, ForeignKey("venus_creatives.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, default="daily_check") 
    priority = Column(String, default="normal") 
    status = Column(String, default="todo") 
    due_date = Column(Date, nullable=True)
    
    source = Column(String, default="manual")
    ai_notes = Column(Text, nullable=True)
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
