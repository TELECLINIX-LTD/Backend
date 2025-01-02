import { Injectable } from '@nestjs/common';

@Injectable()
export class PatientService {
  async completeProfile() {
    return 'Complete profile';
  }
}
