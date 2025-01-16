import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const user = await this.db.user?.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const patient = await this.db.patient?.findUnique({
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
    const cachedKey = 'allPendingAppointments';
    const cachedAppointments = await this.redisService.get(cachedKey);
    if (cachedAppointments) {
      console.log('All appointments data fetched from cache');
      return JSON.parse(cachedAppointments);
    }

    const appointments = await this.db.appointment.findMany({
      where: { status: 'PENDING' },
    });

    if (!appointments || appointments.length === 0) {
      throw new Error('No pending appointments found');
    }

    await this.redisService.set(cachedKey, JSON.stringify(appointments), 3600);

    return {
      message: 'All Pending appointments retrieved successfully',
      data: appointments,
    };
  }

  async acceptAppointment(
    appointmentId: string,
    doctorId: string,
  ): Promise<any> {
    const doctor = await this.db.user?.findUnique({
      where: { id: doctorId },
    });
    const appointment = await this.db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.db.appointment.update({
      where: { id: appointmentId },
      data: {
        doctorId: doctorId,
        status: 'ACCEPTED',
      },
    });

    const { fullName } = doctor;
    const patientName = appointment.patient?.user?.fullName;
    const patientEmail = appointment.patient?.user?.email;
    const appointmentTime = new Date(appointment.appointmentTime);
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(appointmentTime);

    await this.emailService.sendAppointmentAccepted(
      fullName,
      patientName,
      patientEmail,
      formattedDate,
    );

    return {
      message: 'Appointment accepted successfully',
    };
  }
}
