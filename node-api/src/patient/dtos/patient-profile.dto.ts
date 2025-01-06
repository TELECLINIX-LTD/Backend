import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatientProfileDto {
  @IsNotEmpty({ message: 'Date of birth should not be empty.' })
  @IsDateString(
    {},
    { message: 'Date of birth must be a valid ISO date string.' },
  )
  @ApiProperty({
    example: '1990-01-01',
    description: "The patient's date of birth.",
  })
  dateOfBirth: Date;

  @IsOptional()
  @IsString({ message: 'Blood group must be a string.' })
  @ApiProperty({
    example: 'A+',
    description: "The patient's blood group.",
    required: false,
  })
  bloodGroup?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Height must be a number.' })
  @Min(50, { message: 'Height should be at least 50 cm.' })
  @Max(250, { message: 'Height should not exceed 250 cm.' })
  @ApiProperty({
    example: 170,
    description: "The patient's height in centimeters.",
    required: false,
  })
  height?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number.' })
  @Min(3, { message: 'Weight should be at least 3 kg.' })
  @Max(500, { message: 'Weight should not exceed 500 kg.' })
  @ApiProperty({
    example: 65,
    description: "The patient's weight in kilograms.",
    required: false,
  })
  weight?: number;
}
