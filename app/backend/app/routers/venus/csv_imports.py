from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import io

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.csv_import import VenusCSVImport
from app.schemas.venus.csv_import import CSVImportCreate, CSVImportUpdate, CSVImportResponse

router = APIRouter(prefix="/venus/csv-imports", tags=["Venus Ads CSV Imports"])

@router.post("/upload", response_model=CSVImportResponse)
async def upload_csv(
    file: UploadFile = File(...),
    platform_source: str = Form("auto"),
    project_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
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

    # TODO: We might want a map from campaign names inside the CSV map to ID,
    # but for manual imports without campaign_id in DB yet, `import_rows_to_db` will leave campaign_id NULL
    # and we can map them later, or use project_id directly. For simplicity, we just import unlinked.
    result = import_rows_to_db(db, parsed["rows"], current_user.id)

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
    db.commit()
    db.refresh(import_record)
    return import_record

@router.get("", response_model=List[CSVImportResponse])
def get_csv_imports(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VenusCSVImport).filter(VenusCSVImport.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusCSVImport.project_id == project_id)
    return query.order_by(desc(VenusCSVImport.created_at)).all()

@router.post("/", response_model=CSVImportResponse)
def create_csv_import(
    in_data: CSVImportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusCSVImport(**in_data.dict(), user_id=current_user.id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=CSVImportResponse)
def update_csv_import(
    item_id: int,
    in_data: CSVImportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusCSVImport).filter(
        VenusCSVImport.id == item_id, VenusCSVImport.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in in_data.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_csv_import(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusCSVImport).filter(
        VenusCSVImport.id == item_id, VenusCSVImport.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"ok": True}
