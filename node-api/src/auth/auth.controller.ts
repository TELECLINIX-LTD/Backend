import { Body, Controller, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  doctorRegistrationDto,
  userRegisterDto,
  VerifyTokenDto,
} from './dtos/auth.dto';
import { LoginInputDto } from './dtos/login-input.dto';
// import { Request } from 'express';
import * as useragent from 'useragent';

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
          firstName: 'John',
          lastName: 'Doe',
          email: 'joheDoe@example.com',
          gender: 'Male',
          password: 'securePassword123',
          confirm_password: 'securePassword123',
        },
      },
    },
  })
  async signup(@Body() AuthDto: userRegisterDto) {
    return await this.authService.signup(AuthDto);
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verify the email token' })
  @ApiResponse({
    status: 200,
    description: 'Your email has been verified. You can now log in.',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @ApiBody({
    description: 'Token required to verify email',
    type: VerifyTokenDto,
    examples: {
      example1: {
        summary: 'Valid Token',
        value: {
          token: '23458',
        },
      },
    },
  })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto): Promise<any> {
    return this.authService.verifyToken(verifyTokenDto.token);
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
          firstName: 'Jane',
          lastName: 'Okaoye',
          email: 'janeOkaoye@example.com',
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

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    description: 'Details required to login a user',
    type: userRegisterDto,
    examples: {
      example1: {
        summary: 'Valid User Login Data',
        value: {
          email: 'jose@gmail.com',
          password: 'securePassword123',
        },
      },
    },
  })
  async login(
    @Body() loginDto: LoginInputDto,
    @Request() req: any,
  ): Promise<any> {
    // Get IP and Device Info
    let ipAddress = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.ip || 'Unknown IP';

    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
      ipAddress = 'localhost';
    }

    const agent = useragent.parse(
      req.headers['user-agent'] || 'Unknown Device',
    );
    const deviceInfo =
      agent.family !== 'Other'
        ? `${agent.family} ${agent.os.family}`
        : 'Unknown Device';

    const session = {
      ipAddress,
      deviceInfo,
    };
    return await this.authService.login(loginDto, session);
  }
}
