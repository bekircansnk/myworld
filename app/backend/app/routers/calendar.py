from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.calendar_event import CalendarEvent
from app.schemas.calendar import CalendarEventCreate, CalendarEventUpdate, CalendarEventResponse
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/calendar/events", tags=["calendar"])

@router.post("", response_model=CalendarEventResponse)
async def create_event(event: CalendarEventCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_event = CalendarEvent(**event.dict(), user_id=current_user.id)
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event

@router.get("", response_model=List[CalendarEventResponse])
async def list_events(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(CalendarEvent).where(CalendarEvent.user_id == current_user.id))
    return result.scalars().all()

@router.put("/{event_id}", response_model=CalendarEventResponse)
async def update_event(event_id: int, event: CalendarEventUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id))
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    for key, value in event.dict(exclude_unset=True).items():
        setattr(db_event, key, value)
        
    await db.commit()
    await db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id))
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    await db.delete(db_event)
    await db.commit()
    return {"message": "Event deleted successfully"}
