import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly db: PrismaService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
  ) {}
  async createAppointment(userId, appointmentData): Promise<any> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const patient = await this.db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const { email, fullName } = user;
    const { id: patientId } = patient;

    // Add patientId to the appointment data
    const appointmentWithPatientId = {
      ...appointmentData,
      patientId, // Add patientId here
    };

    const appointment = await this.db.appointment.create({
      data: appointmentWithPatientId,
    });

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

  async getAllAppointments(): Promise<any> {
    //add cache key
    const cachedKey = 'all_appointments';
    const cachedAppointments = await this.redisService.get(cachedKey);
    if (cachedAppointments) {
      console.log('All appointments data fetched from cache');
      return JSON.parse(cachedAppointments);
    }

    const appointments = await this.db.appointment.findMany();
    if (!appointments) {
      throw new Error('No appointments found');
    }

    await this.redisService.set(cachedKey, JSON.stringify(appointments), 3600);

    return {
      message: 'Appointments retrieved successfully',
      data: appointments,
    };
  }
}
