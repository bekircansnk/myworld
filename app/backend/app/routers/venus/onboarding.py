from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.onboarding_checklist import VenusOnboardingChecklist
from app.schemas.venus.onboarding_checklist import OnboardingChecklistCreate, OnboardingChecklistUpdate, OnboardingChecklistResponse

router = APIRouter(tags=["Venus Ads Onboarding"])

@router.get("", response_model=List[OnboardingChecklistResponse])
async def get_onboarding_checklists(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VenusOnboardingChecklist).where(VenusOnboardingChecklist.user_id == current_user.id)
    if project_id:
        query = query.where(VenusOnboardingChecklist.project_id == project_id)
        
    result = await db.execute(query.order_by(desc(VenusOnboardingChecklist.created_at)))
    return result.scalars().all()

@router.post("", response_model=OnboardingChecklistResponse)
async def create_onboarding_checklist(
    in_data: OnboardingChecklistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusOnboardingChecklist(**in_data.model_dump(), user_id=current_user.id)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=OnboardingChecklistResponse)
async def update_onboarding_checklist(
    item_id: int,
    in_data: OnboardingChecklistUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusOnboardingChecklist).where(
        VenusOnboardingChecklist.id == item_id, VenusOnboardingChecklist.user_id == current_user.id
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
async def delete_onboarding_checklist(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusOnboardingChecklist).where(
        VenusOnboardingChecklist.id == item_id, VenusOnboardingChecklist.user_id == current_user.id
    ))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
    return {"ok": True}
