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
from app.utils.logger import logger
from app.services.scheduler import start_scheduler, shutdown_scheduler
from fastapi.responses import JSONResponse
import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Uygulama başlatılıyor, scheduler aktif ediliyor...")
    start_scheduler()
    yield
    # Shutdown
    logger.info("🛑 Uygulama kapanıyor, scheduler durduruluyor...")
    shutdown_scheduler()

app = FastAPI(
    title=settings.project_name,
    description="Kişisel Yapay Zeka Destekli Yaşam ve İş Yönetim Sistemi API",
    version="1.0.0",
    lifespan=lifespan
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "https://pikselai-dashboard.vercel.app",
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
        "https://pikselai-dashboard.vercel.app",
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

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "project": settings.project_name,
        "environment": settings.environment
    }
