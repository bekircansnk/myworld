from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity_log import ActivityLog
from fastapi import Request

async def log_activity(
    db: AsyncSession, 
    user_id: int | None, 
    action: str, 
    module: str, 
    details: dict = None, 
    request: Request = None
):
    """
    Sistem içindeki eylemleri kaydetmek için yardımcı fonksiyon
    """
    ip_address = None
    if request and request.client:
        ip_address = request.client.host

    log_entry = ActivityLog(
        user_id=user_id,
        action=action,
        module=module,
        details=details or {},
        ip_address=ip_address
    )
    
    db.add(log_entry)
    await db.commit()
    return log_entry
