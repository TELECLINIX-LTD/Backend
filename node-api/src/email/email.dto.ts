import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailInput {
  @ApiProperty({
    description:
      'Recipient(s) of the email. Can be a single email string or an array of emails.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];
}

export class EmailPasswordDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  token: string;
}

export class EmailOutput {
  @ApiProperty()
  message: string;
}
