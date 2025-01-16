import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dtos/schedule-appointment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as path from 'path';
import * as fs from 'fs';
import * as multer from 'multer';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
@ApiTags('Appointment')
@Controller('appointment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('schedule')
  @Roles(Role.PATIENT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          // Save file to the "uploads" directory
          cb(null, './uploads/');
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + path.extname(file.originalname));
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Schedule an appointment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Create an appointment with optional details and required fields',
    type: CreateAppointmentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment scheduled successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAppointment(
    @UploadedFile() file: Multer.File,
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req: any,
  ): Promise<any> {
    let uploadedResultUrl = null;

    if (file) {
      const localFilePath = file.path;

      let resourceType: 'image' | 'video' | 'raw';
      const mimeType = file.mimetype;

      if (mimeType.startsWith('image')) {
        resourceType = 'image';
      } else if (mimeType.startsWith('video')) {
        resourceType = 'video';
      } else {
        resourceType = 'raw';
      }

      // Upload the local file to Cloudinary
      const publicId = `appointment-${Date.now()}`; // Create a custom public ID
      const uploadResult = await this.cloudinaryService.uploadMedia(
        localFilePath,
        publicId,
        resourceType,
      );

      // Get the URL from Cloudinary's response
      uploadedResultUrl = uploadResult.secure_url;

      fs.unlinkSync(localFilePath);
    }

    const userId = req.user.id;

    const appointmentData = {
      ...createAppointmentDto,
      uploadedResults: uploadedResultUrl,
    };

    return await this.appointmentService.createAppointment(
      userId,
      appointmentData,
    );
  }

  @Patch(':id/accept')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment accepted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized to accept this appointment',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async acceptAppointment(
    @Param('id') appointmentId: string,
    @Request() req: any,
  ): Promise<any> {
    const doctorId = req.user.id;
    return await this.appointmentService.acceptAppointment(
      appointmentId,
      doctorId,
    );
  }

  @Get()
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No appointments found' })
  async getAppointments(): Promise<any> {
    return await this.appointmentService.getAllAppointments();
  }
}
