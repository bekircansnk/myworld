"""
DB Migration: viewer kullanıcıları admin'e çevir, permissions doldur.
Tarih: 2026-05-12
"""
import asyncio
import sys
import os

# Proje kökünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.user_company_access import UserCompanyAccess
from app.models.project import Project
from app.models.role_templates import FULL_PERMISSIONS
from sqlalchemy import select, update


async def migrate():
    async with AsyncSessionLocal() as db:
        # 1. Tüm viewer kullanıcıları admin yap + FULL_PERMISSIONS ver
        result = await db.execute(select(User).where(User.role == "viewer"))
        viewers = result.scalars().all()
        
        print(f"[1/3] {len(viewers)} viewer kullanıcı bulundu.")
        for user in viewers:
            user.role = "admin"
            user.permissions = FULL_PERMISSIONS
            print(f"  → {user.username} (ID:{user.id}): viewer → admin + FULL_PERMISSIONS")
        
        # 2. editor ve diğer eski rolleri de admin yap
        result2 = await db.execute(select(User).where(User.role.in_(["editor", "weaver"])))
        others = result2.scalars().all()
        
        print(f"[2/3] {len(others)} editor/weaver kullanıcı bulundu.")
        for user in others:
            old_role = user.role
            user.role = "admin"
            user.permissions = FULL_PERMISSIONS
            print(f"  → {user.username} (ID:{user.id}): {old_role} → admin + FULL_PERMISSIONS")
        
        # 3. Tüm admin kullanıcıların permissions'ı boşsa doldur
        result3 = await db.execute(select(User).where(User.role == "admin"))
        admins = result3.scalars().all()
        
        updated_admins = 0
        for user in admins:
            if not user.permissions or user.permissions == {}:
                user.permissions = FULL_PERMISSIONS
                updated_admins += 1
                print(f"  → {user.username} (ID:{user.id}): Boş permissions → FULL_PERMISSIONS")
        
        print(f"[3/3] {updated_admins} admin kullanıcının boş izinleri dolduruldu.")
        
        # 4. Tüm firmaları bul ve UserCompanyAccess eksik olanları tamamla
        projects = await db.execute(select(Project))
        all_projects = projects.scalars().all()
        
        all_users = await db.execute(select(User).where(User.role.in_(["admin", "super_admin"])))
        admin_users = all_users.scalars().all()
        
        access_created = 0
        for proj in all_projects:
            for usr in admin_users:
                # Bu kullanıcı bu firmaya zaten erişebiliyor mu?
                existing = await db.execute(
                    select(UserCompanyAccess).where(
                        UserCompanyAccess.user_id == usr.id,
                        UserCompanyAccess.project_id == proj.id
                    )
                )
                if not existing.scalars().first():
                    # Firma sahibi mi?
                    is_owner = proj.user_id == usr.id
                    access = UserCompanyAccess(
                        user_id=usr.id,
                        project_id=proj.id,
                        is_owner=is_owner,
                        permissions=FULL_PERMISSIONS,
                        granted_by=usr.id
                    )
                    db.add(access)
                    access_created += 1
                    print(f"  + Erişim oluşturuldu: {usr.username} → {proj.name} (owner={is_owner})")
                else:
                    # Mevcut erişim varsa izinleri güncelle
                    acc = existing.scalars().first()
                    if not acc:
                        continue
                    # Sadece izinleri boş olanları güncelle
                    if not acc.permissions or acc.permissions == {}:
                        acc.permissions = FULL_PERMISSIONS
                        print(f"  ~ İzin güncellendi: {usr.username} → {proj.name}")
        
        print(f"\n{access_created} yeni erişim kaydı oluşturuldu.")
        
        await db.commit()
        print("\n✅ Migration tamamlandı!")


if __name__ == "__main__":
    asyncio.run(migrate())
