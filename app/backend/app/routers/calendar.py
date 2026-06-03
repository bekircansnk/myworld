from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.calendar_event import CalendarEvent
from app.schemas.calendar import CalendarEventCreate, CalendarEventUpdate, CalendarEventResponse
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_company_permission
from app.models.user import User
from app.services.location_service import local_to_utc, utc_to_local, get_user_timezone

router = APIRouter(prefix="/calendar/events", tags=["calendar"])

def convert_to_response(db_event: CalendarEvent) -> CalendarEventResponse:
    # DB: start_time, end_time, event_type
    # Frontend: date, startTime, endTime, category
    tz_str = db_event.user.timezone if getattr(db_event, "user", None) and getattr(db_event.user, "timezone", None) else "Europe/Istanbul"
    start_local = utc_to_local(db_event.start_time, tz_str)
    end_local = utc_to_local(db_event.end_time, tz_str)
    
    date_str = start_local.strftime("%Y-%m-%d")
    start_str = start_local.strftime("%H:%M")
    end_str = end_local.strftime("%H:%M")
    
    return CalendarEventResponse(
        id=db_event.id,
        user_id=db_event.user_id,
        title=db_event.title,
        description=db_event.description,
        date=date_str,
        startTime=start_str,
        endTime=end_str,
        allDay=db_event.is_all_day,
        color="blue", # Default until we do a DB migration
        category=db_event.event_type or "task",
        taskId=db_event.task_id,
        noteId=db_event.note_id,
        isCompleted=db_event.is_completed,
        project_id=db_event.project_id,
        created_at=db_event.created_at,
        updated_at=db_event.updated_at
    )

@router.post("", response_model=CalendarEventResponse)
async def create_event(
    event: CalendarEventCreate, 
    request: Request,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_company_permission("calendar", "edit"))
):
    # Parse frontend format to DB format
    start_time_str = f"{event.date}T{event.startTime or '00:00'}:00"
    end_time_str = f"{event.date}T{event.endTime or '23:59'}:00"
    
    start_dt = datetime.fromisoformat(start_time_str)
    end_dt = datetime.fromisoformat(end_time_str)
    
    user_tz = get_user_timezone(current_user)
    start_dt = local_to_utc(start_dt, user_tz)
    end_dt = local_to_utc(end_dt, user_tz)
        
    db_event = CalendarEvent(
        user_id=current_user.id,
        title=event.title,
        description=event.description,
        start_time=start_dt,
        end_time=end_dt,
        is_all_day=event.allDay or False,
        event_type=event.category,
        task_id=event.taskId,
        note_id=event.noteId,
        is_completed=event.isCompleted or False,
        project_id=event.project_id
    )
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    try:
        from app.routers.websocket import manager
        await manager.broadcast({"type": "calendar_update", "project_id": db_event.project_id})
    except Exception as e:
        logger.error(f"Failed to broadcast calendar event creation: {e}")
        
    return convert_to_response(db_event)

@router.get("", response_model=List[CalendarEventResponse])
async def list_events(
    project_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_company_permission("calendar", "view"))
):
    # Firma bazlı filtreleme
    if project_id:
        result = await db.execute(select(CalendarEvent).where(CalendarEvent.project_id == project_id))
    else:
        result = await db.execute(select(CalendarEvent).where(CalendarEvent.user_id == current_user.id))
    events = result.scalars().all()
    return [convert_to_response(e) for e in events]

@router.put("/{event_id}", response_model=CalendarEventResponse)
async def update_event(
    event_id: int, 
    event: CalendarEventUpdate, 
    request: Request,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_company_permission("calendar", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(CalendarEvent).where(CalendarEvent.id == event_id)
    elif effective_project_id:
        query = select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.project_id == effective_project_id)
    else:
        query = select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id)
        
    result = await db.execute(query)
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    user_tz = get_user_timezone(current_user)
    date_val = event.date or utc_to_local(db_event.start_time, user_tz).strftime("%Y-%m-%d")
    start_val = event.startTime or utc_to_local(db_event.start_time, user_tz).strftime("%H:%M")
    end_val = event.endTime or utc_to_local(db_event.end_time, user_tz).strftime("%H:%M")
    
    new_start_dt = datetime.fromisoformat(f"{date_val}T{start_val}:00")
    new_end_dt = datetime.fromisoformat(f"{date_val}T{end_val}:00")
    
    db_event.start_time = local_to_utc(new_start_dt, user_tz)
    db_event.end_time = local_to_utc(new_end_dt, user_tz)
    
    if event.title is not None: db_event.title = event.title
    if event.description is not None: db_event.description = event.description
    if event.allDay is not None: db_event.is_all_day = event.allDay
    if event.category is not None: db_event.event_type = event.category
    if event.isCompleted is not None: db_event.is_completed = event.isCompleted
    if event.taskId is not None: db_event.task_id = event.taskId
    if event.noteId is not None: db_event.note_id = event.noteId
        
    await db.commit()
    await db.refresh(db_event)
    
    try:
        from app.routers.websocket import manager
        await manager.broadcast({"type": "calendar_update", "project_id": db_event.project_id})
    except Exception as e:
        logger.error(f"Failed to broadcast calendar event update: {e}")
        
    return convert_to_response(db_event)

@router.delete("/{event_id}")
async def delete_event(
    event_id: int, 
    request: Request,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_company_permission("calendar", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(CalendarEvent).where(CalendarEvent.id == event_id)
    elif effective_project_id:
        query = select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.project_id == effective_project_id)
    else:
        query = select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id)
        
    result = await db.execute(query)
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    await db.delete(db_event)
    await db.commit()
    
    try:
        from app.routers.websocket import manager
        await manager.broadcast({"type": "calendar_update", "project_id": db_event.project_id})
    except Exception as e:
        logger.error(f"Failed to broadcast calendar event deletion: {e}")
        
    return {"message": "Event deleted successfully"}
