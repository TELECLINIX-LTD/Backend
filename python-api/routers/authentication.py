from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import schemas.user_schema
from services import auth_service
from database.database import get_db
from core.authentication import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user
from core.security import get_password_hash
from datetime import timedelta
from models import model

from models.model import User

auth_router = APIRouter(
    prefix="/api",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Not found"},
        status.HTTP_401_UNAUTHORIZED: {"description": "Not authenticated"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_400_BAD_REQUEST: {"description": "Bad request"},
    }
)

@auth_router.post("/register/", status_code=status.HTTP_201_CREATED, description="Create new user")

async def signup(user: schemas.user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    return auth_service.create_user(db=db, user=user, password=hashed_password)

@auth_router.post("/login/", description="Authenticate user with email and password. Returns an access token upon successful login.")
async def login(form_data: OAuth2PasswordRequestForm = Depends(),  db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
            )
    
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


