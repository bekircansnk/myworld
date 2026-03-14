from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.competitor import VenusCompetitor
from app.schemas.venus.competitor import CompetitorCreate, CompetitorUpdate, CompetitorResponse

router = APIRouter()

@router.get("/", response_model=List[CompetitorResponse])
def get_competitors(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VenusCompetitor).filter(VenusCompetitor.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusCompetitor.project_id == project_id)
    return query.order_by(desc(VenusCompetitor.created_at)).all()

@router.post("/", response_model=CompetitorResponse)
def create_competitor(
    in_data: CompetitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusCompetitor(**in_data.dict(), user_id=current_user.id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=CompetitorResponse)
def update_competitor(
    item_id: int,
    in_data: CompetitorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusCompetitor).filter(
        VenusCompetitor.id == item_id, VenusCompetitor.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in in_data.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_competitor(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusCompetitor).filter(
        VenusCompetitor.id == item_id, VenusCompetitor.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"ok": True}
