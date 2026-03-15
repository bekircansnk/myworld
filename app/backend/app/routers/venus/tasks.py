from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.ads_task import VenusAdsTask
from app.schemas.venus.ads_task import AdsTaskCreate, AdsTaskUpdate, AdsTaskResponse

from pydantic import BaseModel
from app.services.venus.ai_analyzer import generate_ai_task_notes

# main.py provides prefix=""
router = APIRouter(tags=["Venus Ads Tasks"])

class TaskAiNoteRequest(BaseModel):
    title: str
    description: Optional[str] = None
    campaign_name: Optional[str] = None
    experiment_name: Optional[str] = None
    creative_name: Optional[str] = None

@router.post("/ai-notes")
async def get_task_ai_notes(
    req: TaskAiNoteRequest,
    current_user: User = Depends(get_current_user)
):
    note = await generate_ai_task_notes(
        title=req.title,
        description=req.description or "",
        campaign_name=req.campaign_name,
        experiment_name=req.experiment_name,
        creative_name=req.creative_name
    )
    return {"ai_notes": note}


@router.get("", response_model=List[AdsTaskResponse])
async def get_tasks(
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VenusAdsTask).where(VenusAdsTask.user_id == current_user.id)
    if project_id:
        query = query.where(VenusAdsTask.project_id == project_id)
    
    result = await db.execute(query.order_by(desc(VenusAdsTask.created_at)))
    return result.scalars().all()

@router.post("", response_model=AdsTaskResponse)
async def create_task(
    task_in: AdsTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_task = VenusAdsTask(**task_in.model_dump(), user_id=current_user.id)
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=AdsTaskResponse)
async def update_task(
    task_id: int,
    task_in: AdsTaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusAdsTask).where(
        VenusAdsTask.id == task_id, VenusAdsTask.user_id == current_user.id
    ))
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusAdsTask).where(
        VenusAdsTask.id == task_id, VenusAdsTask.user_id == current_user.id
    ))
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    return {"ok": True}
