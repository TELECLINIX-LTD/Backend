from fastapi import APIRouter, Depends, HTTPException, status
from schemas import user_schema
from sqlalchemy.orm import Session
from database.database import get_db
from services import user_service

router = APIRouter(tags=["Authentication"])

@router.post("/register", description="Create a new user")
async def register(user: user_schema.UserCreate, session: Session = Depends(get_db)):
    new_user = user_service.create_user(db=session, user=user)
    return new_user
