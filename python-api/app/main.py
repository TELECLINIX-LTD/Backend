from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base

from routers import auth_router, login_router

version = "v1"

app = FastAPI(
    title="TeleClinix Backend APIs",
    description="APIs for managing TeleClinix patient and doctor data",
    version=version,
    openapi_url=f"/api/{version}/openapi.json",
    docs_url=f"/api/{version}/docs",
    redoc_url=f"/api/{version}/redoc"
)

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


app.include_router(auth_router.router)

app.include_router(login_router.router)

@app.get("/", tags=["Home"])
async def root():
    return {"message": "Welcome to TeleClinix API Documentation, Navigate to /api/v1/docs to view documentation."}