import asyncio
import sys
import os

# app modüllerine erişebilmek için path ekle
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def fix_admin_user():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.username == "bekir"))
        user = result.scalars().first()
        if user:
            user.is_active = True
            user.role = "super_admin"
            from app.models.role_templates import FULL_PERMISSIONS
            user.permissions = FULL_PERMISSIONS
            await session.commit()
            print(f"Başarılı: {user.username} kullanıcısı super_admin yapıldı ve aktif edildi.")
        else:
            # Eğer kullanıcı yoksa en azından 1. kullanıcıyı super_admin yap
            result = await session.execute(select(User))
            first_user = result.scalars().first()
            if first_user:
                first_user.is_active = True
                first_user.role = "super_admin"
                from app.models.role_templates import FULL_PERMISSIONS
                first_user.permissions = FULL_PERMISSIONS
                await session.commit()
                print(f"Başarılı: {first_user.username} kullanıcısı super_admin yapıldı ve aktif edildi.")
            else:
                print("Hata: Sistemde hiç kullanıcı bulunamadı.")

if __name__ == "__main__":
    asyncio.run(fix_admin_user())
