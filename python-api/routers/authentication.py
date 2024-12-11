from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas.user_schema
from services import auth_service
from database.database import get_db
from core.authentication import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user, Token, EmailPasswordRequestForm, authenticate_user
from core.security import pwd_context
from datetime import timedelta
from models import model
from typing import Annotated

from schemas.user_schema import User

auth_router = APIRouter(
    prefix="/api"
)

@auth_router.post("/register/", status_code=status.HTTP_201_CREATED, description="Create new user")

async def signup(user: schemas.user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.get_user_by_email(db, email=user.email)
    password = pwd_context.hash(user.password)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    return auth_service.create_user(db=db, user=user, password=password)

@auth_router.post("/login/", response_model=Token, description="Authenticate user with email and password. Returns an access token upon successful login.")
async def login(form_data: Annotated[EmailPasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Verify that the user exists
    user = auth_service.get_user_by_email(db, email=user.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # # Verify that the password is correct
    # if not pwd_context.verify(user.password, user.password):
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    
    #Mark user as authenticated or logged in
    user.is_logged_in = True
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}
    


@auth_router.get("/logged-in-users/")
def get_logged_in_users(db: Session = Depends(get_db)):
    logged_in_users = db.query(model.User).filter(model.User.is_logged_in == True).all()
    return [{"id": user.id, "email": user.email} for user in logged_in_users]


@auth_router.post("/logout/")
def logout(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    current_user.is_logged_in = False
    db.add(current_user)
    db.commit()
    return {"message": f"User {current_user.email} logged out successfully"}


@auth_router.get("/users/")
def get_all_users(db: Session = Depends(get_db)):
    """ Get all registered users from Database
    """
    users = db.query(model.User).all()
    if not users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found")
    return users


