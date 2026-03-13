from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import sys
import ssl
from pathlib import Path

# Alembic'in config'i bulabilmesi için sys.path ekliyoruz
sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import settings

# Production (Neon vb.) için SSL context oluştur
is_production_db = "neon" in settings.database_url or settings.environment == "production"
connect_args = {}
if is_production_db:
    ssl_context = ssl.create_default_context()
    connect_args["ssl"] = ssl_context

engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "development",
    future=True,
    pool_size=5 if is_production_db else 20,
    max_overflow=3 if is_production_db else 10,
    pool_recycle=300 if is_production_db else 3600,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
