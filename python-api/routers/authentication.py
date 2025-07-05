from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import schemas.user_schema as user_schema
from services import auth_service
from database.database import get_db
from core.authentication import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, get_current_user
from core.security import get_password_hash
from datetime import timedelta
from models import model
from utility.email_utils import send_email
import random, string, time

from models.model import User

otp_store = {}  # In-memory store for OTPs, consider using a more persistent store in production

auth_router = APIRouter(
    prefix="/api",
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Not found"},
        status.HTTP_401_UNAUTHORIZED: {"description": "Not authenticated"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_400_BAD_REQUEST: {"description": "Bad request"},
    }
)

@auth_router.post("/register", status_code=status.HTTP_201_CREATED, description="Create new user")

async def signup(user: user_schema.UserCreate, db: Session = Depends(get_db), background_tasks: BackgroundTasks = None):
    """ Create a new user in the database
    """
    # Check if the user already exists
    existing = db.query(model.User).filter(model.User.email == user.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    otp = ''.join(random.choices(string.digits, k=6))
    otp_store[user.email] = {"otp": otp, "expires": time.time() + 300, "data": user}  # OTP valid for 5 minutes

    background_tasks.add_task(
        send_email, user.email, 
        "OTP Verification - Teleclinix", 
        f"Your OTP is: {otp}. It is valid for 5 minutes."
        )

    print(f"OTP for {user.email}: {otp}")

    return {"message": "OTP sent to your email. Please verify to complete registration."}
    
@auth_router.post("/token/", description="Authenticate user with email and password. Returns an access token upon successful login.")
async def login_for_access_token(form_data: user_schema.FormData = Depends(),  db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.email, form_data.password)
    if not user:
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


# @auth_router.post("/logout/")
# def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
#     current_user.is_logged_in = False
#     db.add(current_user)
#     db.commit()
#     return {"message": f"User {current_user.email} logged out successfully"}


@auth_router.get("/users/")
def get_all_users(db: Session = Depends(get_db)):
    """ Get all registered users from Database
    """
    users = db.query(model.User).all()
    if not users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found")
    return users

@auth_router.post("/verify-otp/")
async def verify_otp(user_verify: user_schema.UserVerify, db: Session = Depends(get_db)):
    """ Verify the OTP sent to the user's email
    """
    record = otp_store.get(user_verify.email)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired"
        )
    
    if time.time() > record["expires"]:
        del otp_store[user_verify.email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )
    
    if record["otp"] != user_verify.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Create the user in the database
    user_data = record["data"]
    new_user = model.User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        gender=user_data.gender,
        password=get_password_hash(user_data.password), # Hash the password
        is_logged_in=False  # Default to not logged in
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    del otp_store[user_verify.email]
    
    return {"message": "User registered successfully", "user_id": new_user.id}