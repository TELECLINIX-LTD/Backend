import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailModule } from 'src/email/email.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [EmailModule],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    PrismaService,
    CloudinaryService,
    RedisService,
  ],
})
export class AppointmentModule {}
