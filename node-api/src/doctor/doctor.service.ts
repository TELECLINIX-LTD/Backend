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
    return await this.db.doctor.findMany();
  }

  async deleteDoctor(doctorId: string): Promise<any> {
    // Check if doctor exists
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
  }
}
