import { IsString, IsNotEmpty, IsIP } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SessionDto {
  @ApiProperty({
    description: 'The ID of the user logging the session.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Information about the device used to log in.',
    example:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  })
  @IsString()
  @IsNotEmpty()
  deviceInfo: string;

  @ApiProperty({
    description: 'IP address of the user during login.',
    example: '192.168.1.1',
  })
  @IsIP()
  @IsNotEmpty()
  ipAddress: string;
}

export class LogOutDto {
  @ApiProperty({
    description: 'The ID of the session to log out the user from.',
    example: 'abcd1234-56ef-78gh-90ij-klmn12345opq',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
