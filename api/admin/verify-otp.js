import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET || 'changeme';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, code, otpToken } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let expectedCode = null;
    if (otpToken) {
      try {
        const payload = jwt.verify(otpToken, SESSION_SECRET);
        if (payload?.purpose !== 'admin-otp' || String(payload?.email || '').toLowerCase() !== normalizedEmail) {
          return res.status(401).json({ error: 'Invalid or expired OTP session.' });
        }
        expectedCode = String(payload.code);
      } catch {
        return res.status(401).json({ error: 'Invalid or expired OTP session.' });
      }
    }

    if (!expectedCode && String(code).trim()) {
      return res.status(401).json({ error: 'OTP session is missing. Please request a new code.' });
    }

    if (expectedCode && String(expectedCode).trim() !== String(code).trim()) {
      return res.status(401).json({ error: 'Invalid OTP code.' });
    }

    const token = jwt.sign({ email: normalizedEmail, role: 'admin' }, SESSION_SECRET, {
      expiresIn: '30m',
    });

    return res.status(200).json({ ok: true, token });
  } catch (error) {
    console.error('[otp] verify failed', error);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
}
