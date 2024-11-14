from fastapi import HTTPException, status
from models import user_model
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from core.security import get_password_hash


def create_user(db: Session, user):
    hashed_password = get_password_hash(user.password)
    new_user = user_model.User(email=user.email, hashed_password=hashed_password, role=user.role)
    try:
        db.add(new_user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    db.refresh(new_user)
    
    return user


def get_user_by_email(session: Session, email:str):
    user = session.query(user_model.User).filter(user_model.User.email == email).first()
    return user

def get_user_by_username(session:Session, username:str):
    user = session.query(user_model.User).filter(user_model.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_user(email_ads: str, session: Session):
    # Query the database for a user with the given email address
    user = session.query(user_model.User).filter(user_model.User.email == email_ads).first()
    return user