from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import httpx
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_company_permission
from app.models.user import User
from app.models.project import Project
from app.routers.websocket import manager

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

# Firma ID (project_id) -> Toplantı Detayları (In-Memory)
active_meetings: Dict[int, Dict[str, Any]] = {}

@router.post("/start", response_model=dict)
async def start_meeting(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    project_id = getattr(request.state, "project_id", None)
    if not project_id:
        raise HTTPException(status_code=400, detail="Firma (Proje) seçilmelidir.")

    # Eğer zaten aktif bir toplantı varsa onu dön
    if project_id in active_meetings:
        return active_meetings[project_id]

    daily_api_key = os.getenv("DAILY_API_KEY")
    room_url = None
    room_name = f"planla_room_{project_id}_{uuid.uuid4().hex[:8]}"

    # Daily.co API ile oda oluştur
    if daily_api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {
                    "Authorization": f"Bearer {daily_api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "name": room_name,
                    "properties": {
                        "enable_chat": True,
                        "enable_screenshare": True,
                        "exp": int(datetime.now(timezone.utc).timestamp()) + 7200 # 2 saat geçerli
                    }
                }
                resp = await client.post("https://api.daily.co/v1/rooms", json=payload, headers=headers)
                if resp.status_code == 201 or resp.status_code == 200:
                    room_data = resp.json()
                    room_url = room_data.get("url")
                else:
                    # Hata varsa logla ve fallback'e geç
                    print(f"Daily.co API error: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Daily.co API connection failed: {e}")

    # Fallback: API Key yoksa veya API hata verdiyse 100% çalışan ücretsiz Jitsi Meet odası oluştur
    if not room_url:
        # Jitsi Meet API key veya kurulum istemez, doğrudan iframe içinde çalışır ve odayı anında yaratır.
        room_url = f"https://meet.ffmuc.net/Planla_Meeting_{project_id}_{uuid.uuid4().hex[:8]}#config.prejoinPageEnabled=false&config.lobby.enabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true"

    meeting_data = {
        "project_id": project_id,
        "url": room_url,
        "started_by": current_user.name,
        "started_at": datetime.now(timezone.utc).isoformat()
    }

    # Belleğe kaydet
    active_meetings[project_id] = meeting_data

    # WebSocket ile aynı firmadaki üyelere haber ver
    ws_payload = {
        "type": "MEETING_STARTED",
        "data": meeting_data
    }
    background_tasks.add_task(manager.broadcast, ws_payload)

    return meeting_data

@router.get("/active", response_model=dict)
async def get_active_meeting(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    project_id = getattr(request.state, "project_id", None)
    if not project_id:
        return {"active": False}

    if project_id in active_meetings:
        return {
            "active": True,
            "meeting": active_meetings[project_id]
        }
    return {"active": False}

@router.post("/stop", response_model=dict)
async def stop_meeting(
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    project_id = getattr(request.state, "project_id", None)
    if not project_id:
        raise HTTPException(status_code=400, detail="Firma seçilmelidir.")

    if project_id in active_meetings:
        # Bellekten sil
        del active_meetings[project_id]

        # WebSocket ile herkese haber ver
        ws_payload = {
            "type": "MEETING_ENDED",
            "data": {
                "project_id": project_id
            }
        }
        background_tasks.add_task(manager.broadcast, ws_payload)
        return {"status": "ok", "message": "Toplantı sonlandırıldı."}

    return {"status": "ok", "message": "Aktif toplantı bulunamadı."}
