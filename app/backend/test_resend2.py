import asyncio
from app.services.email_service import send_email

async def test():
    result = await send_email(
        to="sagnakbekircan@gmail.com",
        subject="Resend Verified Domain Test",
        html_body="<p>E-posta testiniz basarili! <b>info@pikselai.com</b> uzerinden gonderiliyor.</p>"
    )
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test())
