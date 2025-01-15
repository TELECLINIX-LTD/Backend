from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from starlette.middleware.sessions import SessionMiddleware 
from database.database import engine, Base

from routers import authentication, doctors_auth, google_auth

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
    description="*APIs for Creating and Managing TeleClinix Patient(Users) and Doctor Information.*",
    version="1.0.0",
    contact={
        "name": "TeleClinix Development Team",
        "email": "teleclinix0@gmail.com"
    },
    extra={
        "Important": "Any Authentication endpoint that requires a username, use the Email"
    }
)

templates = Jinja2Templates(directory="templates")

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:8000",
    "http://localhost:5173",
    "https://teleclinix-backend-api.onrender.com"
]

app.add_middleware(SessionMiddleware, secret_key="secret_key")  # Replace with your own secret key

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database created successfully")
except Exception as e:
    logger.error(f"Failed to create database: {e}")

# Include routers
app.include_router(router = authentication.auth_router, tags=["JWT Authentication"])
app.include_router(router = google_auth.app, tags=["Google Authentication"])
app.include_router(router = doctors_auth.doc_router, tags=["Doctors"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

connection_manager = ConnectionManager()


@app.get("/", tags=["Home"])
async def root():
    return {"message": "Welcome to TeleClinix API Documentation, Navigate to /docs to view documentation."}


@app.get("/chat", response_class=HTMLResponse)
async def chat(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Client {client_id} says: {data}")
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
