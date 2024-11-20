from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base

from routers import authentication, doctors_auth

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

version = "1.0.0"

app = FastAPI(
    title="TeleClinix Backend APIs",
    description="APIs for managing TeleClinix patient and doctor data",
    version=version,
    contact={
        "name": "TeleClinix Development Team",
        "email": "teleclinix0@gmail.com"
    }
)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "https://teleclinix-backend-api.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database created successfully")
except Exception as e:
    logger.error(f"Failed to create database: {e}")


app.include_router(router = authentication.auth_router, tags=["Authentication"])
app.include_router(router = doctors_auth.doc_router, tags=["Doctors"])



@app.get("/", tags=["Home"])
async def root():
    return {"message": "Welcome to TeleClinix API Documentation, Navigate to /docs to view documentation."}