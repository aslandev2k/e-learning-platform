import { logger } from '@/utils/logger';

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
};

async function sendEmail({ to, subject, text }: SendEmailParams): Promise<void> {
  // TODO: Integrate with a real SMTP/email provider (e.g. nodemailer, Resend, SendGrid)
  logger.info('logger ~ [email.service] ~ sendEmail:', { to, subject, text });
}

async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: '[ELP] Xác thực email',
    text: `Mã xác thực của bạn là: ${otp}. Mã có hiệu lực trong 15 phút.`,
  });
}

async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: '[ELP] Đặt lại mật khẩu',
    text: `Mã đặt lại mật khẩu của bạn là: ${token}. Mã có hiệu lực trong 15 phút.`,
  });
}

export const EmailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
