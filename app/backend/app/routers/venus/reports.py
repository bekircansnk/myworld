from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.report_template import VenusReportTemplate
from app.schemas.venus.report_template import ReportTemplateCreate, ReportTemplateUpdate, ReportTemplateResponse

router = APIRouter()

@router.get("/", response_model=List[ReportTemplateResponse])
def get_reports(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VenusReportTemplate).filter(VenusReportTemplate.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusReportTemplate.project_id == project_id)
    return query.order_by(desc(VenusReportTemplate.created_at)).all()

@router.post("/", response_model=ReportTemplateResponse)
def create_report(
    report_in: ReportTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_report = VenusReportTemplate(**report_in.dict(), user_id=current_user.id)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.put("/{report_id}", response_model=ReportTemplateResponse)
def update_report(
    report_id: int,
    report_in: ReportTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(VenusReportTemplate).filter(
        VenusReportTemplate.id == report_id, VenusReportTemplate.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    for field, value in report_in.dict(exclude_unset=True).items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    return report

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(VenusReportTemplate).filter(
        VenusReportTemplate.id == report_id, VenusReportTemplate.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(report)
    db.commit()
    return {"ok": True}
