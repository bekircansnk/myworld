import asyncio
from app.services.email_service import send_email

async def test():
    result = await send_email(
        to="sagnakbekircan@gmail.com",
        subject="Resend API Test",
        html_body="<p>Test successful!</p>"
    )
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test())
