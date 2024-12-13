import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dtos/auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async signup(@Body() AuthDto: RegisterDto) {
    return await this.authService.signup(AuthDto);
  }
}
