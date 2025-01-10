import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoctorService {
  constructor(
    private readonly db: PrismaService,
    private readonly emailService: EmailService,
  ) {}
  async findAll() {
    const doctors = await this.db.doctor.findMany({
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        licenseNumber: true,
        specialization: true,
        availability: true,
        yearsOfExperience: true,
      },
    });

    return doctors;
  }

  async getDoctorProfile(doctorId: string) {
    const doctor = await this.db.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        licenseNumber: true,
        specialization: true,
        availability: true,
        yearsOfExperience: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async deleteDoctor(doctorId: string): Promise<any> {
    // Check if doctor exists
    try {
      const doctor = await this.db.doctor.findUnique({
        where: { id: doctorId },
        include: { user: true },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
      // Use a transaction to ensure both operations are done atomically
      await this.db.$transaction([
        this.db.doctor.delete({
          where: { id: doctorId },
        }),
        this.db.user.delete({
          where: { id: doctor.userId },
        }),
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'Doctor and associated user deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw new Error('An error occurred while deleting the doctor.');
    }
  }
}
