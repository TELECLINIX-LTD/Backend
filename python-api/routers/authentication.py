from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import schemas.user_schema
from services import auth_service
from database.database import get_db
from core.authentication import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user
from core.security import pwd_context
from datetime import timedelta
from typing import List

from schemas.user_schema import User

auth_router = APIRouter()

@auth_router.post("/register", response_model=schemas.user_schema.User, status_code=status.HTTP_201_CREATED)

async def signup(user: schemas.user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.get_user_by_username(db, username=user.username)
    hashed_password = pwd_context.hash(user.password)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    return auth_service.create_user(db=db, user=user, hashed_password=hashed_password)

@auth_router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username or password",
            headers={"WWW-Authenticate":"Bearer"}
            )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    
    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.get("/users", response_model=List[User])
def get_authenticated_users(
    current_user: User = Depends(get_current_active_user),  # Ensure only authenticated users can access this
    db: Session = Depends(get_db),
):
    """
    Retrieve all users. Only accessible to authenticated users.
    """
 # Import the auth_service module to access get_all_users function
    return auth_service.get_all_users(db)  # Use the correct function name