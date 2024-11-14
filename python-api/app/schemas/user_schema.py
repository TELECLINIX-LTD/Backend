# from pydantic import BaseModel, Field, field_validator
# from typing import Any, List, Optional
# from datetime import datetime
# import enum

# class FormData(BaseModel):
#     email:str
#     password:str

# class ForgetPasswordRequest(BaseModel):
#     email: str
    
# class ResetForgotPassword(BaseModel):
#     new_password: str
#     confirm_password: str

#     @field_validator('new_password')
#     def validate_password(cls, value: str) -> str:
#         if len(value) < 8:
#             raise ValueError('Password must be at least 8 characters long')
#         if not any(c.islower() for c in value):
#             raise ValueError('Password must contain at least one lowercase letter')
#         if not any(c.isupper() for c in value):
#             raise ValueError('Password must contain at least one uppercase letter')
#         if not any(c.isdigit() for c in value):
#             raise ValueError('Password must contain at least one digit')
#         if not any(c in '!@#$%^&*()-_+=' for c in value):
#             raise ValueError('Password must contain at least one special character')
#         return value
    
#     @field_validator('confirm_password')
#     def passwords_match(cls, value: str, info: Any) -> str:
#         if 'new_password' in info.data and value != info.data['new_password']:
#             raise ValueError('New Password and confirm password do not match')
#         return value

# class UserRole(str, enum.Enum):
#     doctor = "doctor"
#     patient = "patient"

# class UserBase(BaseModel):
#     username: str = Field(max_length=10)
#     email: str
#     password: str
#     #role: UserRole = UserRole.patient
#     confirm_password: str

#     @field_validator('password')
#     def validate_password(cls, value: str) -> str:
#         if len(value) < 8:
#             raise ValueError('Password must be at least 8 characters long')
#         if not any(c.islower() for c in value):
#             raise ValueError('Password must contain at least one lowercase letter')
#         if not any(c.isupper() for c in value):
#             raise ValueError('Password must contain at least one uppercase letter')
#         if not any(c.isdigit() for c in value):
#             raise ValueError('Password must contain at least one digit')
#         if not any(c in '!@#$%^&*()-_+=' for c in value):
#             raise ValueError('Password must contain at least one special character')
#         return value
    
    
#     @field_validator('confirm_password')
#     def passwords_match(cls, value: str, info: Any) -> str:
#         if 'password' in info.data and value != info.data['password']:
#             raise ValueError('Password and confirm password do not match')
#         return value
    

# class DoctorBase(BaseModel):
#     specialization: str
#     experience_years: int

# class PatientBase(BaseModel):
#     age: int
#     medical_history: Optional[str] = None

# class ConsultationBase(BaseModel):
#     doctor_id: int
#     patient_id: int
#     scheduled_time: datetime
#     status: Optional[str] = "pending"
#     notes: Optional[str] = None

# class PrescriptionBase(BaseModel):
#     consultation_id: int
#     medication: str
#     dosage: str
#     instructions: Optional[str] = None

from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    email: str
    password: str
    role: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str

class TokenPayload(BaseModel):
    email: int
    role: str

