from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Doctor(Base):
    __tablename__ = 'doctors'
    
    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    specialization = Column(String, nullable=False)
    experience_years = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    consultations = relationship("Consultation", back_populates="doctor")