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
    const body = `Dear ${fullName},\n\nYour appointment has been confirmed for ${formattedDate}. Wait for the doctor's confirmation.`;

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
    /* Add button styling */
    h1{

    text-align: center;
    
    }
    .reset-button {
      display: inline-block;
      padding: 10px 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
      text-decoration: none;
      border-radius: 5px;
      border: none;
    }
    .reset-button:hover {
      background-color: #0056b3;
    }
    .rest-button-container p {
    color: white;

   }
  </style>
</head>
<body>
  <h1><b>TELECLINIX</b></h1>
  <p>Hello ${fullName},</p>
  <h2>Reset your password</h2>
  <p>We received a request to reset the password to your Teleclinix account. You can reset it by clicking on the button below. Please note this link will expire after 24 hours.</p>
  <p class="reset-button-container">
    <a href="https://teleclinix-react.vercel.app/reset-password?token=${token}" class="reset-button">
      Reset Password
    </a>
  </p>
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
}
