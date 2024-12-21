import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsPasswordMatch } from 'src/common/validators/isPasswordMatch.validator';

export class userRegisterDto {
  @IsNotEmpty({ message: 'Email should not be empty.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8, { message: 'Password should be at least 8 characters long.' })
  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
  })
  password: string;

  @IsNotEmpty({ message: 'Confirm password should not be empty.' })
  @MinLength(8, {
    message: 'Confirm password should be at least 8 characters long.',
  })
  @ApiProperty({
    description: 'Confirmation of user password',
    example: 'SecurePass123!',
  })
  @Validate(IsPasswordMatch, ['password'])
  confirm_password: string;
}

export class doctorRegistrationDto {
  @IsNotEmpty({ message: 'Email should not be empty.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @ApiProperty({
    description: 'Doctor email address',
    example: 'doctor@example.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Full name should not be empty.' })
  @IsString({ message: 'Full name must be a string.' })
  @ApiProperty({
    description: 'Doctor full name',
    example: 'Dr. John Doe',
  })
  fullName: string;

  @IsNotEmpty({ message: 'Phone number should not be empty.' })
  @IsString({ message: 'Phone number must be a string.' })
  @ApiProperty({
    description: 'Doctor phone number',
    example: '+1-234-567-8901',
  })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Medical license number should not be empty.' })
  @IsString({ message: 'Medical license number must be a string.' })
  @ApiProperty({
    description: 'Doctor medical license number',
    example: 'MLN1234567',
  })
  licenseNumber: string;

  @IsNotEmpty({ message: 'Specialization should not be empty.' })
  @IsString({ message: 'Specialization must be a string.' })
  @ApiProperty({
    description: 'Doctor specialization (e.g., Cardiologist)',
    example: 'Cardiologist',
  })
  specialization: string;

  @IsNotEmpty({ message: 'Years of experience should not be empty.' })
  @IsInt({ message: 'Years of experience must be an integer.' })
  @ApiProperty({
    description: 'Years of experience as a doctor',
    example: 10,
  })
  yearsOfExperience: number;

  @IsNotEmpty({ message: 'Availability date and time should not be empty.' })
  @IsDateString({}, { message: 'Availability must be a valid date and time.' })
  @ApiProperty({
    description: 'Date and time that suits your availability',
    example: '2024-12-25T10:00:00Z',
  })
  availability: string;

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8, { message: 'Password should be at least 8 characters long.' })
  @ApiProperty({
    description: 'Doctor password',
    example: 'SecurePass123!',
  })
  password: string;

  @IsNotEmpty({ message: 'Confirm password should not be empty.' })
  @MinLength(8, {
    message: 'Confirm password should be at least 8 characters long.',
  })
  @ApiProperty({
    description: 'Confirmation of doctor password',
    example: 'SecurePass123!',
  })
  @Validate(IsPasswordMatch, ['password'])
  confirm_password: string;
}
