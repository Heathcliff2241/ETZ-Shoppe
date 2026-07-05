import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET || 'changeme';
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const code = generateCode();
    const otpToken = jwt.sign(
      { email: normalizedEmail, code, purpose: 'admin-otp' },
      SESSION_SECRET,
      { expiresIn: '10m' }
    );

    let emailSent = false;
    let note = '';

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"ETZ A Shoppe" <${process.env.SMTP_USER}>`,
          to: normalizedEmail,
          subject: `Your Admin Login Code: ${code}`,
          html: `<p>Your admin login code is <strong>${code}</strong>.</p>`,
        });
        emailSent = true;
      } catch (error) {
        console.warn('[otp] send failed, using fallback code', error);
        note = 'Email delivery is unavailable right now, so the temporary code was generated locally.';
      }
    } else {
      note = 'SMTP is not configured, so the temporary code was generated locally.';
    }

    return res.status(200).json({
      ok: true,
      message: emailSent ? 'OTP sent.' : 'OTP generated.',
      code,
      otpToken,
      fallback: !emailSent,
      note,
    });
  } catch (error) {
    console.error('[otp] send failed', error);
    return res.status(500).json({ error: 'Failed to send OTP.' });
  }
}
