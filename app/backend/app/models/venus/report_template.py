from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON
from app.models.base import Base

class VenusReportTemplate(Base):
    __tablename__ = "venus_report_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    title = Column(String, nullable=False)
    template_type = Column(String, default="weekly") 
    sections = Column(JSON, default=list) 
    is_default = Column(Boolean, default=False)
