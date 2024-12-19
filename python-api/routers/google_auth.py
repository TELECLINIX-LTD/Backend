from fastapi import APIRouter, Depends, HTTPException, status
from models.model import User
from sqlalchemy.orm import Session
from database.database import get_db
from jose import jwt
from starlette.config import Config
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
import requests


from fastapi.security import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.models import OAuthFlowPassword

from typing import Optional
from core.configuration import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, ALGORITHM

app = APIRouter(
    prefix="/api",
    tags=["Google Authentication"]
)

config = Config(environ={})
oauth = OAuth(config)
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

class OAuth2PasswordBearerWithEmail(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: Optional[str] = None,
        
    ):
        if not tokenUrl:
            raise ValueError("`tokenUrl` must be provided")
        flows = OAuthFlowsModel(password=OAuthFlowPassword(tokenUrl = tokenUrl))
        super().__init__(flows=flows, scheme_name=scheme_name)

    async def __call__(self, request: Request) -> Optional[str]:
        authorization: str = request.headers.get("Authorization")
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        scheme, param = authorization.split()
        if scheme.lower()!= "bearer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return param
    
oauth2_scheme = OAuth2PasswordBearerWithEmail(tokenUrl="/api/login")

@app.get("/auth/google")
async def google_login(request: Request):
    redirect_uri = GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    if user_info:
        # Check if user exists in database
        user = db.query(User).filter(User.email == user_info["email"]).first()
        if not user:
            user = User(email=user_info["email"], name=user_info["name"])
            db.add(user)
            db.commit()
        return {"message": "Login successful", "user": {"email": user.email, "name": user.name}}
    return {"error": "Google authentication failed"}


@app.get("/login/google")
async def login_with_google():
    return {
        "url": f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20profile%20email&access_type=offline"
    }

@app.get("/auth/google")
async def authenticate_with_google(code: str):
    token_url = "https://accounts.google.com/o/oauth2/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    response = requests.post(token_url, data=data)
    access_token = response.json()["access_token"]
    user_info = requests.get("https://www.googleapis.com/oauth2/v1/userinfo", headers={"Authorization": f"Bearer {access_token}"})
    return user_info.json()

@app.post("/token")
async def create_access_token(token: str = Depends(oauth2_scheme)):
    return jwt.decode(token, GOOGLE_CLIENT_SECRET, ALGORITHM)