import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsPasswordMatch } from 'src/common/validators/isPasswordMatch.validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email should not be empty.' })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8)
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Confirm password should not be empty.' })
  @MinLength(8)
  @ApiProperty()
  @Validate(IsPasswordMatch, ['password'])
  confirm_password: string;
}
