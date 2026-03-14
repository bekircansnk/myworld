from app.routers.venus.ad_accounts import router as accounts_router
from app.routers.venus.campaigns import router as campaigns_router
from app.routers.venus.metrics import router as metrics_router
from app.routers.venus.experiments import router as experiments_router
from app.routers.venus.creatives import router as creatives_router
from app.routers.venus.tasks import router as venus_tasks_router
from app.routers.venus.reports import router as reports_router
from app.routers.venus.competitors import router as competitors_router
from app.routers.venus.onboarding import router as onboarding_router
from app.routers.venus.csv_imports import router as csv_imports_router
from app.routers.venus.ai_observations import router as ai_observations_router

routers = [
    accounts_router, campaigns_router, metrics_router, 
    experiments_router, creatives_router, venus_tasks_router,
    reports_router, competitors_router, onboarding_router,
    csv_imports_router, ai_observations_router
]
