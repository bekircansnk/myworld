import asyncio
import httpx
from app.config import settings

async def test():
    headers = {
        "Authorization": f"Bearer {settings.resend_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": f"Pikseliş <info@pikselai.com>",
        "to": ["sagnakbekircan@gmail.com"],
        "subject": "Resend Verified Domain Test",
        "html": "<p>E-posta testiniz basarili!</p>"
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post("https://api.resend.com/emails", json=payload, headers=headers)
        print(response.status_code)
        print(response.text)

if __name__ == "__main__":
    asyncio.run(test())
