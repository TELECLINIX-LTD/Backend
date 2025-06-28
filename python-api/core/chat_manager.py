# from fastapi import Depends, HTTPException, Security
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# import httpx


# http_bearer = HTTPBearer()

# NODEJS_AUTH_SERVICE_URL = "https://backend-a25w.onrender.com/api/auth/verify-token"

# async def verify_token(credentials: HTTPAuthorizationCredentials = Security(http_bearer)):
#     token = credentials.credentials
#     async with httpx.AsyncClient() as client:
#         response = await client.post(NODEJS_AUTH_SERVICE_URL, json={"token": token})
#         print(response)
#         if response.status_code == 200:
#             return response.json()  # Return decoded token data
#         else:
#             raise HTTPException(
#                 status_code=response.status_code,
#                 detail=response.json().get("error", "Invalid token")
#             )


from fastapi.websockets import WebSocket


class WebSocketManager:
    def __init__(self):
        self.connected_clients = {}

    async def connect(self, websocket: WebSocket):
        """Accepts new WebSocket connections and stores them."""
        await websocket.accept()

        client_ip = f"{websocket.client.host}:{websocket.client.port}"
        self.connected_clients[websocket] = client_ip

        # Send a welcome message to the client
        await websocket.send_text(f"Welcome {client_ip}")

    async def send_message(self, sender: WebSocket, message: str):
        """Broadcasts a message to all connected clients, tagging the sender."""
        sender_ip = self.connected_clients.get(sender, "Unknown")

        for client in self.connected_clients:
            if client != sender:  # Avoid sending the message back to the sender
                await client.send_text(f"{sender_ip}: {message}")

    async def disconnect(self, websocket: WebSocket):
        """Removes a disconnected client."""
        self.connected_clients.pop(websocket, None)

# class WebSocketManager:
#     def __init__(self):
#         self.connected_clients = []

#     async def connect(self, websocket: WebSocket):
#         client_ip = f"{websocket.client.host}:{websocket.client.port}"


#         # client has connected
#         await websocket.accept()


#         # add client to list of connected clients
#         self.connected_clients.append(websocket)


#         # send welcome message to the client
#         message = {"client":client_ip,"message": f"Welcome {client_ip}"}

#         await websocket.send_json(message)


#     async def send_message(self, websocket: WebSocket, message: dict):

#         message = {
#             "client": message['client'],
#             "message": message['content'],
#             "timestamp":message['timestamp']
#         }

#         await websocket.send_json(message)

#     async def disconnect(self, websocket):
#         self.connected_clients.remove(websocket)