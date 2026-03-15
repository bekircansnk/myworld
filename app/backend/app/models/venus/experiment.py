from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class VenusExperiment(Base):
    __tablename__ = "venus_experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("venus_campaigns.id"), nullable=True)
    creative_id = Column(Integer, ForeignKey("venus_creatives.id"), nullable=True)

    experiment_name = Column(String, nullable=False)
    hypothesis = Column(Text, nullable=True)
    status = Column(String, default="running") # running, completed, drafted, stopped
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    metrics_tracked = Column(JSON, default=list) # e.g. ["cpa", "roas", "ctr"]
    winner = Column(String, nullable=True)
    learnings = Column(Text, nullable=True)
    ai_comment = Column(Text, nullable=True)

    # Relationships
    campaign = relationship("VenusCampaign")
