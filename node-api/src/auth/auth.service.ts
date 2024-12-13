import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async signup(AuthDto: any) {
    return AuthDto;
  }
}
