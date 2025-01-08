import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ResetPasswordDto,
  ResetPasswordRequestDto,
} from './dtos/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PasswordService {
  constructor(
    private readonly emailService: EmailService,
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async sendResetPasswordLink(
    resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<boolean> {
    const { email } = resetPasswordDto;
    try {
      const user = await this.db.user?.findUnique({
        where: { email },
      });

      if (!user || !user.isEmailVerified) {
        return false;
      }
      const payload = { id: user.id };
      const token = this.jwtService.sign(payload);
      const resetPasswordLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
      const emailPasswordDto = {
        email: user.email,
        fullName: user.fullName,
        resetPasswordLink,
      };
      await this.emailService.sendResetPasswordLink(emailPasswordDto);

      return true;
    } catch (error) {
      console.error('Error sending reset password link:', error);
      throw new Error(
        'An error occurred while sending the reset password link.',
      );
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    token: string,
  ): Promise<any> {
    const { newPassword } = resetPasswordDto;
    const { id } = this.jwtService.verify(token);
    const user = await this.db.user.findUnique({
      where: { id },
    });
    console.log('user the fucking uer', user);
    if (!user) {
      throw new HttpException(
        'User not found, or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the new password is the same as the current password
    const isMatch = await bcrypt.compare(newPassword, user.password);
    if (isMatch) {
      throw new HttpException(
        'New password cannot be the same as the current password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
