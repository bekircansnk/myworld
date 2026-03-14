from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.onboarding_checklist import VenusOnboardingChecklist
from app.schemas.venus.onboarding_checklist import OnboardingChecklistCreate, OnboardingChecklistUpdate, OnboardingChecklistResponse

router = APIRouter()

@router.get("/", response_model=List[OnboardingChecklistResponse])
def get_onboarding_checklists(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VenusOnboardingChecklist).filter(VenusOnboardingChecklist.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusOnboardingChecklist.project_id == project_id)
    return query.order_by(desc(VenusOnboardingChecklist.created_at)).all()

@router.post("/", response_model=OnboardingChecklistResponse)
def create_onboarding_checklist(
    in_data: OnboardingChecklistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusOnboardingChecklist(**in_data.dict(), user_id=current_user.id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=OnboardingChecklistResponse)
def update_onboarding_checklist(
    item_id: int,
    in_data: OnboardingChecklistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusOnboardingChecklist).filter(
        VenusOnboardingChecklist.id == item_id, VenusOnboardingChecklist.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in in_data.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_onboarding_checklist(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(VenusOnboardingChecklist).filter(
        VenusOnboardingChecklist.id == item_id, VenusOnboardingChecklist.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"ok": True}
