from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.ads.ad_account import AdAccount
from app.schemas.ads.ad_account import AdAccountCreate, AdAccountUpdate, AdAccountResponse
from app.dependencies.permissions import require_company_permission

router = APIRouter(tags=["Ads Panel Accounts"])

@router.get("", response_model=List[AdAccountResponse])
async def get_ad_accounts(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("ads", "view"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(AdAccount)
    elif effective_project_id:
        query = select(AdAccount).where(AdAccount.project_id == effective_project_id)
    else:
        query = select(AdAccount).where(AdAccount.user_id == current_user.id)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=AdAccountResponse)
async def create_ad_account(
    account: AdAccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("ads", "edit"))
):
    new_account = AdAccount(**account.model_dump(), user_id=current_user.id)
    db.add(new_account)
    await db.commit()
    await db.refresh(new_account)
    return new_account

@router.put("/{account_id}", response_model=AdAccountResponse)
async def update_ad_account(
    account_id: int,
    account_update: AdAccountUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("ads", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(AdAccount).where(AdAccount.id == account_id)
    elif effective_project_id:
        query = select(AdAccount).where(AdAccount.id == account_id, AdAccount.project_id == effective_project_id)
    else:
        query = select(AdAccount).where(AdAccount.id == account_id, AdAccount.user_id == current_user.id)
        
    result = await db.execute(query)
    db_account = result.scalar_one_or_none()
    
    if not db_account:
        raise HTTPException(status_code=404, detail="Ad account not found")
        
    for key, value in account_update.model_dump(exclude_unset=True).items():
        setattr(db_account, key, value)
        
    await db.commit()
    await db.refresh(db_account)
    return db_account

@router.delete("/{account_id}")
async def delete_ad_account(
    account_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("ads", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(AdAccount).where(AdAccount.id == account_id)
    elif effective_project_id:
        query = select(AdAccount).where(AdAccount.id == account_id, AdAccount.project_id == effective_project_id)
    else:
        query = select(AdAccount).where(AdAccount.id == account_id, AdAccount.user_id == current_user.id)
        
    result = await db.execute(query)
    db_account = result.scalar_one_or_none()
    
    if not db_account:
        raise HTTPException(status_code=404, detail="Ad account not found")
        
    await db.delete(db_account)
    await db.commit()
    return {"ok": True}
