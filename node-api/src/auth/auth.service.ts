import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { doctorRegistrationDto, userRegisterDto } from './dtos/auth.dto';
import { EmailService } from 'src/email/email.service';
import { LoginInputDto } from './dtos/login-input.dto';
import { SystemMessages } from 'src/common/constants/system.messages';
import { SessionDto } from 'src/session/dtos/session.dto';
import { SessionService } from 'src/session/session.service';
import { omit } from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
  ) {}

  async signup(AuthDto: userRegisterDto) {
    const { password, email, firstName, lastName, gender } = AuthDto;

    const emailToken = Math.floor(100000 + Math.random() * 900000).toString();

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
        fullName: `${firstName} ${lastName}`,
        gender: gender,
        emailToken,
      },
    });

    await this.db.patient.create({
      data: {
        userId: user.id,
      },
    });

    await this.emailService.sendEmailVerification(user.email, emailToken);
    return user;
  }

  async verifyToken(token: string) {
    const user = await this.db.user.findFirst({
      where: { emailToken: token },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    await this.db.user.update({
      where: { id: user.id },
      data: { emailToken: null, isEmailVerified: true },
    });
    return { message: 'Your email has been verified. You can now log in.' };
  }

  async registerDoctor(doctorDto: doctorRegistrationDto) {
    const {
      confirm_password,
      email,
      password,
      firstName,
      gender,
      lastName,
      phoneNumber,
      ...doctorDetails
    } = doctorDto;

    if (password !== confirm_password) {
      throw new Error('Passwords do not match');
    }

    const existingDoctor = await this.db.user.findUnique({
      where: { email: email },
    });

    if (existingDoctor) {
      throw new Error('Email is already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.db.user.create({
      data: {
        email: email,
        password: hashedPassword,
        gender: gender,
        fullName: `${firstName} ${lastName}`,
        phoneNumber: phoneNumber,
        role: 'DOCTOR',
      },
    });

    const doctor = await this.db.doctor.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        ...doctorDetails,
      },

      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });
    return doctor;
  }

  async login(loginDto: LoginInputDto, session) {
    const { deviceInfo, ipAddress } = session;
    const user = await this.db.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    if (user.role === 'PATIENT' && !user.isEmailVerified) {
      throw new BadRequestException(
        'Please verify your email before logging in',
      );
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException(
        SystemMessages.AUTH_INVALID_PASSWORD_CREDENTIALS,
      );
    }

    const token = this.jwtService.sign(
      { id: user.id, role: user.role },
      {
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
        secret: this.config.get('JWT_SECRET_KEY'),
      },
    );

    const logSessionDto: SessionDto = {
      userId: user.id,
      deviceInfo,
      ipAddress,
    };

    await this.sessionService.logSession(logSessionDto);
    const userWithoutPassword = omit(user, 'password');

    const userData = { token, user: userWithoutPassword };
    return userData;
  }
}
