from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.report_template import VenusReportTemplate
from app.models.venus.ai_analysis_report import VenusAIAnalysisReport
from app.schemas.venus.report_template import ReportTemplateCreate, ReportTemplateUpdate, ReportTemplateResponse
from app.schemas.venus.ai_analysis_report import AIAnalysisReportCreate, AIAnalysisReportResponse, AIAnalysisReportUpdate
from app.services.venus.ai_report_analyst import analyze_report_data
from app.services.venus.pdf_generator import generate_ai_report_pdf
from fastapi import File, UploadFile, Form
import os
import uuid
import datetime

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

# --- AI Analysis Report Endpoints ---

@router.get("/ai-analysis", response_model=List[AIAnalysisReportResponse])
async def get_ai_reports(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VenusAIAnalysisReport).where(VenusAIAnalysisReport.user_id == current_user.id)
    if project_id:
        query = query.where(VenusAIAnalysisReport.project_id == project_id)
        
    result = await db.execute(query.order_by(desc(VenusAIAnalysisReport.created_at)))
    return result.scalars().all()

@router.post("/ai-analysis", response_model=AIAnalysisReportResponse)
async def create_ai_analysis(
    title: str = Form(...),
    project_id: Optional[int] = Form(None),
    report_source: str = Form("internal"),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Handle File Upload
    file_path = None
    file_name = None
    file_type = None
    file_size = None
    
    if file and report_source in ["external", "hybrid"]:
        file_name = file.filename
        file_type = file_name.split(".")[-1] if "." in file_name else "unknown"
        content = await file.read()
        file_size = len(content)
        
        # Save file
        upload_dir = "/tmp/venus_ai_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{uuid.uuid4().hex}_{file_name}")
        with open(file_path, "wb") as f:
            f.write(content)

    new_report = VenusAIAnalysisReport(
        user_id=current_user.id,
        project_id=project_id,
        title=title,
        report_source=report_source,
        report_type="ai_analysis",
        uploaded_file_name=file_name,
        uploaded_file_path=file_path,
        uploaded_file_type=file_type,
        uploaded_file_size=file_size,
        status="processing",
        progress_pct=10
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    # Process AI Analysis (Mocked as Synchronous for simplicity in response, could be background task)
    config = {"title": title, "period": "current", "notes": "Generated by My World AI"}
    analysis_result = await analyze_report_data(report_source, config)
    
    # Generate PDF
    pdf_path = await generate_ai_report_pdf(analysis_result)
    
    # Update Record
    new_report.analysis_result = analysis_result
    new_report.pdf_file_path = pdf_path
    new_report.status = "completed"
    new_report.progress_pct = 100
    new_report.completed_at = datetime.datetime.utcnow()
    
    await db.commit()
    await db.refresh(new_report)
    
    return new_report

@router.get("/ai-analysis/{report_id}", response_model=AIAnalysisReportResponse)
async def get_ai_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusAIAnalysisReport).where(
        VenusAIAnalysisReport.id == report_id, VenusAIAnalysisReport.user_id == current_user.id
    ))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="AI Report not found")
    return report

@router.delete("/ai-analysis/{report_id}")
async def delete_ai_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusAIAnalysisReport).where(
        VenusAIAnalysisReport.id == report_id, VenusAIAnalysisReport.user_id == current_user.id
    ))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="AI Report not found")
        
    await db.delete(report)
    await db.commit()
    return {"ok": True}

@router.get("/download/{report_id}")
async def download_ai_report_pdf(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from fastapi.responses import FileResponse
    result = await db.execute(select(VenusAIAnalysisReport).where(
        VenusAIAnalysisReport.id == report_id, VenusAIAnalysisReport.user_id == current_user.id
    ))
    report = result.scalar_one_or_none()
    
    if not report or not report.pdf_file_path or not os.path.exists(report.pdf_file_path):
        raise HTTPException(status_code=404, detail="PDF not found or report not processsed completely")
        
    return FileResponse(path=report.pdf_file_path, filename=f"AI_Analysis_{report.id}.pdf", media_type='application/pdf')
