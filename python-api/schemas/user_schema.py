
from enum import Enum
from pydantic import BaseModel, ConfigDict, EmailStr

class FormData(BaseModel):
    email: str
    password: str

    model_config = ConfigDict(from_attributes=True)

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    prefer_not_to_say = "prefer_not_to_say"

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    gender: GenderEnum
    password: str
    confirm_password: str

    model_config = ConfigDict(from_attributes=True)


class User(BaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(from_attributes=True)


class UserVerify(BaseModel):
    email: EmailStr
    otp: str

    model_config = ConfigDict(from_attributes=True)

class OTPRequest(BaseModel):
    email: EmailStr
    otp: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str

class TokenPayload(BaseModel):
    email: str | None = None

