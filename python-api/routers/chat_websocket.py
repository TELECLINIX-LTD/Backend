# from fastapi import Depends, APIRouter
# from sqlalchemy.orm import Session
# from models.model import Message
# from database.database import get_db

# chat_router = APIRouter()

# @chat_router.post("/api/messages")
# async def save_message(sender_id: int, recipient_id: int, message: str, db: Session = Depends(get_db)):
#     db_message = Message(sender_id=sender_id, recipient_id=recipient_id, message = message)
#     db.add(db_message)
#     db.commit()
#     db.refresh(db_message)
#     return db_message


# @chat_router.get("/api/messages/{user_id}/{peer_id}")
# async def get_chat_history(user_id: int, peer_id: int, db: Session = Depends(get_db)):
#     return db.query(Message).filter(
#         ((Message.sender_id == user_id) & (Message.recipient_id == peer_id)) |
#         ((Message.sender_id == peer_id) & (Message.recipient_id == user_id))
#         ).order_by(Message.timestamp).all()