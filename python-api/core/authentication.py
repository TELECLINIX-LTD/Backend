from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, Depends, status, Form, Request
from pydantic import BaseModel


from sqlalchemy.orm import Session
from database.database import get_db
from models import model
from typing import Annotated
import services.auth_service as auth_service
from core.security import verify_password

from fastapi.security import OAuth2PasswordBearer, OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
# from fastapi import Request
from fastapi.security.utils import get_authorization_scheme_param

import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class OAuth2PasswordBearerWithEmail(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str | None = None,
        scopes: dict | None = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> str | None:
        authorization: str = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                    
                )
            else:
                return None
        return param

oauth2_scheme = OAuth2PasswordBearerWithEmail(tokenUrl="login")

class EmailPasswordRequestForm:
    def __init__(
        self,
        grant_type: str = Form(default=None, regex="password"),
        email: str = Form(),
        password: str = Form(),
        scope: str = Form(default=""),
        client_id: str | None = Form(default=None),
        client_secret: str | None = Form(default=None),
    ):
        self.grant_type = grant_type
        self.email = email
        self.password = password
        self.scopes = scope.split()
        self.client_id = client_id
        self.client_secret = client_secret

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


def authenticate_user(session: Session, email: str, password: str):
    user = auth_service.get_user_by_email(session, email)
    if not user:
        return False
    if not verify_password(password, user.password):
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



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(model.User).filter(model.User.id == user_id).first()
        if user is None or not user.is_logged_in:
            raise HTTPException(status_code=401, detail="User not found or not logged in")
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")


def get_current_active_user(current_user: model.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return current_user

    

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