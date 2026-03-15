from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.creative import VenusCreative
from app.schemas.venus.creative import CreativeCreate, CreativeUpdate, CreativeResponse

router = APIRouter(prefix="/venus/creatives", tags=["Venus Ads Creatives"])

@router.get("", response_model=List[CreativeResponse])
def get_creatives(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[int] = None
):
    query = db.query(VenusCreative).filter(VenusCreative.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusCreative.project_id == project_id)
        
    return query.order_by(VenusCreative.id.desc()).all()

@router.post("", response_model=CreativeResponse)
def create_creative(
    creative: CreativeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_creative = VenusCreative(**creative.model_dump(), user_id=current_user.id)
    db.add(new_creative)
    db.commit()
    db.refresh(new_creative)
    return new_creative

@router.put("/{creative_id}", response_model=CreativeResponse)
def update_creative(
    creative_id: int,
    creative_update: CreativeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_creative = db.query(VenusCreative).filter(VenusCreative.id == creative_id, VenusCreative.user_id == current_user.id).first()
    
    if not db_creative:
        raise HTTPException(status_code=404, detail="Creative not found")
        
    for key, value in creative_update.model_dump(exclude_unset=True).items():
        setattr(db_creative, key, value)
        
    db.commit()
    db.refresh(db_creative)
    return db_creative

@router.delete("/{creative_id}")
def delete_creative(
    creative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_creative = db.query(VenusCreative).filter(VenusCreative.id == creative_id, VenusCreative.user_id == current_user.id).first()
    
    if not db_creative:
        raise HTTPException(status_code=404, detail="Creative not found")
        
    db.delete(db_creative)
    db.commit()
    return {"ok": True}
