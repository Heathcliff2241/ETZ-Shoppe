import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET || 'changeme';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }

    const validCode = '123456';
    if (String(code).trim() !== validCode) {
      return res.status(401).json({ error: 'Invalid OTP code.' });
    }

    const token = jwt.sign({ email: String(email).toLowerCase(), role: 'admin' }, SESSION_SECRET, {
      expiresIn: '30m',
    });

    return res.status(200).json({ ok: true, token });
  } catch (error) {
    console.error('[otp] verify failed', error);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
}
