from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class DoctorBase(BaseModel):
    username: str = Field(..., description="Full name of the doctor")
    phone_number: str = Field(..., description="Phone number of the doctor")
    medical_license_number: str = Field(..., description="Medical license number of the doctor")
    specialization: str = Field(..., description="Specialization of the doctor")
    experience_years: Optional[int] = Field(None, description="Years of experience of the doctor")


class DoctorCreate(DoctorBase):
    username: str = Field(..., description="Doctor's full names")
    email: str = Field(..., description="Doctor's email address")
    hashed_password: str = Field(..., description="Hashed password of the doctor")


class DoctorUpdate(BaseModel):
    fullname: Optional[str] = Field(None, description="Full name of the doctor")
    phone_number: Optional[str] = Field(None, description="Phone number of the doctor")
    medical_license_number: Optional[str] = Field(None, description="Medical license number of the doctor")
    specialization: Optional[str] = Field(None, description="Specialization of the doctor")
    experience_years: Optional[int] = Field(None, description="Years of experience of the doctor")


class Doctor(DoctorBase):
    id: int = Field(..., description="ID of the doctor")
    user_id: int = Field(..., description="Associated user ID")
    consultations: List = Field(default=[], description="List of consultations handled by the doctor")

    model_config = ConfigDict(from_attributes=True)
