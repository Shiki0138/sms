import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"美容室システム" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html || this.generateHtmlTemplate(message.text, message.subject)
      });

      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  private generateHtmlTemplate(text: string, subject: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subject}</h1>
          </div>
          <div class="content">
            ${text.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>このメールは美容室管理システムから自動送信されています。</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}