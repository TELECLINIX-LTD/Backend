import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';
import { EmailConfig } from './email.config';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailConfig],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
