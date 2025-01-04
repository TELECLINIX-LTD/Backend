import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    required: false,
    example: 'Follow-up consultation',
    description: 'The reason for the appointment.',
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string.' })
  reason?: string;

  @ApiProperty({
    required: false,
    example: 'Migraine',
    description: 'The ailment or condition.',
  })
  @IsOptional()
  @IsString({ message: 'Ailment must be a string.' })
  ailment?: string;

  @ApiProperty({
    required: false,
    example: 'Ibuprofen',
    description: 'The last medication taken.',
  })
  @IsOptional()
  @IsString({ message: 'Last medication must be a string.' })
  lastMedication?: string;

  @ApiProperty({
    required: false,
    example: 'Cardiology',
    description: 'The specialty required for the appointment.',
  })
  @IsOptional()
  @IsString({ message: 'Specialty must be a string.' })
  specialty?: string;

  @ApiProperty({
    required: false,
    example: 'Morning',
    description: 'Specific time slots to show for the appointment.',
  })
  @IsOptional()
  @IsString({ message: 'Show times for must be a string.' })
  showTimesFor?: string;

  @ApiProperty({
    required: false,
    example: 'file.png', // Example file name for uploaded results
    description: 'The file uploaded (as a string URL or file name).',
  })
  @IsOptional()
  @IsString({ message: 'Uploaded results must be a string.' })
  uploadedResults?: string;

  @ApiProperty({
    example: '2025-01-10T15:30:00.000Z',
    description: 'The time of the appointment in ISO format.',
  })
  @IsNotEmpty({ message: 'Appointment time is required.' })
  @IsDateString(
    {},
    { message: 'Appointment time must be in a valid ISO format.' },
  )
  appointmentTime: string;
}
