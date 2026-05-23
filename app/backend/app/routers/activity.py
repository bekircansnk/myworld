from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_company_permission
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.activity import ActivityLogResponse

router = APIRouter(prefix="/api/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityLogResponse])
async def read_activities(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "view"))
):
    project_id = getattr(request.state, "project_id", None)
    if not project_id:
        raise HTTPException(status_code=400, detail="Firma seçilmelidir.")

    # Firma bazındaki son 20 aktiviteyi getir
    query = (
        select(ActivityLog)
        .options(selectinload(ActivityLog.user))
        .where(ActivityLog.project_id == project_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(20)
    )
    result = await db.execute(query)
    activities = result.scalars().all()
    
    return activities
