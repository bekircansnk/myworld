from sqlalchemy import Column, Integer, String, Date, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base

class DailyReport(Base):
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_date = Column(Date, nullable=False, index=True)
    tasks_completed = Column(Integer, default=0)
    tasks_added = Column(Integer, default=0)
    total_work_minutes = Column(Integer, default=0)
    ai_summary = Column(String, nullable=True)
    mood_score = Column(Integer, nullable=True) # 1-10

    user = relationship("User", backref="daily_reports")

class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    tasks_completed = Column(Integer, default=0)
    total_work_hours = Column(Float, default=0.0)
    productivity_score = Column(Integer, nullable=True) # 1-100
    ai_analysis = Column(String, nullable=True)

    user = relationship("User", backref="weekly_reports")
