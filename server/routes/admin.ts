import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sql } from '../db.js';
import { sendOtp } from '../mailer.js';

dotenv.config();

export const adminRouter = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'changeme';
const OTP_EXPIRY_MINUTES = 10;

// ── Request OTP ──────────────────────────────────────────────────────────────
adminRouter.post('/request-otp', async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Upsert into otp_sessions
  await sql`
    INSERT INTO otp_sessions (email, code, expires_at)
    VALUES (${email.toLowerCase()}, ${code}, ${expiresAt.toISOString()})
    ON CONFLICT (email) DO UPDATE SET code = ${code}, expires_at = ${expiresAt.toISOString()}
  `;

  try {
    await sendOtp(email, code);
  } catch (err) {
    console.error('[otp] Failed to send email:', err);
    return res.status(500).json({ error: 'Failed to send OTP email. Check SMTP config.' });
  }

  console.log(`[otp] Sent OTP to ${email}`);
  return res.json({ ok: true, message: 'OTP sent.' });
});

// ── Verify OTP ───────────────────────────────────────────────────────────────
adminRouter.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, code } = req.body as { email?: string; code?: string };

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  const rows = await sql`
    SELECT * FROM otp_sessions WHERE email = ${email.toLowerCase()}
  `;

  if (rows.length === 0) {
    return res.status(401).json({ error: 'No OTP requested for this email.' });
  }

  const session = rows[0];

  if (new Date() > new Date(session.expires_at)) {
    await sql`DELETE FROM otp_sessions WHERE email = ${email.toLowerCase()}`;
    return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (session.code !== code.trim()) {
    return res.status(401).json({ error: 'Invalid OTP code.' });
  }

  // Clean up
  await sql`DELETE FROM otp_sessions WHERE email = ${email.toLowerCase()}`;

  // Issue JWT (30 min)
  const token = jwt.sign({ email: email.toLowerCase(), role: 'admin' }, SESSION_SECRET, {
    expiresIn: '30m',
  });

  return res.json({ ok: true, token });
});

// ── Middleware: require admin JWT ─────────────────────────────────────────────
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SESSION_SECRET) as { role: string };
    if (payload.role !== 'admin') throw new Error('Not admin');
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
