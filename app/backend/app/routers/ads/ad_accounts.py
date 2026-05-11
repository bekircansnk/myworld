from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.ads.ad_account import AdAccount
from app.schemas.ads.ad_account import AdAccountCreate, AdAccountUpdate, AdAccountResponse

router = APIRouter(tags=["Ads Panel Accounts"])

@router.get("", response_model=List[AdAccountResponse])
async def get_ad_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id: Optional[int] = None
):
    query = select(AdAccount).where(AdAccount.user_id == current_user.id)
    if project_id:
        query = query.where(AdAccount.project_id == project_id)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=AdAccountResponse)
async def create_ad_account(
    account: AdAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AdAccount).where(AdAccount.id == account_id, AdAccount.user_id == current_user.id))
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AdAccount).where(AdAccount.id == account_id, AdAccount.user_id == current_user.id))
    db_account = result.scalar_one_or_none()
    
    if not db_account:
        raise HTTPException(status_code=404, detail="Ad account not found")
        
    await db.delete(db_account)
    await db.commit()
    return {"ok": True}
