from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from datetime import datetime
from app.models.base import Base

class PhotoExcelImport(Base):
    __tablename__ = "photo_excel_imports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String)
    
    models_imported = Column(Integer, default=0)
    colors_imported = Column(Integer, default=0)
    
    status = Column(String, default="success") # success, partial, failed
    error_log = Column(JSON, nullable=True)
    
    imported_at = Column(DateTime, default=datetime.utcnow)
