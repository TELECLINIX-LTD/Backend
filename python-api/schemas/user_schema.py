
from pydantic import BaseModel, ConfigDict, EmailStr

class FormData(BaseModel):
    email: str
    password: str

    model_config = ConfigDict(from_attributes=True)



class UserCreate(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

    model_config = ConfigDict(from_attributes=True)


class User(BaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: str
    password: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str

class TokenPayload(BaseModel):
    email: str | None = None

