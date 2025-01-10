from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ChatMessage(BaseModel):
    sender_id: int = Field(..., description="ID of the sender")
    receiver_id: int = Field(..., description="ID of the receiver")
    message: str = Field(..., description="Content of the chat message", max_length=500)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Time the message was sent")
