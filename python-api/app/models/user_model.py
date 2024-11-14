from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Enum, ForeignKey
from database.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum



class UserRole(enum.Enum):
    doctor = "doctor"
    patient = "patient"


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, index=True)
    role = Column(Enum(UserRole), nullable=False)


    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    patient_profile = relationship("Patient", back_populates="user", uselist=False)



class Patient(Base):
    __tablename__ = 'patients'
    
    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    age = Column(Integer)
    medical_history = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    consultations = relationship("Consultation", back_populates="patient")


class Doctor(Base):
    __tablename__ = 'doctors'
    
    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    specialization = Column(String, nullable=False)
    experience_years = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    consultations = relationship("Consultation", back_populates="doctor")

class ConsultationStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELED = "canceled"

class Consultation(Base):
    __tablename__ = 'consultations'
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey('doctors.id'))
    patient_id = Column(Integer, ForeignKey('patients.id'))
    scheduled_time = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(ConsultationStatus), default=ConsultationStatus.PENDING)
    notes = Column(Text)
    
    # Relationships
    doctor = relationship("Doctor", back_populates="consultations")
    patient = relationship("Patient", back_populates="consultations")
    prescriptions = relationship("Prescription", back_populates="consultation")

class Prescription(Base):
    __tablename__ = 'prescriptions'
    
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey('consultations.id'))
    medication = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    instructions = Column(Text)
    
    # Relationships
    consultation = relationship("Consultation", back_populates="prescriptions")