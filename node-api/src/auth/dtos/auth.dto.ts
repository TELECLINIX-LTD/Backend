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
  @ApiProperty()
  email: string;

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

export class doctorRegistrationDto {
  @IsNotEmpty({ message: 'Email should not be empty.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Full name should not be empty.' })
  @IsString({ message: 'Full name must be a string.' })
  @ApiProperty()
  fullName: string;

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

  @IsNotEmpty({ message: 'Availability date and time should not be empty.' })
  @IsDateString({}, { message: 'Availability must be a valid date and time.' })
  @ApiProperty()
  availability: string;

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
