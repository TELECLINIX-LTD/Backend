import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { doctorRegistrationDto, userRegisterDto } from './dtos/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async signup(@Body() AuthDto: userRegisterDto) {
    return await this.authService.signup(AuthDto);
  }

  @Post('doctor/register')
  @ApiOperation({ summary: 'Register a new doctor' })
  @ApiResponse({
    status: 201,
    description: 'The doctor has been successfully registered.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async registerDoctor(@Body() doctorDto: doctorRegistrationDto) {
    return await this.authService.registerDoctor(doctorDto);
  }
}
