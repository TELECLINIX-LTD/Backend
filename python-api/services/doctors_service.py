from sqlalchemy.orm import Session
from models.model import Doctor, User
from schemas.doctor_schema import DoctorCreate, DoctorUpdate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_all_doctors(db: Session):
    """
    Retrieve all doctors from the database.
    """
    return db.query(Doctor).all()


def get_doctor_by_id(db: Session, doctor_id: int):
    """
    Retrieve a doctor by their ID.
    """
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()


def create_doctor(db: Session, doctor_data: DoctorCreate):
    """
    Create a new doctor and their corresponding user.
    """
    # Hash the password
    hashed_password = pwd_context.hash(doctor_data.hashed_password)

    # Create a user
    new_user = User(
        username=doctor_data.username,
        email=doctor_data.email,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create a doctor
    new_doctor = Doctor(
        id=new_user.id,
        fullname=doctor_data.username,
        email=doctor_data.email,
        phone_number=doctor_data.phone_number,
        medical_license_number=doctor_data.medical_license_number,
        specialization=doctor_data.specialization,
        experience_years=doctor_data.experience_years,
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor


def update_doctor(db: Session, doctor_id: int, doctor_data: DoctorUpdate):
    """
    Update an existing doctor.
    """
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return None

    # Update the fields provided
    for key, value in doctor_data.dict(exclude_unset=True).items():
        setattr(doctor, key, value)

    db.commit()
    db.refresh(doctor)
    return doctor


def delete_doctor(db: Session, doctor_id: int):
    """
    Delete a doctor by ID.
    """
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return None

    db.delete(doctor)
    db.commit()
    return doctor
