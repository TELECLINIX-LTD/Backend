from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services import user_service
from schemas import user_schema

from database.database import get_db

router = APIRouter(tags=["Authentication"])

@router.post("/signup", description="Create a new user")
async def signup(user: user_schema.UserCreate, session: Session = Depends(get_db)):
    user_obj = user_service.create_user(db=session, user=user)
    return user_obj