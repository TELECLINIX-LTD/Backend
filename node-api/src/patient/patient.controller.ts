import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientProfileDto } from './dtos/patient-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';

@ApiTags('Patient')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('complete-profile')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Complete the patient profile' })
  @ApiBody({
    description: 'Patient profile information',
    type: PatientProfileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Patient profile completed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid data provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User is not logged in or the token is invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. The user does not have the required role.',
  })
  async completeProfile(
    @Body() patientProfileDto: PatientProfileDto,
    @Request() req: any,
  ): Promise<any> {
    const userId = req.user.id; // Extract user ID from the JWT token
    return await this.patientService.completeProfile(userId, patientProfileDto);
  }

  @Get()
  @Roles(Role.PATIENT)
  @ApiOperation({
    summary: 'Fetch all verified patients',
    description:
      'Retrieve a list of all patients who have a verified email address.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched patients.',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'cuid1234',
            email: 'johndoe@example.com',
            isEmailVerified: true,
            fullName: 'John Doe',
            phoneNumber: '+1234567890',
            gender: 'Male',
            Image: 'https://example.com/image.jpg',
            address: '123 Main Street',
            role: 'PATIENT',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-02T00:00:00.000Z',
            deletedAt: null,
            patient: {
              id: 'cuid5678',
              dateOfBirth: '1990-01-01T00:00:00.000Z',
              bloodGroup: 'O+',
              height: 180.5,
              weight: 75.3,
              emergencyContact: '+19876543210',
              healthcareProviders: [],
              appointments: [],
              medicalRecords: [],
              notifications: [],
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async getAllPatients() {
    const patients = await this.patientService.getAllVerifiedPatients();
    return {
      patients,
    };
  }
}
