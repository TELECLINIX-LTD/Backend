from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, HTMLResponse

from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel, OAuthFlowAuthorizationCode
from fastapi.security import OAuth2
import httpx

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
    prefix="/api/auth",
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
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

SCOPES = "openid email profile"

# Define the OAuth2 flow for Google authentication
class GoogleOAuth2(OAuth2):
    def __init__(self):
        flows = OAuthFlowsModel(
            authorizationCode=OAuthFlowAuthorizationCode(
                authorizationUrl=GOOGLE_AUTH_URL,
                tokenUrl=GOOGLE_TOKEN_URL,
                scopes={"openid": "Access user info"}
            )
        )
        super().__init__(flows=flows)

oauth2_scheme = GoogleOAuth2()


def get_google_auth_url():
    return (
        f"{GOOGLE_AUTH_URL}?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
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
                "redirect_uri": GOOGLE_REDIRECT_URI,
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


@app.get("/google/login")
async def login_with_google():
    # Redirect to Google's OAuth 2.0 server
    return RedirectResponse(
        f"{GOOGLE_AUTH_URL}?response_type=code&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}&scope={SCOPES}&access_type=offline"
    )


@app.get("/google/callback")
async def google_callback(code: str):
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")

        tokens = token_response.json()
        access_token = tokens["access_token"]

        # Get user info
        userinfo_response = await client.get(
            GOOGLE_USER_INFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if userinfo_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info")

        userinfo = userinfo_response.json()

    # You can now log in the user or create a new one
    return {
        "access_token": access_token,
        "user": {
            "email": userinfo.get("email"),
            "name": userinfo.get("name"),
            "picture": userinfo.get("picture"),
        }
    }