from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.competitor import VenusCompetitor
from app.schemas.venus.competitor import CompetitorCreate, CompetitorUpdate, CompetitorResponse

router = APIRouter(tags=["Venus Ads Competitors"])

@router.get("", response_model=List[CompetitorResponse])
async def get_competitors(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VenusCompetitor).where(VenusCompetitor.user_id == current_user.id)
    if project_id:
        query = query.where(VenusCompetitor.project_id == project_id)
        
    result = await db.execute(query.order_by(desc(VenusCompetitor.created_at)))
    return result.scalars().all()

@router.post("", response_model=CompetitorResponse)
async def create_competitor(
    in_data: CompetitorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusCompetitor(**in_data.model_dump(), user_id=current_user.id)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=CompetitorResponse)
async def update_competitor(
    item_id: int,
    in_data: CompetitorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusCompetitor).where(
        VenusCompetitor.id == item_id, VenusCompetitor.user_id == current_user.id
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
async def delete_competitor(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusCompetitor).where(
        VenusCompetitor.id == item_id, VenusCompetitor.user_id == current_user.id
    ))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
    return {"ok": True}
