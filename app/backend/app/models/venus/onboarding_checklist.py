from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON
from app.models.base import Base

class VenusOnboardingChecklist(Base):
    __tablename__ = "venus_onboarding_checklists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    client_name = Column(String, nullable=False)
    status = Column(String, default="in_progress")
    items = Column(JSON, default=list) 
    notes = Column(Text, nullable=True)
