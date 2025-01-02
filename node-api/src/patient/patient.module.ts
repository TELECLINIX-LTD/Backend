import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [EmailModule],
  controllers: [PatientController],
  providers: [PatientService, PrismaService],
})
export class PatientModule {}
