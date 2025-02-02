from fastapi import APIRouter, Depends, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, HTMLResponse
# from models.model import User
# from sqlalchemy.orm import Session
# from database.database import get_db
# from jose import jwt
# from starlette.config import Config
# from starlette.requests import Request
# from starlette.middleware.sessions import SessionMiddleware
# from starlette.responses import RedirectResponse
# from authlib.integrations.starlette_client import OAuth
# import requests


# from fastapi.security import OAuth2
# from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
# from fastapi.openapi.models import OAuthFlowPassword

# from typing import Optional
# from core.configuration import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, ALGORITHM

app = APIRouter(
    prefix="/api",
    tags=["Google Authentication"]
)

templates = Jinja2Templates(directory="templates")
# config = Config(environ={})
# oauth = OAuth(config)
# oauth.register(
#     name='google',
#     client_id=GOOGLE_CLIENT_ID,
#     client_secret=GOOGLE_CLIENT_SECRET,
#     server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
#     client_kwargs={'scope': 'openid email profile'},
# )

# class OAuth2PasswordBearerWithEmail(OAuth2):
#     def __init__(
#         self,
#         tokenUrl: str,
#         scheme_name: Optional[str] = None,
        
#     ):
#         if not tokenUrl:
#             raise ValueError("`tokenUrl` must be provided")
#         flows = OAuthFlowsModel(password=OAuthFlowPassword(tokenUrl = tokenUrl))
#         super().__init__(flows=flows, scheme_name=scheme_name)

#     async def __call__(self, request: Request) -> Optional[str]:
#         authorization: str = request.headers.get("Authorization")
#         if not authorization:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Not authenticated",
#                 headers={"WWW-Authenticate": "Bearer"},
#             )
#         scheme, param = authorization.split()
#         if scheme.lower()!= "bearer":
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Invalid authentication scheme",
#                 headers={"WWW-Authenticate": "Bearer"},
#             )
#         return param
    
# oauth2_scheme = OAuth2PasswordBearerWithEmail(tokenUrl="/api/login")

# 


# @app.get("/login/google")
# async def login_with_google():
#     return {
#         "url": f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20profile%20email&access_type=offline"
#     }

# @app.get("/auth/google")
# async def authenticate_with_google(code: str):
#     token_url = "https://accounts.google.com/o/oauth2/token"
#     data = {
#         "code": code,
#         "client_id": GOOGLE_CLIENT_ID,
#         "client_secret": GOOGLE_CLIENT_SECRET,
#         "redirect_uri": GOOGLE_REDIRECT_URI,
#         "grant_type": "authorization_code",
#     }
#     response = requests.post(token_url, data=data)
#     access_token = response.json()["access_token"]
#     user_info = requests.get("https://www.googleapis.com/oauth2/v1/userinfo", headers={"Authorization": f"Bearer {access_token}"})
#     return user_info.json()

# @app.post("/token")
# async def create_access_token(token: str = Depends(oauth2_scheme)):
#     return jwt.decode(token, GOOGLE_CLIENT_SECRET, ALGORITHM)

import os
from httpx import AsyncClient
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

def get_google_auth_url():
    return (
        f"{GOOGLE_AUTH_URL}?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope=email profile"
    )

async def get_google_token(code: str):
    async with AsyncClient() as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code"
            },
        )
        response.raise_for_status()
        return response.json()
    

async def get_user_info(access_token: str):
    async with AsyncClient() as client:
        response = await client.get(
            GOOGLE_USER_INFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        response.raise_for_status()
        return response.json()
    

@app.get("/auth/google", response_class=HTMLResponse)
async def google_login(request: Request):
    google_auth_url = get_google_auth_url()
    return templates.TemplateResponse(
        "index.html", {
            "request": request,
            "google_auth_url": google_auth_url,
            "title": "Google Login"
        }
    )

@app.get("/auth/google/callback")
async def google_callback(code: str):
    try:
        token_data = await get_google_token(code)
        user_info = await get_user_info(token_data["access_token"])
        return {
            "message": "Authentication successful!",
            "user_info": user_info
        }
    except Exception as e:
        return {
            "error": str(e)
        }
    # token = await oauth.google.authorize_access_token(request)
    # user_info = token.get("userinfo")
    # if user_info:
    #     # Check if user exists in database
    #     user = db.query(User).filter(User.email == user_info["email"]).first()
    #     if not user:
    #         user = User(email=user_info["email"], name=user_info["name"])
    #         db.add(user)
    #         db.commit()
    #     return {"message": "Login successful", "user": {"email": user.email, "name": user.name}}
    # return {"error": "Google authentication failed"}