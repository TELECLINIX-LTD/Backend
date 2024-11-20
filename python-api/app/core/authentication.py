from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, Depends, status, Form
from pydantic import BaseModel
from typing import Annotated

from sqlalchemy.orm import Session
from database.database import get_db
import services.auth_service as auth_service
from core.security import verify_password

from fastapi.security import OAuth2PasswordBearer
# from fastapi.openapi.models import OAuthFlows, OAuthFlowPassword
# from fastapi import Request
# from fastapi.security.utils import get_authorization_scheme_param

import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


def authenticate_user(session: Session, username: str, password: str):
    user = auth_service.get_user_by_username(session, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        return email
    except JWTError:
        return None


def get_current_active_user(token: str = Depends(oauth2_scheme), session=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
        # token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = auth_service.get_user_by_username(session, username=username)
    if user is None:
        raise credentials_exception
    return user

def role_required(required_role: str):
    def role_dependency(user=Depends(get_current_active_user)):
        if user["role"] != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user
    return role_dependency


def create_reset_password_token(email:str):
    data = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=10)}
    token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decode_reset_password_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        return email
    except JWTError:
        return None