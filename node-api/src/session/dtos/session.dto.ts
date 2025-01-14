import {
  IsString,
  IsNotEmpty,
  IsIP,
  IsOptional,
  IsIn,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

export class QuerySessionDto {
  @ApiProperty({
    description: 'The sort order of the sessions.',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Order must be asc or desc' })
  sort: string = 'desc';

  @ApiProperty({
    description: 'The limit of sessions to retrieve.',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  limit: number = 10;

  @ApiProperty({
    description: 'The page number to retrieve.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  page: number = 1;

  @ApiProperty({
    description: 'The field to sort the sessions by.',
    example: 'loginTime',
  })
  @IsOptional()
  @IsString()
  @IsIn(['loginTime', 'sessionId'], {
    message: 'Sort by must be loginTime or sessionId',
  })
  sortBy: string = 'loginTime';
}

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
