from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, extract, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import pandas as pd
import io

from fastapi.responses import StreamingResponse
import io
import pandas as pd

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.venus.photo_model import PhotoModel
from app.models.venus.photo_model_color import PhotoModelColor
from app.models.venus.photo_revision import PhotoRevision
from app.models.venus.photo_excel_import import PhotoExcelImport
from app.schemas.venus.photo_tracking import (
    PhotoModelCreate, PhotoModelUpdate, PhotoModelResponse,
    PhotoModelColorCreate, PhotoModelColorUpdate, PhotoModelColorResponse,
    PhotoRevisionCreate, PhotoRevisionResponse, PhotoOverviewStats,
    PhotoExcelImportResponse
)

router = APIRouter(prefix="/photo-tracking", tags=["Venus Photo Tracking"])

@router.get("/models", response_model=List[PhotoModelResponse])
async def get_models(
    project_id: Optional[int] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    week_number: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PhotoModel).where(PhotoModel.user_id == current_user.id).options(selectinload(PhotoModel.colors), selectinload(PhotoModel.revisions))
    
    if project_id:
        query = query.where(PhotoModel.project_id == project_id)
    if month:
        query = query.where(PhotoModel.month == month)
    if year:
        query = query.where(PhotoModel.year == year)
    if week_number:
        query = query.where(PhotoModel.week_number == week_number)
        
    query = query.order_by(PhotoModel.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/models", response_model=PhotoModelResponse)
async def create_model(
    data: PhotoModelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    model_data = data.model_dump()
    new_model = PhotoModel(**model_data, user_id=current_user.id)
    db.add(new_model)
    await db.commit()
    await db.refresh(new_model)
    
    # Load relationships for response
    query = select(PhotoModel).where(PhotoModel.id == new_model.id).options(selectinload(PhotoModel.colors), selectinload(PhotoModel.revisions))
    result = await db.execute(query)
    return result.scalar_one()

@router.put("/models/{model_id}", response_model=PhotoModelResponse)
async def update_model(
    model_id: int,
    data: PhotoModelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PhotoModel).where(PhotoModel.id == model_id, PhotoModel.user_id == current_user.id)
    result = await db.execute(query)
    target = result.scalar_one_or_none()
    
    if not target:
        raise HTTPException(status_code=404, detail="Model not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(target, key, value)
        
    await db.commit()
    
    # Reload relationships
    query = select(PhotoModel).where(PhotoModel.id == model_id).options(selectinload(PhotoModel.colors), selectinload(PhotoModel.revisions))
    result = await db.execute(query)
    return result.scalar_one()

@router.delete("/models/{model_id}")
async def delete_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PhotoModel).where(PhotoModel.id == model_id, PhotoModel.user_id == current_user.id)
    result = await db.execute(query)
    target = result.scalar_one_or_none()
    
    if not target:
        raise HTTPException(status_code=404, detail="Model not found")
        
    await db.delete(target)
    await db.commit()
    return {"message": "Model deleted successfully"}

# Colors CRUD
@router.post("/models/{model_id}/colors", response_model=PhotoModelColorResponse)
async def add_color(
    model_id: int,
    data: PhotoModelColorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # check model
    query = select(PhotoModel).where(PhotoModel.id == model_id, PhotoModel.user_id == current_user.id)
    result = await db.execute(query)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Model not found")
        
    new_color = PhotoModelColor(**data.model_dump(), model_id=model_id)
    db.add(new_color)
    await db.commit()
    await db.refresh(new_color)
    return new_color

@router.put("/colors/{color_id}", response_model=PhotoModelColorResponse)
async def update_color(
    color_id: int,
    data: PhotoModelColorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PhotoModelColor).join(PhotoModel).where(PhotoModelColor.id == color_id, PhotoModel.user_id == current_user.id)
    result = await db.execute(query)
    color = result.scalar_one_or_none()
    
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")
        
    update_data = data.model_dump(exclude_unset=True)
    
    # Auto-set dates if completed
    if 'ig_completed' in update_data:
        if update_data['ig_completed'] and not color.ig_completed:
            color.ig_completed_at = datetime.utcnow()
        elif not update_data['ig_completed']:
            color.ig_completed_at = None
            
    if 'banner_completed' in update_data:
        if update_data['banner_completed'] and not color.banner_completed:
            color.banner_completed_at = datetime.utcnow()
        elif not update_data['banner_completed']:
            color.banner_completed_at = None
            
    for key, value in update_data.items():
        setattr(color, key, value)
        
    await db.commit()
    
    # Check if we should update model total photos
    model_query = select(PhotoModel).where(PhotoModel.id == color.model_id).options(selectinload(PhotoModel.colors))
    model_res = await db.execute(model_query)
    model = model_res.scalar_one()
    model.total_photos = sum(c.ig_photo_count + c.banner_photo_count for c in model.colors)
    await db.commit()
    
    await db.refresh(color)
    return color

@router.delete("/colors/{color_id}")
async def delete_color(
    color_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PhotoModelColor).join(PhotoModel).where(PhotoModelColor.id == color_id, PhotoModel.user_id == current_user.id)
    result = await db.execute(query)
    color = result.scalar_one_or_none()
    
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")
        
    model_id = color.model_id
    await db.delete(color)
    await db.commit()
    
    # Recalculate total photos
    model_query = select(PhotoModel).where(PhotoModel.id == model_id).options(selectinload(PhotoModel.colors))
    model_res = await db.execute(model_query)
    model = model_res.scalar_one()
    model.total_photos = sum(c.ig_photo_count + c.banner_photo_count for c in model.colors)
    await db.commit()
    
    return {"message": "Color deleted successfully"}

# Revisions
@router.post("/models/{model_id}/revisions", response_model=PhotoRevisionResponse)
async def add_revision(
    model_id: int,
    data: PhotoRevisionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PhotoModel).where(PhotoModel.id == model_id, PhotoModel.user_id == current_user.id)
    result = await db.execute(query)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Model not found")
        
    new_rev = PhotoRevision(**data.model_dump(), model_id=model_id)
    db.add(new_rev)
    await db.commit()
    await db.refresh(new_rev)
    return new_rev

# Overview
@router.get("/overview", response_model=PhotoOverviewStats)
async def get_overview(
    project_id: Optional[int] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    models_q = select(PhotoModel).where(PhotoModel.user_id == current_user.id)
    if project_id:
        models_q = models_q.where(PhotoModel.project_id == project_id)
    if month:
        models_q = models_q.where(PhotoModel.month == month)
    if year:
        models_q = models_q.where(PhotoModel.year == year)
        
    models_res = await db.execute(models_q.options(selectinload(PhotoModel.colors), selectinload(PhotoModel.revisions)))
    models = models_res.scalars().all()
    
    total_models = len(models)
    total_colors = sum(len(m.colors) for m in models)
    total_photos = sum(m.total_photos for m in models)
    total_revisions = sum(sum(r.revised_count for r in m.revisions) for m in models)
    
    return PhotoOverviewStats(
        total_models=total_models,
        total_colors=total_colors,
        total_photos=total_photos,
        total_revisions=total_revisions
    )

# Excel Import
@router.post("/import-excel", response_model=PhotoExcelImportResponse)
async def import_excel(
    file: UploadFile = File(...),
    project_id: Optional[int] = Form(None),
    week_number: int = Form(1),
    month: Optional[int] = Form(None),
    year: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Sadece .xlsx dosyaları kabul edilir")
        
    if month is None:
        month = datetime.utcnow().month
    if year is None:
        year = datetime.utcnow().year
        
    content = await file.read()
    
    try:
        df = pd.read_excel(io.BytesIO(content))
        
        models_imported = 0
        colors_imported = 0
        
        # 'SEZON KODU', 'MADDE AÇIKLAMASI', 'RENK', 'Unnamed: 3', 'Sosyal Medya ', 'WEB SİTESİ 16:9', 'TESLİM EDİLEN', 'REVİZE', 'TESLİM EDİLME TARİHİ'
        # Group by Model Name ('MADDE AÇIKLAMASI') and process rows as colors
        
        current_model_name = None
        current_model_id = None
        current_season = None
        
        for index, row in df.iterrows():
            model_name = row.get('MADDE AÇIKLAMASI')
            sezon = row.get('SEZON KODU')
            
            if pd.notna(model_name):
                current_model_name = str(model_name).strip()
                if pd.notna(sezon):
                    current_season = str(sezon).strip()
                
                # Check if model exists for this month/year
                m_q = select(PhotoModel).where(
                    PhotoModel.model_name == current_model_name,
                    PhotoModel.user_id == current_user.id,
                    PhotoModel.month == month,
                    PhotoModel.year == year
                )
                m_res = await db.execute(m_q)
                model = m_res.scalar_one_or_none()
                
                if not model:
                    model = PhotoModel(
                        user_id=current_user.id,
                        project_id=project_id,
                        model_name=current_model_name,
                        sezon_kodu=current_season,
                        month=month,
                        year=year,
                        week_number=week_number
                    )
                    db.add(model)
                    await db.commit()
                    await db.refresh(model)
                    models_imported += 1
                
                current_model_id = model.id
                
            color_name = row.get('RENK')
            if pd.notna(color_name) and current_model_id:
                c_name = str(color_name).strip()
                
                c_q = select(PhotoModelColor).where(
                    PhotoModelColor.model_id == current_model_id,
                    PhotoModelColor.color_name == c_name
                )
                c_res = await db.execute(c_q)
                color = c_res.scalar_one_or_none()
                
                if not color:
                    # ig required logic
                    def is_req(val):
                        s = str(val).strip().lower()
                        if not s or s == 'nan' or s == 'nat' or s == 'none': return False
                        if s in ['x', '-', 'çarpı', 'false', '0', 'yok', 'hayır']: return False
                        return True
                        
                    ig_req = is_req(row.get('Sosyal Medya ', ''))
                    banner_req = is_req(row.get('WEB SİTESİ 16:9', ''))
                    
                    color = PhotoModelColor(
                        model_id=current_model_id,
                        color_name=c_name,
                        ig_required=ig_req,
                        banner_required=banner_req
                    )
                    db.add(color)
                    colors_imported += 1
        
        await db.commit()
        
        log = PhotoExcelImport(
            user_id=current_user.id,
            file_name=file.filename,
            models_imported=models_imported,
            colors_imported=colors_imported,
            status="success"
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log
        
    except Exception as e:
        log = PhotoExcelImport(
            user_id=current_user.id,
            file_name=file.filename,
            status="failed",
            error_log={"error": str(e)}
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        raise HTTPException(status_code=500, detail=f"Excel parse error: {str(e)}")

@router.get("/export-excel")
async def export_excel(
    project_id: Optional[int] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PhotoModel).where(PhotoModel.user_id == current_user.id).options(selectinload(PhotoModel.colors), selectinload(PhotoModel.revisions))
    if project_id:
        query = query.where(PhotoModel.project_id == project_id)
    if month:
        query = query.where(PhotoModel.month == month)
    if year:
        query = query.where(PhotoModel.year == year)
        
    query = query.order_by(PhotoModel.created_at.desc())
    result = await db.execute(query)
    models = result.scalars().all()
    
    # Format according to user's Excel structure
    # 'SEZON KOD', 'MADDE AÇIKLAMASI', 'RENK', 'Unnamed: 3', 'Sosyal Medya', 'WEB SİTESİ 1', 'TESLİM EDİLEN', 'REVİZE', 'TESLİM EDİLME TARİHİ'
    
    data = []
    for model in models:
        for i, color in enumerate(model.colors):
            row = {
                'SEZON KOD': model.sezon_kodu if i == 0 else '',
                'MADDE AÇIKLAMASI': model.model_name if i == 0 else '',
                'RENK': color.color_name,
                'Unnamed: 3': '',
                'Sosyal Medya': color.ig_photo_count if color.ig_photo_count > 0 else ('X' if color.ig_required else ''),
                'WEB SİTESİ 1': color.banner_photo_count if color.banner_photo_count > 0 else ('X' if color.banner_required else ''),
                'TESLİM EDİLEN': 'X' if model.status == 'completed' else '',
                'REVİZE': ', '.join([r.description for r in model.revisions]) if i == 0 else '',
                'TESLİM EDİLME TARİHİ': model.delivery_date.strftime('%d.%m.%Y') if model.delivery_date and i == 0 else ''
            }
            data.append(row)
            
        if not model.colors:
            row = {
                'SEZON KOD': model.sezon_kodu,
                'MADDE AÇIKLAMASI': model.model_name,
                'RENK': '',
                'Unnamed: 3': '',
                'Sosyal Medya': '',
                'WEB SİTESİ 1': '',
                'TESLİM EDİLEN': 'X' if model.status == 'completed' else '',
                'REVİZE': ', '.join([r.description for r in model.revisions]),
                'TESLİM EDİLME TARİHİ': model.delivery_date.strftime('%d.%m.%Y') if model.delivery_date else ''
            }
            data.append(row)

    df = pd.DataFrame(data)
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Fotoğraf Takip')
        
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="fotograf_takip.xlsx"'
    }
    
    return StreamingResponse(
        output,
        headers=headers,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
