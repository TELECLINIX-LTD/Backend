import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientProfileDto } from './dtos/patient-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';

@ApiTags('Patient')
@Controller('patient')
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
}
