import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
  @ApiBody({
    description: 'Details required to register a new user',
    type: userRegisterDto,
    examples: {
      example1: {
        summary: 'Valid User Registration Data',
        value: {
          email: 'user@example.com',
          password: 'securePassword123',
          confirm_password: 'securePassword123',
        },
      },
    },
  })
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
  @ApiBody({
    description: 'Details required to register a new doctor',
    type: doctorRegistrationDto,
    examples: {
      example1: {
        summary: 'Valid Doctor Registration Data',
        value: {
          email: 'doctor@example.com',
          fullName: 'Dr. Jane Smith',
          phoneNumber: '08134567890',
          licenseNumber: 'LIC-4567',
          specialization: 'Cardiology',
          yearsOfExperience: 10,
          availability: '2024-12-22T09:00:00Z',
          password: 'securePassword123',
          confirm_password: 'securePassword123',
        },
      },
    },
  })
  async registerDoctor(@Body() doctorDto: doctorRegistrationDto) {
    return await this.authService.registerDoctor(doctorDto);
  }
}
