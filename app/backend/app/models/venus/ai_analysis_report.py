from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class VenusAIAnalysisReport(Base):
    __tablename__ = "venus_ai_analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    report_source = Column(String, default="internal") # internal, external, hybrid
    report_type = Column(String, default="ai_analysis")
    title = Column(String, nullable=False)
    
    # Uploaded file info
    uploaded_file_name = Column(String, nullable=True)
    uploaded_file_path = Column(String, nullable=True)
    uploaded_file_type = Column(String, nullable=True)
    uploaded_file_size = Column(Integer, nullable=True)

    # AI Results
    analysis_result = Column(JSON, default=dict)

    # Status tracking
    status = Column(String, default="pending") # pending, processing, completed, failed
    progress_pct = Column(Integer, default=0)
    error_message = Column(String, nullable=True)

    # Output pdf path
    pdf_file_path = Column(String, nullable=True)

    # Configuration
    analysis_config = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
