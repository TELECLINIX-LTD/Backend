import { Controller, Delete, Get, Param } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
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
    console.log(doctorId, 'I am the id');
    return await this.doctorService.deleteDoctor(doctorId);
  }
}
