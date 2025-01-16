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

    const mailOptions = {
      from: `"Notification" <${senderEmail}>`,
      to,
      subject,
      html: body,
      cc,
      bcc,
    };

    try {
      this.logger.debug('Attempting to send email:', {
        to,
        subject,
        hasCC: !!cc,
        hasBCC: !!bcc,
      });

      await this.transporter.sendMail(mailOptions);
      this.logger.log('Email sent successfully:');
    } catch (error) {
      this.logger.error('Email sending failed:', {
        error: error.message,
        code: error.code,
        command: error.command,
      });
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  private generateHtmlBody(content: string): any {
    const backgroundImage =
      'https://img.freepik.com/free-vector/elegant-white-wallpaper-with-golden-details_23-2149095007.jpg?semt=ais_hybrid';

    return `
      <!DOCTYPE html>
              
        <html>
        <head>
            <title>Your Health, Anytime, Anywhere</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: url(${backgroundImage}) no-repeat center center fixed;
                    background-size: cover;
                    color: black;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border-radius: 5px;
                }
                h1 {
                    color: white;
                    background-color: rgb(7, 9, 12);
                    text-align: center;
                    font-size: 36px;
                    padding: 60px 0;
                    margin: 0;
                }

                .reset-button{
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

                .container p {
                    margin: 15px 0;
                    font-size: 14px;
                    line-height: 1.6;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                      font-size: 8px;
                      color: white;
                      background-color: rgb(7, 9, 12);
                      padding: 20px 10px;
                }
                .footer h2 {
                    margin: 0;
                    padding-bottom: 20px;
                    font-size: 12px;
                }
                .footer .footer-content {
                    font-size: 8px;
                    text-align: left;
                    max-width: 200px;
                }
                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    padding-top: 10px;
                    font-size: 6px;
                    margin-top: 15px;
                    color: #007bff;

                }

                .footer-bottom p{
                  font-size: 6px;
                }    
          
            </style>
        </head>
        <body>
            <div class="container">
                <h1>TELECLINIX</h1>
                ${content}
                <p>Warm regards,</p>
                <p>Info@teleclinix.com</p>
                <div class="footer">
                    <div class="footer-content">
                        <h2>TELECLINIX</h2>
                      Teleclinix is an online platform that allows users to book doctor appointments easily and conveniently. It provides a seamless experience for scheduling consultations, making healthcare accessible from the comfort of home. With Teleclinix, patients can manage their health appointments efficiently, promoting a healthier, more connected community.
                    </div>
                    <div class="footer-bottom">
                        &copy; Copyright Teleclinix. All Rights Reserved.                        
                    </div>                    
                </div>
            </div>
        </body>
        </html>

    `;
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
    const content = `
        <p>Please use the following verification code to complete your registration:</p>
        <h2>${emailToken}</h2>`;
    const body = this.generateHtmlBody(content);

    await this.sendEmail({
      to: [email],
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
    const content = `
      <p>Dear ${fullName},</p>
      <p>We are pleased to inform you that your appointment has been scheduled for ${formattedDate}. Please note that the appointment is currently pending confirmation from the doctor.</p>
      <p>We will notify you promptly once the doctor has confirmed. If you have any questions or need further assistance, please feel free to reach out to us.</p>
      <p>Thank you for choosing our services. Wishing you good health and well-being.</p>
      <p>Best regards,</p>
      <p>Teleclinix Team</p>
    `;
    const htmlBody = this.generateHtmlBody(content);

    await this.sendEmail({
      to: [email],
      subject,
      body: htmlBody,
    });
  }

  /**
   * Send an appointment confirmation email.
   * @param email - Recipient email address.
   * @param fullName - Full name of the recipient.
   * @param formattedDate - Formatted appointment date.
   */
  async sendResetPasswordLink(
    emailPasswordDto: EmailPasswordDto,
  ): Promise<void> {
    const { fullName, email, token } = emailPasswordDto;
    const subject = 'Reset Password';
    const content = `
        <p>Hello ${fullName},</p>
        <h2>Reset your password</h2>
        <p>We received a request to reset the password to your Teleclinix account. You can reset it by clicking on the button below. Please note this link will expire after 24 hours.</p>
        <div>
          <a href="https://teleclinix-react.vercel.app/reset-password?token=${token}" class="reset-button">
          Reset Password
          </a>
        </div>`;
    const htmlBody = this.generateHtmlBody(content);

    await this.sendEmail({
      to: [email],
      subject,
      body: htmlBody,
    });
  }

  async sendAppointmentAccepted(
    doctorsName: string,
    patientName: string,
    email: string,
    formattedDate: string,
  ): Promise<void> {
    const subject = 'Appointment Accepted';

    const content = `
    <p>Dear ${patientName},</p>
    <p>We are pleased to inform you that your appointment has been confirmed for ${formattedDate}. Dr. ${doctorsName} will be attending to you and is looking forward to providing you with the best care possible.</p>
    <p>If you have any questions or need to reschedule, please feel free to contact us at your earliest convenience.</p>
    <p>Thank you for choosing our services. Wishing you good health and a speedy recovery.</p>
  `;
    const body = this.generateHtmlBody(content);

    await this.sendEmail({
      to: [email],
      subject,
      body,
    });
  }
}
