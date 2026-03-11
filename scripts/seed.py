import asyncio
import json
import os
import sys

# Proje dizin yapısını PYTHONPATH'e ekle
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'app', 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.config import settings
from app.models.user import User
from app.models.project import Project

async def run_seed():
    engine = create_async_engine(settings.database_url, echo=True)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        # 1. Herhangi bir kullanıcı var mı kontrol et (id=1 çakışmasını önlemek için)
        result = await session.execute(select(User))
        user = result.scalars().first()
        
        if not user:
            user = User(email="ozel@myworld.app", name="Bekircan Sağanak")
            session.add(user)
            await session.commit()
            await session.refresh(user)
            print(f"✅ Yeni kullanıcı oluşturuldu: ID {user.id}")
        else:
            print(f"✅ Sistemdeki ilk kullanıcı (ID {user.id}) seçildi.")

        # 2. Projeleri oku ve ekle
        seed_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'seed', 'projects.json')
        if os.path.exists(seed_file):
            with open(seed_file, 'r', encoding='utf-8') as f:
                projects_data = json.load(f)
            
            for p_data in projects_data:
                # Proje adıyla kontrol et
                p_res = await session.execute(select(Project).filter(Project.name == p_data["name"]))
                existing_p = p_res.scalars().first()
                if not existing_p:
                    project = Project(
                        user_id=user.id,
                        name=p_data["name"],
                        color=p_data["color"],
                        icon=p_data["icon"],
                        description=p_data["description"],
                        sort_order=p_data["sort_order"],
                        is_active=True
                    )
                    session.add(project)
            
            await session.commit()
            print("✅ Başlangıç projeleri eklendi veya güncellendi.")
        else:
            print("❌ seed/projects.json bulunamadı!")

if __name__ == "__main__":
    asyncio.run(run_seed())
