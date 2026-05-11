from app.routers.ads.ad_accounts import router as accounts_router
from app.routers.ads.campaigns import router as campaigns_router
from app.routers.ads.metrics import router as metrics_router
from app.routers.ads.experiments import router as experiments_router
from app.routers.ads.creatives import router as creatives_router
from app.routers.ads.tasks import router as venus_tasks_router
from app.routers.ads.reports import router as reports_router
from app.routers.ads.onboarding import router as onboarding_router
from app.routers.ads.csv_imports import router as csv_imports_router
from app.routers.ads.ai_observations import router as ai_observations_router

routers = [
    accounts_router, campaigns_router, metrics_router, 
    experiments_router, creatives_router, venus_tasks_router,
    csv_imports_router, ai_observations_router
]
