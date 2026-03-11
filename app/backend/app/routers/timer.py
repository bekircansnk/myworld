from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timezone
import math
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.models.timer_session import TimerSession

router = APIRouter()

class TimerStartRequest(BaseModel):
    task_id: Optional[int] = None
    break_type: str = "work"  # 'work', 'short_break', 'long_break'

class TimerStopRequest(BaseModel):
    session_id: int
    notes: Optional[str] = None

class TimerSessionResponse(BaseModel):
    id: int
    user_id: int
    task_id: Optional[int] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    break_type: str
    notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

MOCK_USER_ID = 1

@router.post("/start", response_model=TimerSessionResponse)
async def start_timer(request: TimerStartRequest, db: AsyncSession = Depends(get_db)):
    """Yeni bir çalışma veya mola oturumu başlatır."""
    new_session = TimerSession(
        user_id=MOCK_USER_ID,
        task_id=request.task_id,
        start_time=datetime.now(timezone.utc),
        break_type=request.break_type,
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

@router.post("/stop", response_model=TimerSessionResponse)
async def stop_timer(request: TimerStopRequest, db: AsyncSession = Depends(get_db)):
    """Açık olan oturumu kapatır ve geçen süreyi hesaplar."""
    query = select(TimerSession).where(TimerSession.id == request.session_id, TimerSession.user_id == MOCK_USER_ID)
    result = await db.execute(query)
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")
        
    if session.end_time:
        raise HTTPException(status_code=400, detail="Session is already stopped")
        
    session.end_time = datetime.now(timezone.utc)
    
    # Süre hesaplama (dakika bazında yuvarla)
    delta = session.end_time - session.start_time
    session.duration_minutes = math.ceil(delta.total_seconds() / 60)
    
    if request.notes:
        session.notes = request.notes
        
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/history", response_model=List[TimerSessionResponse])
async def get_timer_history(db: AsyncSession = Depends(get_db), limit: int = 50):
    """Kullanıcının geçmiş timer oturumlarını getirir."""
    query = select(TimerSession).where(TimerSession.user_id == MOCK_USER_ID).order_by(TimerSession.start_time.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
