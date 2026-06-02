from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from app.config import settings


class BodyCachingMiddleware(BaseHTTPMiddleware):
    """
    POST/PUT isteklerinde request.json() body'yi consume eder.
    Bu middleware body'yi önce okuyup cache'ler, sonra tekrar okunabilir yapar.
    Böylece permissions.py'de request.json() okunduktan sonra
    FastAPI hala Pydantic modeline parse edebilir.
    """
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            # Body'yi oku ve cache'le
            body = await request.body()
            
            # Yeni bir receive callable oluştur
            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}
            
            # Request'in _receive'ini override et
            request._receive = receive
        
        return await call_next(request)
from app.routers.projects import router as projects_router
from app.routers.tasks import router as tasks_router
from app.routers.ai import router as ai_router
from app.routers.timer import router as timer_router
from app.routers.notes import router as notes_router
from app.routers.telegram import router as telegram_router
from app.routers.reports import router as reports_router
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.websocket import router as websocket_router
from app.routers.calendar import router as calendar_router
from app.routers.task_comments import router as task_comments_router
from app.routers.meeting import router as meeting_router
from app.routers.activity import router as activity_router
from app.utils.logger import logger
from app.services.scheduler import start_scheduler, shutdown_scheduler
from fastapi.responses import JSONResponse
import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Uygulama başlatılıyor, scheduler aktif ediliyor...")
    start_scheduler()
    
    # Otomatik DB migration — yeni kolonlar (PostgreSQL uyumlu, IF NOT EXISTS)
    try:
        from sqlalchemy import text
        from app.database import engine
        async with engine.begin() as conn:
            # task_photos kolonu — JSONB (PostgreSQL) veya TEXT (SQLite) olarak ekle
            try:
                await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_photos JSONB DEFAULT '[]'::jsonb"))
                logger.info("✅ tasks.task_photos kolonu (JSONB) kontrol edildi")
            except Exception:
                try:
                    await conn.execute(text("ALTER TABLE tasks ADD COLUMN task_photos TEXT DEFAULT '[]'"))
                    logger.info("✅ tasks.task_photos (TEXT) kolonu eklendi")
                except Exception:
                    pass  # Zaten var

            # created_at kolonu — eksikse ekle
            try:
                await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"))
                logger.info("✅ tasks.created_at kolonu kontrol edildi")
            except Exception:
                try:
                    await conn.execute(text("ALTER TABLE tasks ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
                    logger.info("✅ tasks.created_at (DATETIME) kolonu eklendi")
                except Exception:
                    pass  # Zaten var

            # projects tablosu webhook kolonları
            try:
                await conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS discord_webhook_url VARCHAR"))
                logger.info("✅ projects.discord_webhook_url kolonu kontrol edildi")
            except Exception:
                try:
                    await conn.execute(text("ALTER TABLE projects ADD COLUMN discord_webhook_url TEXT"))
                    logger.info("✅ projects.discord_webhook_url kolonu eklendi")
                except Exception:
                    pass

            try:
                await conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS slack_webhook_url VARCHAR"))
                logger.info("✅ projects.slack_webhook_url kolonu kontrol edildi")
            except Exception:
                try:
                    await conn.execute(text("ALTER TABLE projects ADD COLUMN slack_webhook_url TEXT"))
                    logger.info("✅ projects.slack_webhook_url kolonu eklendi")
                except Exception:
                    pass

            # task_comments tablosunu oluştur
            try:
                # PostgreSQL uyumlu CREATE TABLE
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS task_comments (
                        id SERIAL PRIMARY KEY,
                        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        content TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                logger.info("✅ task_comments tablosu (PostgreSQL) kontrol edildi/oluşturuldu")
            except Exception as e:
                # SQLite için SERIAL yerine INTEGER PRIMARY KEY AUTOINCREMENT
                try:
                    await conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS task_comments (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            content TEXT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
                    logger.info("✅ task_comments tablosu (SQLite) oluşturuldu")
                except Exception as ex:
                    logger.warning(f"task_comments tablosu oluşturulurken hata: {ex}")

    except Exception as e:
        logger.warning(f"DB migration kontrolü sırasında hata (kritik değil): {e}")
    
    yield
    # Shutdown
    logger.info("🛑 Uygulama kapanıyor, scheduler durduruluyor...")
    shutdown_scheduler()

app = FastAPI(
    title=settings.project_name,
    description="Yapay Zeka Destekli İş ve Maaş Yönetim Sistemi API",
    version="1.0.0",
    lifespan=lifespan
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "https://planla.pikselai.com",
        "http://localhost:3000",
        "https://localhost",
        "http://localhost",
        "capacitor://localhost",
        "ionic://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Body caching: POST/PUT isteklerinde request.json() ile body okunduğunda
# FastAPI'nin Pydantic modeli için tekrar body okuyabilmesi sağlanır
app.add_middleware(BodyCachingMiddleware)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(projects_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(ai_router, prefix="/api", tags=["AI Asistan"])
app.include_router(timer_router, prefix="/api/timer", tags=["Timer"])
app.include_router(notes_router, prefix="/api")
app.include_router(telegram_router, prefix="/api/telegram", tags=["Telegram Bot"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])
app.include_router(calendar_router, prefix="/api", tags=["Calendar"])
app.include_router(websocket_router)
app.include_router(task_comments_router)
app.include_router(meeting_router)
app.include_router(activity_router)

# Venus Routers
from app.routers.ads.ad_accounts import router as venus_accounts_router
from app.routers.ads.campaigns import router as venus_campaigns_router
from app.routers.ads.metrics import router as venus_metrics_router
from app.routers.ads.experiments import router as venus_experiments_router
from app.routers.ads.creatives import router as venus_creatives_router
from app.routers.ads.tasks import router as venus_tasks_router
from app.routers.ads.reports import router as venus_reports_router
from app.routers.ads.onboarding import router as venus_onboarding_router
from app.routers.ads.csv_imports import router as venus_csv_imports_router
from app.routers.ads.ai_observations import router as venus_ai_observations_router
from app.routers.ads.photo_tracking import router as venus_photo_tracking_router

app.include_router(venus_accounts_router, prefix="/api/ads/ad-accounts")
app.include_router(venus_campaigns_router, prefix="/api/ads/campaigns")
app.include_router(venus_metrics_router, prefix="/api/ads/metrics")
app.include_router(venus_experiments_router, prefix="/api/ads/experiments")
app.include_router(venus_creatives_router, prefix="/api/ads/creatives")
app.include_router(venus_tasks_router, prefix="/api/ads/tasks")
app.include_router(venus_reports_router, prefix="/api/ads/reports")
app.include_router(venus_onboarding_router, prefix="/api/ads/onboarding")
app.include_router(venus_csv_imports_router, prefix="/api/ads/csv-imports")
app.include_router(venus_ai_observations_router, prefix="/api/ads/ai-observations")
app.include_router(venus_photo_tracking_router, prefix="/api/ads")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("global_exception_caught", 
                 error=str(exc), 
                 url=str(request.url),
                 trace=traceback.format_exc())
    # CORS header'larını hata yanıtlarına da ekle
    origin = request.headers.get("origin", "")
    allowed_origins = [
        settings.frontend_url,
        "https://planla.pikselai.com",
        "http://localhost:3000",
        "https://localhost",
        "http://localhost",
        "capacitor://localhost",
        "ionic://localhost"
    ]
    headers = {}
    if origin in allowed_origins:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"message": "Beklenmeyen bir sunucu hatası oluştu.", "details": str(exc)},
        headers=headers,
    )

@app.get("/api/app-version")
async def get_app_version():
    """
    Mobil uygulama için son sürüm bilgisini ve zorunlu OTA güncelleme flag'ini döner.
    """
    return {
        "version": "5.2",
        "version_code": 42,
        "download_url": "https://myworld-twqx.onrender.com/static/Pikselis_v5.2.apk",
        "min_supported_version": "1.0",
        "force_update": False, # ARTIK ESNEK GÜNCELLEME (Kullanıcı es geçebilir)
        "changelog": "- Android mobil görünümdeki sol üst logo kaldırıldı, alan daralması ve sığmama/taşma hatası çözüldü.\n- Safe area padding desteği eklenerek üst menünün durum çubuğu arkasında kalıp tıklanamaz olması önlendi.\n- Mobil APK sürümü v5.2 (Code 42) olarak güncellendi."
    }

@app.get("/api/link-preview")
async def link_preview(url: str):
    """URL'den sayfa başlığı ve favicon çeker — LinkBreeze özelliği için"""
    import httpx
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        if not parsed.scheme:
            url = f"https://{url}"
            parsed = urlparse(url)
        
        async with httpx.AsyncClient(timeout=3.0, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0 (compatible; LinkBreeze/1.0)"})
            html = resp.text[:10000]  # İlk 10KB yeterli
        
        # Title çıkar
        import re
        title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
        title = title_match.group(1).strip() if title_match else parsed.netloc
        
        # HTML entity decode
        from html import unescape
        title = unescape(title)
        
        favicon = f"{parsed.scheme}://{parsed.netloc}/favicon.ico"
        
        return {"title": title, "url": url, "favicon": favicon, "domain": parsed.netloc}
    except Exception:
        parsed = urlparse(url)
        return {"title": parsed.netloc or url, "url": url, "favicon": "", "domain": parsed.netloc or ""}

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "project": settings.project_name,
        "environment": settings.environment
    }
