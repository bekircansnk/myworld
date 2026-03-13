import asyncio
from app.database import SessionLocal
from app.models.user import User
from app.dependencies.auth import get_password_hash

async def test():
    async with SessionLocal() as db:
        print("Hashing password...")
        hashed = get_password_hash("password123")
        print("Hash length:", len(hashed))
        print("Creating User...")
        new_user = User(username="Bekircan", password_hash=hashed, name="Bekircan")
        db.add(new_user)
        try:
            await db.commit()
            print("Successfully committed!")
        except Exception as e:
            print("Commit failed:", e)

asyncio.run(test())
