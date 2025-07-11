from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import schemas.user_schema as user_schema
from database.database import get_db
from core.authentication import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user
from core.security import get_password_hash, hash_otp, verify_otp
from datetime import timedelta
from models import model
from utility.email_utils import generate_otp, send_otp_email


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

@auth_router.post("/register", status_code=status.HTTP_201_CREATED, description="Create new user", response_model=user_schema.UserCreate)

async def signup(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """ Create a new user in the database
    """
    # Check if the user already exists
    existing = db.query(model.User).filter(model.User.email == user.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Verify password and confirm_password match
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Generate OTP
    plain_otp = generate_otp()

    hashed_otp = hash_otp(plain_otp)

    # Hash password
    hashed_password = get_password_hash(user.password)
    if not hashed_password:
        raise HTTPException(status_code=500, detail="Failed to hash password")
    if not hashed_otp:
        raise HTTPException(status_code=500, detail="Failed to hash OTP")
    
    # Check if OTP already exists for the user
    existing_otp = db.query(model.User).filter(model.User.email == user.email, model.User.otp.isnot(None)).first()
    if existing_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP already exists for this user"
        )
    
    # Check if email is valid
    if not user.email or "@" not in user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address"
        )
    
    # Check if password is valid
    if len(user.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    if not any(char.isdigit() for char in user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one digit"
        )
    if not any(char.isalpha() for char in user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one letter"
        )
    if not any(char in "!@#$%^&*()-_=+[]{}|;:,.<>?/" for char in user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character"
        )
    if not user.first_name or not user.last_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="First name and last name are required"
        )
    
    # Create new user with OTP
    db_user = User(first_name=user.first_name,
    last_name=user.last_name,
    email=user.email,
    gender=user.gender,
    password=hashed_password,
    otp=hashed_otp)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send OTP email
    if not await send_otp_email(user.email, plain_otp):
        raise HTTPException(status_code=500, detail="Failed to send OTP email")

    return user


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
async def verify_otp(otp_request: user_schema.OTPRequest, db: Session = Depends(get_db)):
    db_user = db.query(model.User).filter(model.User.email == otp_request.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_otp(otp_request.otp, db_user.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Clear OTP after successful verification
    db_user.otp = None
    db.commit()
    
    return {"message": "OTP verified successfully"}