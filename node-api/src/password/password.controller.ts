import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import {
  ResetPasswordRequestDto,
  ResetPasswordDto,
} from './dtos/reset-password.dto';
import { PasswordService } from './password.service';

@ApiTags('Password')
@Controller('auth/password')
export class PasswordController {
  constructor(private passwordService: PasswordService) {}

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send reset password link to the user' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or email is not verified',
  })
  async forgotPassword(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ) {
    const result = await this.passwordService.sendResetPasswordLink(
      resetPasswordRequestDto,
    );

    return result;
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password using token and new password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found, or expired token',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'The reset password in your query params',
    type: String,
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('token') token?: string,
  ) {
    const result = await this.passwordService.resetPassword(
      resetPasswordDto,
      token,
    );
    return result;
  }
}
