import { Injectable, Logger } from '@nestjs/common';
import { EmailInput } from './email.dto';
import { EmailConfig } from './email.config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly emailConfig: EmailConfig) {
    this.initializeTransporter();
    this.verifyConnection();
  }

  /**
   * Initialize the SMTP transporter with the email credentials.
   */
  private async initializeTransporter() {
    const config = this.emailConfig.getEmailCredentials();
    this.logger.log(
      `Initialize email service config: Host=${config.host}, Port=${config.port}, Secure=${config.secure}`,
    );

    this.transporter = nodemailer.createTransport({
      ...config,
      debug: true,
      logger: true,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  /**
   * Verify the SMTP connection to ensure it is properly set up.
   */
  private async verifyConnection() {
    try {
      const result = await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully:', result);
    } catch (error) {
      this.logger.error('SMTP connection failed:', error);
      console.log('SMTP connection failed:', error);
      throw new Error(`SMTP connection failed: ${error.message}`);
    }
  }

  /**
   * Send an email using the specified input parameters.
   * @param emailInput - Email input containing recipients, subject, and body.
   */
  async sendEmail(emailInput: EmailInput): Promise<void> {
    const { to, subject, body, cc, bcc } = emailInput;
    const senderEmail = this.emailConfig.getEmailCredentials().auth.user;
    try {
      const mailOptions = {
        from: `"Notification" <${senderEmail}>`,
        to,
        subject,
        text: body,
        cc,
        bcc,
      };

      this.logger.debug('Attempting to send email:', {
        to,
        subject,
        hasCC: !!cc,
        hasBCC: !!bcc,
      });
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log('Email sent successfully:', result);
    } catch (error) {
      this.logger.error('Email sending failed:', {
        error: error.message,
        code: error.code,
        command: error.command,
      });
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Send an email verification message with a token.
   * @param email - Recipient email address.
   * @param emailToken - Token for email verification.
   */

  async sendEmailVerification(
    email: string,
    emailToken: string,
  ): Promise<void> {
    const subject = 'Email Verification';
    const body = `Please use the following verification code to complete your registration: ${emailToken}`;

    await this.sendEmail({
      to: email,
      subject,
      body,
    });
  }
}
