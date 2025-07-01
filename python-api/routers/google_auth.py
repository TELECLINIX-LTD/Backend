from fastapi import APIRouter, Depends, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi import HTTPException
import httpx
from jose import jwt, JWTError

app = APIRouter(
    prefix="/api/auth",
    tags=["Google Authentication"]
)

templates = Jinja2Templates(directory="templates")


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
GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"


@app.get("/google/login")
def google_login():
    return RedirectResponse(
        f"{GOOGLE_AUTH_URL}?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
        f"&prompt=consent"
    )

# Step 2: Google OAuth callback
@app.get("/google/callback")
async def google_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    async with httpx.AsyncClient() as client:
        # Exchange code for access token
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
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        id_token = token_json.get("id_token")

        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to obtain access token")

        # Retrieve user info
        user_response = await client.get(
            GOOGLE_USER_INFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_info = user_response.json()

    return {
        "id_token": id_token,
        "user_info": user_info,
    }

async def verify_google_id_token(id_token: str):
    async with httpx.AsyncClient() as client:
        certs_response = await client.get(GOOGLE_CERTS_URL)
        certs = certs_response.json()

    try:
        payload = jwt.decode(
            id_token,
            certs,
            algorithms=["RS256"],
            audience=GOOGLE_CLIENT_ID,
            issuer="https://accounts.google.com"
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=403, detail=f"Invalid ID token: {str(e)}")