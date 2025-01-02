import { Controller, Post } from '@nestjs/common';
import { PatientService } from './patient.service';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('complete-profile')
  async completeProfile() {
    return await this.patientService.completeProfile();
  }
}
