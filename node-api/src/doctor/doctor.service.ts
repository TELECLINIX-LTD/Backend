import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class DoctorService {
  constructor(
    private readonly db: PrismaService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
  ) {}
  async findAll() {
    const cacheKey = 'all_doctors';

    // Check if doctors are cached
    const cachedDoctors = await this.redisService.get(cacheKey);
    if (cachedDoctors) {
      console.log('All doctors data fetched from cache');
      return cachedDoctors;
    }

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

    //set cache
    const doctorsincahce = await this.redisService.set(
      cacheKey,
      JSON.stringify(doctors),
      3600,
    );
    console.log('All doctors data fetched from database', doctorsincahce);

    return doctors;
  }

  async getDoctorProfile(doctorId: string) {
    const cachedProfile = `doctor-${doctorId}`;

    // Check if doctor profile is cached
    const cachedDoctor = await this.redisService.get(cachedProfile);
    if (cachedDoctor) {
      console.log('Data fetched from cache');
      return cachedDoctor;
    }

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

    //set cache
    await this.redisService.set(cachedProfile, JSON.stringify(doctor), 1000);

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
      throw new BadRequestException('Failed to delete doctor and user');
    }
  }
}
