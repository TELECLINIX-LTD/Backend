import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}
  async signup(AuthDto: RegisterDto) {
    const { password, email } = AuthDto;
    const existingUser = await this.db.user.findUnique({
      where: { email: AuthDto.email },
    });

    if (existingUser) {
      throw new Error('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.db.user.create({
      data: {
        email: email,
        password: hashedPassword,
        
      },
    });
    return user;
  }
}
