from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import logging
from jose import jwt
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        # user_id -> List[WebSocket]
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected via WebSocket. Active users: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected from WebSocket")

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            message_str = json.dumps(message)
            dead_connections = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    logger.error(f"Error notifying user {user_id}: {e}")
                    dead_connections.append(connection)
            
            for dead_conn in dead_connections:
                self.disconnect(dead_conn, user_id)

    async def broadcast(self, message: dict):
        message_str = json.dumps(message)
        for user_id in list(self.active_connections.keys()):
            await self.broadcast_to_user(user_id, message)

manager = ConnectionManager()

@router.websocket("/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    user_id = None
    try:
        # Token doğrulama
        if token:
            try:
                payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
                # sub genelde username'dir (auth.py'ye göre)
                username = payload.get("sub")
                if username:
                    from app.database import AsyncSessionLocal
                    from app.models.user import User
                    from sqlalchemy import select
                    async with AsyncSessionLocal() as session:
                        res = await session.execute(select(User.id).where(User.username == username))
                        user_id = res.scalar()
            except Exception as e:
                logger.error(f"WS Token Decode Error: {e}")
        
        if not user_id:
            logger.warning("WS Connection rejected: Invalid token")
            await websocket.close(code=4003) # Unauthorized
            return

        await manager.connect(websocket, user_id)
        
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        if user_id:
            manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket Runtime Error: {e}")
        if user_id:
            manager.disconnect(websocket, user_id)
