from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.campaign import VenusCampaign
from app.schemas.venus.campaign import CampaignCreate, CampaignUpdate, CampaignResponse

router = APIRouter(prefix="/venus/campaigns", tags=["Venus Ads Campaigns"])

@router.get("", response_model=List[CampaignResponse])
def get_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[int] = None,
    platform: Optional[str] = None
):
    query = db.query(VenusCampaign).filter(VenusCampaign.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusCampaign.project_id == project_id)
    if platform:
        query = query.filter(VenusCampaign.platform == platform)
        
    return query.order_by(VenusCampaign.id.desc()).all()

@router.post("", response_model=CampaignResponse)
def create_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_campaign = VenusCampaign(**campaign.model_dump(), user_id=current_user.id)
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    return new_campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    campaign_update: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_campaign = db.query(VenusCampaign).filter(VenusCampaign.id == campaign_id, VenusCampaign.user_id == current_user.id).first()
    
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    for key, value in campaign_update.model_dump(exclude_unset=True).items():
        setattr(db_campaign, key, value)
        
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.delete("/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_campaign = db.query(VenusCampaign).filter(VenusCampaign.id == campaign_id, VenusCampaign.user_id == current_user.id).first()
    
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    db.delete(db_campaign)
    db.commit()
    return {"ok": True}
