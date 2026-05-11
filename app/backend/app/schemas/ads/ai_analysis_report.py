from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class AIAnalysisReportBase(BaseModel):
    project_id: Optional[int] = None
    report_source: Optional[str] = "internal"
    report_type: Optional[str] = "ai_analysis"
    title: str
    
    uploaded_file_name: Optional[str] = None
    uploaded_file_path: Optional[str] = None
    uploaded_file_type: Optional[str] = None
    uploaded_file_size: Optional[int] = None
    
    analysis_config: Optional[Dict[str, Any]] = {}

class AIAnalysisReportCreate(AIAnalysisReportBase):
    pass

class AIAnalysisReportUpdate(BaseModel):
    status: Optional[str] = None
    progress_pct: Optional[int] = None
    error_message: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None
    pdf_file_path: Optional[str] = None
    completed_at: Optional[datetime] = None

class AIAnalysisReportResponse(AIAnalysisReportBase):
    id: int
    user_id: int
    status: str
    progress_pct: int
    error_message: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None
    pdf_file_path: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
