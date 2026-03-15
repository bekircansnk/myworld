from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.ai_observation import VenusAIObservation
from app.schemas.venus.ai_observation import AIObservationCreate, AIObservationUpdate, AIObservationResponse

router = APIRouter(tags=["Venus Ads AI Observations"])

@router.post("/generate-daily")
async def generate_daily_ai_summary(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.venus.ai_analyzer import generate_daily_summary
    result = await generate_daily_summary(db, current_user.id, project_id)
    
    # Save as observation
    if not result.get("error"):
        obs = VenusAIObservation(
            user_id=current_user.id,
            project_id=project_id,
            observation_type="trend",
            title="Günlük AI Özeti",
            content=result.get("summary", ""),
            severity="info",
            is_acknowledged=False
        )
        db.add(obs)
        await db.commit()
        await db.refresh(obs)
        
    return result

@router.post("/analyze-campaign/{campaign_id}")
async def analyze_campaign_with_ai(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.venus.ai_analyzer import generate_campaign_analysis
    result = await generate_campaign_analysis(db, campaign_id, current_user.id)
    
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
        
    # Create observations for issues and suggestions
    for issue in result.get("issues", []):
        obs = VenusAIObservation(
            user_id=current_user.id,
            campaign_id=campaign_id,
            observation_type="anomaly",
            title="Kampanya Sorunu Tespiti",
            content=issue,
            severity="warning",
            is_acknowledged=False
        )
        db.add(obs)
        
    for suggestion in result.get("suggestions", []):
        obs = VenusAIObservation(
            user_id=current_user.id,
            campaign_id=campaign_id,
            observation_type="suggestion",
            title="Optimizasyon Önerisi",
            content=suggestion,
            severity="opportunity",
            is_acknowledged=False
        )
        db.add(obs)
        
    await db.commit()
    return result

@router.get("", response_model=List[AIObservationResponse])
async def get_ai_observations(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VenusAIObservation).where(VenusAIObservation.user_id == current_user.id)
    if project_id:
        query = query.where(VenusAIObservation.project_id == project_id)
        
    result = await db.execute(query.order_by(desc(VenusAIObservation.created_at)))
    return result.scalars().all()

@router.post("", response_model=AIObservationResponse)
async def create_ai_observation(
    in_data: AIObservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_item = VenusAIObservation(**in_data.model_dump(), user_id=current_user.id)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=AIObservationResponse)
async def update_ai_observation(
    item_id: int,
    in_data: AIObservationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusAIObservation).where(
        VenusAIObservation.id == item_id, VenusAIObservation.user_id == current_user.id
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
async def delete_ai_observation(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusAIObservation).where(
        VenusAIObservation.id == item_id, VenusAIObservation.user_id == current_user.id
    ))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
    return {"ok": True}
