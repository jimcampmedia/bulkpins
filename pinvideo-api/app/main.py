from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.video_routes import router as video_router
from app.routes.pinterest_routes import router as pinterest_router
from app.routes.schedule_routes import router as schedule_router
from app.routes.billing_routes import router as billing_router

app = FastAPI(title="PinVideo API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth_router)
app.include_router(video_router)
app.include_router(pinterest_router)
app.include_router(schedule_router)
app.include_router(billing_router)


@app.on_event("startup")
async def startup():
    init_db()
    # Ensure storage directory exists for demo mode
    os.makedirs("/data/storage", exist_ok=True)
    app.mount("/storage", StaticFiles(directory="/data/storage"), name="storage")


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
