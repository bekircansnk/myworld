from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers.projects import router as projects_router
from app.routers.tasks import router as tasks_router
from app.routers.ai import router as ai_router
from app.routers.timer import router as timer_router
from app.routers.notes import router as notes_router
from app.routers.telegram import router as telegram_router
from app.routers.reports import router as reports_router
from app.routers.websocket import router as websocket_router
from app.utils.logger import logger
from fastapi.responses import JSONResponse
import traceback

app = FastAPI(
    title=settings.project_name,
    description="Kişisel Yapay Zeka Destekli Yaşam ve İş Yönetim Sistemi API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # local dev esnekliği için
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(ai_router, prefix="/api", tags=["AI Asistan"])
app.include_router(timer_router, prefix="/api/timer", tags=["Timer"])
app.include_router(notes_router, prefix="/api")
app.include_router(telegram_router, prefix="/api/telegram", tags=["Telegram Bot"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])
app.include_router(websocket_router)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("global_exception_caught", 
                 error=str(exc), 
                 url=str(request.url),
                 trace=traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"message": "Beklenmeyen bir sunucu hatası oluştu.", "details": str(exc)},
    )

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "project": settings.project_name,
        "environment": settings.environment
    }
