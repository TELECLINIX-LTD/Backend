import { Injectable, Logger } from '@nestjs/common';
import { EmailInput, EmailPasswordDto } from './email.dto';
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
        html: body,
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

  /**
   * Send an appointment confirmation email.
   * @param email - Recipient email address.
   * @param fullName - Full name of the recipient.
   * @param formattedDate - Formatted appointment date.
   */
  async sendAppointmentConfirmation(
    email: string,
    fullName: string,
    formattedDate: string,
  ): Promise<void> {
    const subject = 'Appointment Confirmation';

    const body = `Dear ${fullName},\n\nWe are pleased to inform you that your appointment has been scheduled for ${formattedDate}. Please note that the appointment is currently pending confirmation from the doctor. \n\nWe will notify you promptly once the doctor has confirmed. If you have any questions or need further assistance, please feel free to reach out to us.\n\nThank you for choosing our services. Wishing you good health and well-being.\n\nBest regards,\nTeleclinix Team`;

    await this.sendEmail({
      to: email,
      subject,
      body,
    });
  }

  private generateHtmlBody(fullName: string, token: string): any {
    return `
    <!DOCTYPE html>
      <html>
      <head>
        <style>
          h1{
          text-align: center;          
          }
          .reset-button {
            display: inline-block;
            padding: 1rem;
            border-radius: 8px;
            font-size: 16px;
            color: #ffffff !important;
            background-color: #2467E3;
            text-decoration: none;
            border: none;
            border-radius: 5px;
            font-weight: 500;
            font-size: 1rem;
            text-align: center;
          } 

        </style>
      </head>
      <body>
        <h1><b>TELECLINIX</b></h1>
        <p>Hello ${fullName},</p>
        <h2>Reset your password</h2>
        <p>We received a request to reset the password to your Teleclinix account. You can reset it by clicking on the button below. Please note this link will expire after 24 hours.</p>
        <div>
          <a href="https://teleclinix-react.vercel.app/reset-password?token=${token}" class="reset-button">
          Reset Password
          </a>
        </div>
        <p>If you didn’t initiate this request, please send us an email at <a href="mailto:support@teleclinix.com">support@teleclinix.co</a> so we can immediately look into this.</p>
        <p>Best regards,<br>Team Teleclinix</p>
      </body>
      </html>

    `;
  }
  async sendResetPasswordLink(
    emailPasswordDto: EmailPasswordDto,
  ): Promise<void> {
    const { email, resetPasswordLink, fullName } = emailPasswordDto;
    const subject = 'Reset Password';
    const body = this.generateHtmlBody(fullName, resetPasswordLink);

    await this.sendEmail({
      to: email,
      subject,
      body,
    });
  }

  async sendAppointmentAccepted(
    doctorsName: string,
    patientName: string,
    email: string,
    formattedDate: string,
  ): Promise<void> {
    const subject = 'Appointment Accepted';
    const body = `Dear ${patientName},\n\nWe are pleased to inform you that your appointment has been confirmed for ${formattedDate}. Dr. ${doctorsName} will be attending to you and is looking forward to providing you with the best care possible.\n\nIf you have any questions or need to reschedule, please feel free to contact us at your earliest convenience.\n\nThank you for choosing our services. Wishing you good health and a speedy recovery.\n\nBest regards,\n[Your Clinic Name] Team`;

    await this.sendEmail({
      to: email,
      subject,
      body,
    });
  }
}
