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
    patientProfileDto: PatientProfileDto,
    userId: any,
  ): Promise<any> {
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
}
