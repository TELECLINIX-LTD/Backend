import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';

@ApiTags('Doctors')
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get all doctors' }) // Description for Swagger
  @ApiResponse({
    status: 200,
    description: 'List of all doctors',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAllDoctors() {
    return await this.doctorService.findAll();
  }

  @Get('profile')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get doctor profile' })
  @ApiResponse({
    status: 200,
    description: 'Doctor profile',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
  })
  async getDoctorProfile(@Param('id') doctorId: string): Promise<any> {
    return await this.doctorService.getDoctorProfile(doctorId);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a doctor' })
  @ApiResponse({
    status: 200,
    description: 'Doctor deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
  })
  async deleteDoctor(
    @Param('id') doctorId: string,
  ): Promise<{ message: string }> {
    return await this.doctorService.deleteDoctor(doctorId);
  }
}
