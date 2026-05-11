from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.ads.creative import AdCreative
from app.schemas.ads.creative import CreativeCreate, CreativeUpdate, CreativeResponse

router = APIRouter(tags=["Ads Panel Creatives"])

@router.get("", response_model=List[CreativeResponse])
async def get_creatives(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[int] = None
):
    query = select(AdCreative).where(AdCreative.user_id == current_user.id)
    if project_id:
        query = query.where(AdCreative.project_id == project_id)
        
    result = await db.execute(query.order_by(AdCreative.id.desc()))
    return result.scalars().all()

@router.post("", response_model=CreativeResponse)
async def create_creative(
    creative: CreativeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_creative = AdCreative(**creative.model_dump(), user_id=current_user.id)
    db.add(new_creative)
    await db.commit()
    await db.refresh(new_creative)
    return new_creative

@router.put("/{creative_id}", response_model=CreativeResponse)
async def update_creative(
    creative_id: int,
    creative_update: CreativeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AdCreative).where(AdCreative.id == creative_id, AdCreative.user_id == current_user.id))
    db_creative = result.scalar_one_or_none()
    
    if not db_creative:
        raise HTTPException(status_code=404, detail="Creative not found")
        
    for key, value in creative_update.model_dump(exclude_unset=True).items():
        setattr(db_creative, key, value)
        
    await db.commit()
    await db.refresh(db_creative)
    return db_creative

@router.delete("/{creative_id}")
async def delete_creative(
    creative_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AdCreative).where(AdCreative.id == creative_id, AdCreative.user_id == current_user.id))
    db_creative = result.scalar_one_or_none()
    
    if not db_creative:
        raise HTTPException(status_code=404, detail="Creative not found")
        
    await db.delete(db_creative)
    await db.commit()
    return {"ok": True}
