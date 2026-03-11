import httpx
from app.config import settings

async def send_telegram_message(text: str, chat_id: str = None) -> bool:
    """
    Belirtilen Telegram chat_id'sine (veya varsayılan admin'e) mesaj gönderir.
    Eğer telegram token yoksa false döner (kurulumda sorun yaşanmaması için configte ignore edilmiş olabilir).
    """
    if not settings.telegram_bot_token or settings.telegram_bot_token == "YOUR_TELEGRAM_BOT_TOKEN":
        print(f"Telegram Token eksik. Mesaj yollanamadı: {text}")
        return False
        
    target_chat_id = chat_id or settings.telegram_admin_id
    if not target_chat_id or target_chat_id == "YOUR_TELEGRAM_ADMIN_ID":
        print(f"Telegram Admin ID eksik. Mesaj yollanamadı: {text}")
        return False

    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    payload = {
        "chat_id": target_chat_id,
        "text": text,
        "parse_mode": "HTML"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            if response.status_code == 200:
                return True
            else:
                print(f"Telegram Hatası: {response.text}")
                return False
    except Exception as e:
        print(f"Telegram Servis Hatası: {e}")
        return False
