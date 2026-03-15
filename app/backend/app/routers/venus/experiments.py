from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.experiment import VenusExperiment
from app.schemas.venus.experiment import ExperimentCreate, ExperimentUpdate, ExperimentResponse

router = APIRouter(tags=["Venus Ads Experiments"])

@router.get("", response_model=List[ExperimentResponse])
async def get_experiments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[int] = None,
    campaign_id: Optional[int] = None
):
    query = select(VenusExperiment).where(VenusExperiment.user_id == current_user.id)
    if project_id:
        query = query.where(VenusExperiment.project_id == project_id)
    if campaign_id:
        query = query.where(VenusExperiment.campaign_id == campaign_id)
        
    result = await db.execute(query.order_by(VenusExperiment.id.desc()))
    return result.scalars().all()

@router.post("", response_model=ExperimentResponse)
async def create_experiment(
    experiment: ExperimentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_experiment = VenusExperiment(**experiment.model_dump(), user_id=current_user.id)
    db.add(new_experiment)
    await db.commit()
    await db.refresh(new_experiment)
    return new_experiment

@router.put("/{experiment_id}", response_model=ExperimentResponse)
async def update_experiment(
    experiment_id: int,
    experiment_update: ExperimentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusExperiment).where(VenusExperiment.id == experiment_id, VenusExperiment.user_id == current_user.id))
    db_exp = result.scalar_one_or_none()
    
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    for key, value in experiment_update.model_dump(exclude_unset=True).items():
        setattr(db_exp, key, value)
        
    await db.commit()
    await db.refresh(db_exp)
    return db_exp

@router.delete("/{experiment_id}")
async def delete_experiment(
    experiment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(VenusExperiment).where(VenusExperiment.id == experiment_id, VenusExperiment.user_id == current_user.id))
    db_exp = result.scalar_one_or_none()
    
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    await db.delete(db_exp)
    await db.commit()
    return {"ok": True}
