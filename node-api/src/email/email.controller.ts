import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { EmailInput, EmailOutput } from './email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: EmailOutput,
    description: 'Email sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Email sending failed',
  })
  async sendEmail(@Body() emailInput: EmailInput): Promise<EmailOutput> {
    try {
      await this.emailService.sendEmail(emailInput);
      return { message: 'Email sent successfully' };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: 'Email sending failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
