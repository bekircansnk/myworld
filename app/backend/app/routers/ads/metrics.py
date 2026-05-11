from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.ads.daily_metric import AdDailyMetric
from app.models.ads.campaign import AdCampaign
from app.schemas.ads.metric import DailyMetricCreate, DailyMetricUpdate, DailyMetricResponse

router = APIRouter(tags=["Ads Panel Metrics"])

@router.get("/overview")
async def get_metrics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[int] = None,
    days: int = 7
):
    from app.services.venus.metric_calculator import calculate_kpi_summary
    return calculate_kpi_summary(db=db, user_id=current_user.id, project_id=project_id, days=days)

@router.get("", response_model=List[DailyMetricResponse])
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    campaign_id: Optional[int] = None
):
    query = select(AdDailyMetric).where(AdDailyMetric.user_id == current_user.id)
    if campaign_id:
        query = query.where(AdDailyMetric.campaign_id == campaign_id)
        
    result = await db.execute(query.order_by(AdDailyMetric.date.desc()))
    return result.scalars().all()

@router.post("", response_model=DailyMetricResponse)
async def create_metric(
    metric: DailyMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check campaign
    result = await db.execute(select(AdCampaign).where(AdCampaign.id == metric.campaign_id, AdCampaign.user_id == current_user.id))
    db_campaign = result.scalar_one_or_none()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    new_metric = AdDailyMetric(**metric.model_dump(), user_id=current_user.id)
    db.add(new_metric)
    await db.commit()
    await db.refresh(new_metric)
    return new_metric

@router.delete("/{metric_id}")
async def delete_metric(
    metric_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AdDailyMetric).where(AdDailyMetric.id == metric_id, AdDailyMetric.user_id == current_user.id))
    db_metric = result.scalar_one_or_none()
    
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
        
    await db.delete(db_metric)
    await db.commit()
    return {"ok": True}
