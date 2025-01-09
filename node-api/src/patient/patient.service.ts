import { Injectable } from '@nestjs/common';
import { PatientProfileDto } from './dtos/patient-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class PatientService {
  constructor(
    private readonly db: PrismaService,
    private readonly emailService: EmailService,
  ) {}
  async completeProfile(
    userId: string,
    patientProfileDto: PatientProfileDto,
  ): Promise<any> {
    try {
      const { dateOfBirth, bloodGroup, height, weight } = patientProfileDto;
      //find if the patient exists
      const patient = await this.db.patient.findUnique({
        where: { userId: userId },
      });
      if (!patient) {
        throw new Error('Patient not found');
      }
      //update the patient profile
      await this.db.patient.update({
        where: { id: patient.id },
        data: {
          dateOfBirth: dateOfBirth,
          bloodGroup: bloodGroup,
          height: height,
          weight: weight,
        },
      });

      return {
        message: 'Patient profile updated successfully',
      };
    } catch (error) {
      console.error('Error updating patient profile:', error);
      throw new Error('An error occurred while updating the profile.');
    }
  }

  async getAllVerifiedPatients() {
    const data = await this.db.user.findMany({
      where: {
        role: 'PATIENT',
        isEmailVerified: true,
      },
    });

    return data;
  }

  async getPatientProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
    const patient = await this.db.patient.findFirst({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        dateOfBirth: true,
        bloodGroup: true,
        height: true,
        weight: true,
        emergencyContact: true,
        healthcareProviders: true,
        appointments: true,
        medicalRecords: true,
        notifications: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    return patient;
  }
}
