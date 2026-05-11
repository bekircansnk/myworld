from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.ads.campaign import AdCampaign
from app.schemas.ads.campaign import CampaignCreate, CampaignUpdate, CampaignResponse

router = APIRouter(tags=["Ads Panel Campaigns"])

@router.get("", response_model=List[CampaignResponse])
async def get_campaigns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("venus_ads", "view")),
    project_id: Optional[int] = None,
    platform: Optional[str] = None
):
    query = select(AdCampaign).where(AdCampaign.user_id == current_user.id)
    if project_id:
        query = query.where(AdCampaign.project_id == project_id)
    if platform:
        query = query.where(AdCampaign.platform == platform)
        
    result = await db.execute(query.order_by(AdCampaign.id.desc()))
    return result.scalars().all()

@router.post("", response_model=CampaignResponse)
async def create_campaign(
    campaign: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("venus_ads", "edit"))
):
    new_campaign = AdCampaign(**campaign.model_dump(), user_id=current_user.id)
    db.add(new_campaign)
    await db.commit()
    await db.refresh(new_campaign)
    return new_campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: int,
    campaign_update: CampaignUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("venus_ads", "edit"))
):
    result = await db.execute(select(AdCampaign).where(AdCampaign.id == campaign_id, AdCampaign.user_id == current_user.id))
    db_campaign = result.scalar_one_or_none()
    
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    for key, value in campaign_update.model_dump(exclude_unset=True).items():
        setattr(db_campaign, key, value)
        
    await db.commit()
    await db.refresh(db_campaign)
    return db_campaign

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AdCampaign).where(AdCampaign.id == campaign_id, AdCampaign.user_id == current_user.id))
    db_campaign = result.scalar_one_or_none()
    
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    await db.delete(db_campaign)
    await db.commit()
    return {"ok": True}
