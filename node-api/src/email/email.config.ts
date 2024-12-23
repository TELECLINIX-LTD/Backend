import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailConfig {
  private user: string;
  private password: string;
  constructor(private configService: ConfigService) {
    this.user = this.configService.get<string>('MAIL_USER');
    this.password = this.configService.get<string>('MAIL_PASS');
    if (!this.user && !this.password) {
      throw new Error('Email credentials are not set');
    }
  }

  getEmailCredentials() {
    return {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.user,
        pass: this.password,
      },
    };
  }
}
