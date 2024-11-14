from fastapi import APIRouter, Depends, HTTPException, status
from schemas import user_schema
from sqlalchemy.orm import Session
from database.database import get_db
from services import user_service

router = APIRouter(tags=["Authentication"])

@router.post("/register", description="Create a new user")
async def register(user: user_schema.UserCreate, session: Session = Depends(get_db)):
    try:
        new_user = user_service.create_user(db=session, user=user)
        if new_user is None:
            raise HTTPException(status_code=400, detail="User creation failed.")
        return new_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
