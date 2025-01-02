import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsPasswordMatch } from 'src/common/validators/isPasswordMatch.validator';

export class userRegisterDto {
  @IsNotEmpty({ message: 'First name should not be empty.' })
  @IsString({ message: 'First name must be a string.' })
  @ApiProperty()
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty.' })
  @IsString({ message: 'Last name must be a string.' })
  @ApiProperty()
  lastName: string;

  @IsNotEmpty({ message: 'Email should not be empty.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8, { message: 'Password should be at least 8 characters long.' })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Gender should not be empty.' })
  @IsString({ message: 'Gender must be a string.' })
  @ApiProperty()
  gender: string;

  @IsNotEmpty({ message: 'Confirm password should not be empty.' })
  @MinLength(8, {
    message: 'Confirm password should be at least 8 characters long.',
  })
  
  @ApiProperty()
  @Validate(IsPasswordMatch, ['password'])
  confirm_password: string;
}

export class doctorRegistrationDto {
  @IsNotEmpty({ message: 'Email should not be empty.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'First name should not be empty.' })
  @IsString({ message: 'First name must be a string.' })
  @ApiProperty()
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty.' })
  @IsString({ message: 'Last name must be a string.' })
  @ApiProperty()
  lastName: string;

  @IsNotEmpty({ message: 'Phone number should not be empty.' })
  @IsString({ message: 'Phone number must be a string.' })
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty({ message: 'Medical license number should not be empty.' })
  @IsString({ message: 'Medical license number must be a string.' })
  @ApiProperty()
  licenseNumber: string;

  @IsNotEmpty({ message: 'Specialization should not be empty.' })
  @IsString({ message: 'Specialization must be a string.' })
  @ApiProperty()
  specialization: string;

  @IsNotEmpty({ message: 'Years of experience should not be empty.' })
  @IsInt({ message: 'Years of experience must be an integer.' })
  @ApiProperty()
  yearsOfExperience: number;

  @IsArray({ message: 'Availability must be an array of strings.' })
  @ArrayNotEmpty({ message: 'Availability cannot be empty.' })
  @IsString({ each: true, message: 'Each availability must be a string.' })
  @ApiProperty({
    description:
      'The doctor’s availability times as an array of strings (ISO 8601 format)',
    example: ['2024-12-30T09:00:00Z', '2024-12-30T14:00:00Z'],
  })
  availability: string[];

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8, { message: 'Password should be at least 8 characters long.' })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Confirm password should not be empty.' })
  @MinLength(8, {
    message: 'Confirm password should be at least 8 characters long.',
  })
  @ApiProperty()
  @Validate(IsPasswordMatch, ['password'])
  confirm_password: string;
}

export class VerifyTokenDto {
  @ApiProperty()
  @IsString()
  token: string;
}
