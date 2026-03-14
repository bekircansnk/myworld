from sqlalchemy import Column, Integer, String, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from app.models.base import Base

class VenusDailyMetric(Base):
    __tablename__ = "venus_daily_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("venus_campaigns.id"), nullable=False)

    date = Column(Date, nullable=False)
    platform = Column(String, nullable=False)

    spend = Column(Float, default=0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    ctr = Column(Float, default=0)
    cpc = Column(Float, default=0)
    conversions = Column(Integer, default=0)
    conversion_value = Column(Float, default=0)
    purchases = Column(Integer, default=0)
    purchase_value = Column(Float, default=0)
    roas = Column(Float, default=0)
    cpa = Column(Float, default=0)
    frequency = Column(Float, default=0)

    source = Column(String, default="manual") # api, csv, manual

    # Relationships
    campaign = relationship("VenusCampaign", back_populates="metrics")
