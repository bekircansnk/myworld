from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])

from app.dependencies.auth import get_current_user
from app.models.user import User

@router.get("/", response_model=List[ProjectResponse])
async def read_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0, 
    limit: int = 100
):
    query = select(Project).where(Project.user_id == current_user.id).order_by(Project.sort_order.asc(), Project.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = Project(**project.model_dump(), user_id=current_user.id)
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int, 
    project_update: ProjectUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    result = await db.execute(query)
    db_project = result.scalars().first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
        
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
async def delete_project(
    project_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    result = await db.execute(query)
    db_project = result.scalars().first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
        
    await db.delete(db_project)
    await db.commit()
    return {"status": "ok", "message": "Project deleted successfully"}
