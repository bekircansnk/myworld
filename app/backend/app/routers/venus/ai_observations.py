from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.ai_observation import VenusAIObservation
from app.schemas.venus.ai_observation import AIObservationCreate, AIObservationUpdate, AIObservationResponse

router = APIRouter()

@router.get("/", response_model=List[AIObservationResponse])
def get_ai_observations(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VenusAIObservation).filter(VenusAIObservation.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusAIObservation.project_id == project_id)
    return query.order_by(desc(VenusAIObservation.created_at)).all()

@router.post("/", response_model=AIObservationResponse)
def create_ai_observation(
    in_data: AIObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusAIObservation(**in_data.dict(), user_id=current_user.id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=AIObservationResponse)
def update_ai_observation(
    item_id: int,
    in_data: AIObservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusAIObservation).filter(
        VenusAIObservation.id == item_id, VenusAIObservation.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in in_data.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_ai_observation(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusAIObservation).filter(
        VenusAIObservation.id == item_id, VenusAIObservation.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"ok": True}
