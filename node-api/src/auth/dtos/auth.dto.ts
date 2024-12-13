import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, Validate } from 'class-validator';
import { IsPasswordMatch } from 'src/common/validators/isPasswordMatch.validator';

export class RegisterDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @MinLength(8)
  @ApiProperty()
  password: string;

  @MinLength(8)
  @ApiProperty()
  @Validate(IsPasswordMatch, ['password']) 
  confirm_password: string;
}
