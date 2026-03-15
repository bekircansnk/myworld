from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.experiment import VenusExperiment
from app.schemas.venus.experiment import ExperimentCreate, ExperimentUpdate, ExperimentResponse

router = APIRouter(prefix="/venus/experiments", tags=["Venus Ads Experiments"])

@router.get("", response_model=List[ExperimentResponse])
def get_experiments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[int] = None,
    campaign_id: Optional[int] = None
):
    query = db.query(VenusExperiment).filter(VenusExperiment.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusExperiment.project_id == project_id)
    if campaign_id:
        query = query.filter(VenusExperiment.campaign_id == campaign_id)
        
    return query.order_by(VenusExperiment.id.desc()).all()

@router.post("", response_model=ExperimentResponse)
def create_experiment(
    experiment: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_experiment = VenusExperiment(**experiment.model_dump(), user_id=current_user.id)
    db.add(new_experiment)
    db.commit()
    db.refresh(new_experiment)
    return new_experiment

@router.put("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: int,
    experiment_update: ExperimentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_exp = db.query(VenusExperiment).filter(VenusExperiment.id == experiment_id, VenusExperiment.user_id == current_user.id).first()
    
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    for key, value in experiment_update.model_dump(exclude_unset=True).items():
        setattr(db_exp, key, value)
        
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.delete("/{experiment_id}")
def delete_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_exp = db.query(VenusExperiment).filter(VenusExperiment.id == experiment_id, VenusExperiment.user_id == current_user.id).first()
    
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    db.delete(db_exp)
    db.commit()
    return {"ok": True}
