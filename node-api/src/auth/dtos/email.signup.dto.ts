import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailSignupInputDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
