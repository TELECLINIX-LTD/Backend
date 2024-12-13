import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginInputDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @MinLength(8)
  @ApiProperty()
  password: string;
}
