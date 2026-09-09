from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from redis.asyncio import Redis

from app.api.v1.auth import router as auth_router
from app.api.v1.farms import router as farms_router
from app.api.v1.soil_reports import router as soil_reports_router
from app.api.v1.crop_history import router as crop_history_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.feedback import router as feedback_router
from app.api.v1.dashboard import router as dashboard_router
from app.config import settings
from app.state import set_redis_client
from app.utils.errors import ApiError, api_error_handler
from app.models.loader import load_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    set_redis_client(redis)
    load_models()
    yield
    # Shutdown
    await redis.aclose()


app = FastAPI(title="AgriAI API", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(ApiError, api_error_handler)


@app.exception_handler(Exception)
async def generic_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}},
    )


# Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(farms_router, prefix="/api/v1")
app.include_router(soil_reports_router, prefix="/api/v1")
app.include_router(crop_history_router, prefix="/api/v1")
app.include_router(predictions_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
