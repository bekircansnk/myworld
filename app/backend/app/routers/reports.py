from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from app.database import get_db
from app.models.report import DailyReport, WeeklyReport
from app.schemas.report import DailyReportResponse, WeeklyReportResponse
from app.services.report_service import generate_daily_report

router = APIRouter()
MOCK_USER_ID = 1

@router.get("/daily", response_model=List[DailyReportResponse])
async def get_daily_reports(limit: int = 14, db: AsyncSession = Depends(get_db)):
    """Son {limit} günlük raporları getirir."""
    query = select(DailyReport).where(DailyReport.user_id == MOCK_USER_ID).order_by(desc(DailyReport.report_date)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/generate/daily", response_model=DailyReportResponse)
async def trigger_daily_report(db: AsyncSession = Depends(get_db)):
    """Senkron / Trigger ile bugünün raporunu oluşturup veritabanına ve telegrama atar (Genelde N8N taraflı tetiklenir)."""
    report = await generate_daily_report(db)
    return report

@router.get("/weekly", response_model=List[WeeklyReportResponse])
async def get_weekly_reports(limit: int = 12, db: AsyncSession = Depends(get_db)):
    """Son {limit} haftalık raporları getirir."""
    query = select(WeeklyReport).where(WeeklyReport.user_id == MOCK_USER_ID).order_by(desc(WeeklyReport.week_start)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
