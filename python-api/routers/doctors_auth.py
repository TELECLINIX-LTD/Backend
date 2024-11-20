from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from services import doctors_service
from schemas import doctor_schema
from database.database import get_db

doc_router = APIRouter(prefix="/doctors")

@doc_router.get("/", response_model=list[doctor_schema.Doctor])
def get_all_doctors(db: Session = Depends(get_db)):
    doctors = doctors_service.get_all_doctors(db)
    return doctors

@doc_router.get("/{id}", response_model=doctor_schema.Doctor)
def get_doctor_by_id(id: int, db: Session = Depends(get_db)):
    doctor = doctors_service.get_doctor_by_id(db, id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor

@doc_router.post("/", response_model=doctor_schema.Doctor)
def create_doctor(doctor: doctor_schema.DoctorCreate, db: Session = Depends(get_db)):
    new_doctor = doctors_service.create_doctor(db, doctor)
    return new_doctor

@doc_router.put("/{id}", response_model=doctor_schema.Doctor)
def update_doctor(id: int, doctor: doctor_schema.DoctorUpdate, db: Session = Depends(get_db)):
    updated_doctor = doctors_service.update_doctor(db, id, doctor)
    if not updated_doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return updated_doctor

@doc_router.delete("/{id}")
def delete_doctor(id: int, db: Session = Depends(get_db)):
    deleted_doctor = doctors_service.delete_doctor(db, id)
    if not deleted_doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return {"detail": "Doctor deleted"}



