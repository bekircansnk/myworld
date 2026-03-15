from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import io

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.csv_import import VenusCSVImport
from app.schemas.venus.csv_import import CSVImportCreate, CSVImportUpdate, CSVImportResponse

router = APIRouter(tags=["Venus Ads CSV Imports"])

@router.post("/upload", response_model=CSVImportResponse)
async def upload_csv(
    file: UploadFile = File(...),
    platform_source: str = Form("auto"),
    project_id: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.venus.csv_parser import parse_csv_content, import_rows_to_db

    content = await file.read()
    try:
        content_str = content.decode("utf-8")
    except UnicodeDecodeError:
        content_str = content.decode("latin-1")

    parsed = parse_csv_content(content_str, platform=platform_source)

    if not parsed["rows"]:
        raise HTTPException(status_code=400, detail="No valid data found in CSV")

    result = await import_rows_to_db(db, parsed["rows"], current_user.id)

    # Save import history record
    import_record = VenusCSVImport(
        user_id=current_user.id,
        project_id=project_id,
        filename=file.filename,
        platform_source=parsed["platform"],
        rows_imported=result["imported"],
        status="completed" if result["skipped"] == 0 else "partial",
        error_log="; ".join(parsed["errors"]) if parsed["errors"] else None
    )
    db.add(import_record)
    await db.commit()
    await db.refresh(import_record)
    return import_record

@router.get("", response_model=List[CSVImportResponse])
async def get_csv_imports(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VenusCSVImport).where(VenusCSVImport.user_id == current_user.id)
    if project_id:
        query = query.where(VenusCSVImport.project_id == project_id)
        
    result = await db.execute(query.order_by(desc(VenusCSVImport.created_at)))
    return result.scalars().all()

@router.post("", response_model=CSVImportResponse)
async def create_csv_import(
    in_data: CSVImportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusCSVImport(**in_data.model_dump(), user_id=current_user.id)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=CSVImportResponse)
async def update_csv_import(
    item_id: int,
    in_data: CSVImportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusCSVImport).where(
        VenusCSVImport.id == item_id, VenusCSVImport.user_id == current_user.id
    ))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in in_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{item_id}")
async def delete_csv_import(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusCSVImport).where(
        VenusCSVImport.id == item_id, VenusCSVImport.user_id == current_user.id
    ))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
    return {"ok": True}
