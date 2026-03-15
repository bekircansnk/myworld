from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.report_template import VenusReportTemplate
from app.schemas.venus.report_template import ReportTemplateCreate, ReportTemplateUpdate, ReportTemplateResponse

router = APIRouter(tags=["Venus Ads Reports"])

@router.get("", response_model=List[ReportTemplateResponse])
async def get_reports(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VenusReportTemplate).where(VenusReportTemplate.user_id == current_user.id)
    if project_id:
        query = query.where(VenusReportTemplate.project_id == project_id)
        
    result = await db.execute(query.order_by(desc(VenusReportTemplate.created_at)))
    return result.scalars().all()

@router.post("", response_model=ReportTemplateResponse)
async def create_report(
    report_in: ReportTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_report = VenusReportTemplate(**report_in.model_dump(), user_id=current_user.id)
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report

@router.put("/{report_id}", response_model=ReportTemplateResponse)
async def update_report(
    report_id: int,
    report_in: ReportTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusReportTemplate).where(
        VenusReportTemplate.id == report_id, VenusReportTemplate.user_id == current_user.id
    ))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    for field, value in report_in.model_dump(exclude_unset=True).items():
        setattr(report, field, value)
    
    await db.commit()
    await db.refresh(report)
    return report

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusReportTemplate).where(
        VenusReportTemplate.id == report_id, VenusReportTemplate.user_id == current_user.id
    ))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    await db.delete(report)
    await db.commit()
    return {"ok": True}
