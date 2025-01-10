from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, APIRouter
from core.authentication import verify_access_token as verify_token


websocket_router = APIRouter()



class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message:str, user_id:str):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_text(message)

    async def broadcast(self, message:str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

connection_manager = ConnectionManager()

@websocket_router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket, token:str):
    payload = verify_token(token)
    user_id = payload.get('user_id')

    if not user_id:
        await websocket.close()
        return
    
    await connection_manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            await connection_manager.broadcast(f"User {user_id}: {data}")
    except WebSocketDisconnect:
        connection_manager.disconnect(user_id)