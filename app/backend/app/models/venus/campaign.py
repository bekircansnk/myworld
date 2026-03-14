from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float, Date, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class VenusCampaign(Base):
    __tablename__ = "venus_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    ad_account_id = Column(Integer, ForeignKey("venus_ad_accounts.id"), nullable=True)

    platform = Column(String, nullable=False) # google_ads, meta, manual
    campaign_name = Column(String, nullable=False)
    campaign_type = Column(String, nullable=True)
    status = Column(String, default="active") # active, paused, ended, draft
    objective = Column(Text, nullable=True)
    
    budget_daily = Column(Float, nullable=True)
    budget_total = Column(Float, nullable=True)
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    target_audience = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    tags = Column(JSON, default=list)

    # Relationships
    ad_account = relationship("VenusAdAccount", back_populates="campaigns")
    metrics = relationship("VenusDailyMetric", back_populates="campaign", cascade="all, delete-orphan")
