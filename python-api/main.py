from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import json
from starlette.middleware.sessions import SessionMiddleware 
from database.database import engine, Base, db_session
from models.model import Message  # Import the Message model

from routers import authentication, doctors_auth, google_auth
from core.chat_manager import WebSocketManager
#from core.chat_authentication import verify_token

import logging

#NODEJS_AUTH_SERVICE_URL = 'https://backend-a25w.onrender.com/api/auth/verify-token'  # Replace with your actual Node.js auth service URL

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

chat_manager = WebSocketManager()

@app.get("/", tags=["Home"])
async def root():
    return {"message": "Welcome to TeleClinix API Documentation, Navigate to /docs to view documentation."}

@app.get("/chat", response_class=HTMLResponse)
async def chat(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await chat_manager.connect(websocket)

    while True:
        try:
            message = await websocket.receive_text()  # Receive raw text

            if not message.strip():
                continue  # Ignore empty messages

            await chat_manager.send_message(websocket, message)

        except WebSocketDisconnect:
            await chat_manager.disconnect(websocket)
            break  # Stop listening for messages from this client
# async def websocket_endpoint(websocket: WebSocket):
#     try:
#         # Extract the token from the headers (make sure it's there)
#         token = websocket.headers.get("Authorization")
#         if not token or not token.startswith("Bearer "):
#             await websocket.close(code=1008, reason="Token is missing or invalid")
#             return

#         token = token[len("Bearer "):]  # Strip the 'Bearer ' part

#         # Validate the token with the auth service
#         async with httpx.AsyncClient() as client:
#             response = await client.post(NODEJS_AUTH_SERVICE_URL, json={"token": token})

#         if response.status_code != 200:
#             await websocket.close(code=1008, reason="Invalid token")
#             return

#         user_data = response.json().get("payload")
#         if not user_data:
#             await websocket.close(code=1008, reason="Invalid token data")
#             return

#         user_email = user_data.get("email")
#         if not user_email:
#             await websocket.close(code=1008, reason="Invalid user email")
#             return

#         # Successfully authenticated user
#         print(f"User authenticated: {user_email}")

#         # Accept WebSocket connection
#         await websocket.accept()

#         # Add user email to connection manager and broadcast
#         await connection_manager.connect(websocket, user_email)
#         await connection_manager.broadcast(f"User {user_email} connected!")

#         # Send message history
#         db_session = db_session
#         messages = db_session.query(Message).order_by(Message.timestamp.desc()).limit(50).all()
#         for msg in reversed(messages):
#             await websocket.send_text(f"{msg.timestamp} - {msg.sender_id}: {msg.message}")

#         # Handle incoming messages
#         while True:
#             data = await websocket.receive_text()
#             new_message = Message(sender_id=user_email, message=data)
#             db_session.add(new_message)
#             db_session.commit()
#             await connection_manager.broadcast(f"{user_email}: {data}")

#     except WebSocketDisconnect:
#         connection_manager.disconnect(websocket)
#         await connection_manager.broadcast(f"User {user_email} disconnected!")
#     except Exception as e:
#         print(f"Error in WebSocket handler: {e}")
#         await websocket.close(code=1011, reason="Server error")