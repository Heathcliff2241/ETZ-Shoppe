import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtp(toEmail: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"ETZ A Shoppe" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Your Admin Login Code: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafaf8; border: 1px solid #e5e3de; border-radius: 12px;">
        <h2 style="margin: 0 0 8px; font-size: 22px; color: #1c1c1a;">ETZ A Shoppe</h2>
        <p style="color: #6b6b65; font-size: 14px; margin: 0 0 24px;">Admin Login Verification</p>
        <p style="color: #1c1c1a; font-size: 15px; margin: 0 0 16px;">Your one-time login code is:</p>
        <div style="background: #1c1c1a; color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
          ${code}
        </div>
        <p style="color: #6b6b65; font-size: 13px; margin: 0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  });
}
