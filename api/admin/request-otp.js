import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const { default: nodemailer } = require('nodemailer');
const dotenv = require('dotenv');

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await transporter.sendMail({
      from: `"ETZ A Shoppe" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Admin Login Code: ${code}`,
      html: `<p>Your admin login code is <strong>${code}</strong>.</p>`,
    });

    return res.status(200).json({ ok: true, message: 'OTP sent.' });
  } catch (error) {
    console.error('[otp] send failed', error);
    return res.status(500).json({ error: 'Failed to send OTP.' });
  }
}
