from datetime import datetime
from dateutil import tz

def get_user_timezone(user) -> str:
    """Kullanıcının tercih ettiği saat dilimini döndürür."""
    if user and getattr(user, "timezone", None):
        return user.timezone
    return "Europe/Istanbul"

def get_current_time_for_user(user) -> datetime:
    """Kullanıcının yerel saatine göre şu anki zamanı döndürür."""
    tz_str = get_user_timezone(user)
    local_zone = tz.gettz(tz_str)
    if not local_zone: # fallback to Istanbul
        local_zone = tz.gettz("Europe/Istanbul")
    
    return datetime.now().astimezone(local_zone)

def utc_to_local(dt: datetime, timezone_str: str) -> datetime:
    """UTC zamanı yerel zamana çevirir."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=tz.UTC)
    local_zone = tz.gettz(timezone_str)
    if not local_zone:
        local_zone = tz.gettz("Europe/Istanbul")
    return dt.astimezone(local_zone)

def local_to_utc(dt: datetime, timezone_str: str) -> datetime:
    """Yerel zamanı UTC'ye çevirir."""
    if dt.tzinfo is None:
        local_zone = tz.gettz(timezone_str)
        if not local_zone:
            local_zone = tz.gettz("Europe/Istanbul")
        dt = dt.replace(tzinfo=local_zone)
    return dt.astimezone(tz.UTC)

