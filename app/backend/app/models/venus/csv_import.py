from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.models.base import Base

class VenusCSVImport(Base):
    __tablename__ = "venus_csv_imports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    filename = Column(String, nullable=False)
    platform_source = Column(String, default="other") 
    rows_imported = Column(Integer, default=0)
    status = Column(String, default="partial") 
    error_log = Column(Text, nullable=True)
