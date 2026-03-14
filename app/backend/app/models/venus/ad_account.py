from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class VenusAdAccount(Base):
    __tablename__ = "venus_ad_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    platform = Column(String, nullable=False) # google_ads, meta, ga4
    account_name = Column(String, nullable=False)
    account_id_external = Column(String, nullable=True)
    status = Column(String, default="active") # active, paused, disconnected
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User")
    project = relationship("Project")
    campaigns = relationship("VenusCampaign", back_populates="ad_account", cascade="all, delete-orphan")
