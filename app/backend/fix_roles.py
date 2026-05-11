"""
Mevcut NULL role kayıtlarını 'viewer' olarak günceller.
Sistemde role = NULL olan kullanıcılar giriş yapamaz.
"""
import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def fix_roles():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        fixed = 0
        for user in users:
            if not user.role or user.role == "None" or user.role == "none":
                user.role = "viewer"
                user.is_active = True
                user.permissions = {}
                fixed += 1
                print(f"  Düzeltildi: {user.username} → viewer + aktif")
            else:
                print(f"  OK: {user.username} → {user.role} (is_active={user.is_active})")
        
        if fixed > 0:
            await session.commit()
            print(f"\n✓ {fixed} kullanıcı düzeltildi.")
        else:
            print("\n✓ Düzeltilecek kayıt yok, hepsi düzgün.")

if __name__ == "__main__":
    asyncio.run(fix_roles())
