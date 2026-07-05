import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET || 'changeme';
const otpSessions = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const session = otpSessions.get(normalizedEmail);

    if (!session) {
      return res.status(401).json({ error: 'No OTP requested for this email.' });
    }

    if (new Date() > new Date(session.expiresAt)) {
      otpSessions.delete(normalizedEmail);
      return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (String(session.code).trim() !== String(code).trim()) {
      return res.status(401).json({ error: 'Invalid OTP code.' });
    }

    otpSessions.delete(normalizedEmail);

    const token = jwt.sign({ email: normalizedEmail, role: 'admin' }, SESSION_SECRET, {
      expiresIn: '30m',
    });

    return res.status(200).json({ ok: true, token });
  } catch (error) {
    console.error('[otp] verify failed', error);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
}
