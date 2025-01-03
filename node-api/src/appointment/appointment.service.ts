import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly db: PrismaService,
    private readonly emailService: EmailService,
  ) {}
  async createAppointment(appointmentData): Promise<any> {
    const appointment = await this.db.appointment.create({
      data: appointmentData,
    });

    const user = await this.db.user.findUnique({
      where: { id: appointmentData.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { email, fullName } = user;

    // Format the appointment time
    const appointmentTime = new Date(appointment.appointmentTime);
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(appointmentTime);

    await this.emailService.sendAppointmentConfirmation(
      email,
      fullName,
      formattedDate,
    );
    return {
      message: 'Appointment created and email sent successfully',
      data: appointment,
    };
  }
}
