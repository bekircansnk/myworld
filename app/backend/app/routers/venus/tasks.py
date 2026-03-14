from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.venus.ads_task import VenusAdsTask
from app.schemas.venus.ads_task import AdsTaskCreate, AdsTaskUpdate, AdsTaskResponse

router = APIRouter()

@router.get("/", response_model=List[AdsTaskResponse])
def get_tasks(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VenusAdsTask).filter(VenusAdsTask.user_id == current_user.id)
    if project_id:
        query = query.filter(VenusAdsTask.project_id == project_id)
    return query.order_by(desc(VenusAdsTask.created_at)).all()

@router.post("/", response_model=AdsTaskResponse)
def create_task(
    task_in: AdsTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_task = VenusAdsTask(**task_in.dict(), user_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=AdsTaskResponse)
def update_task(
    task_id: int,
    task_in: AdsTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(VenusAdsTask).filter(
        VenusAdsTask.id == task_id, VenusAdsTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in task_in.dict(exclude_unset=True).items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(VenusAdsTask).filter(
        VenusAdsTask.id == task_id, VenusAdsTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"ok": True}
