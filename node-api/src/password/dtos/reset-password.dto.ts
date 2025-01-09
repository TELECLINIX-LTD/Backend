import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'New password should not be empty' })
  @MinLength(8)
  @ApiProperty({
    description: 'The new password of the user',
    example: 'newPassword123',
  })
  newPassword: string;
}

export class ResetPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email of the user who wants to reset the password',
    example: 'user@example.com',
  })
  email: string;
}
