import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

let sqlInstance: ReturnType<typeof neon> | null = null;
let dbError: Error | null = null;

try {
  if (process.env.DATABASE_URL) {
    sqlInstance = neon(process.env.DATABASE_URL);
  } else {
    dbError = new Error('DATABASE_URL environment variable is not set.');
  }
} catch (error) {
  dbError = error instanceof Error ? error : new Error(String(error));
}

export const sql = sqlInstance as typeof sqlInstance;

export function isDbAvailable() {
  return Boolean(sqlInstance);
}

export async function initDb() {
  if (!sqlInstance) {
    console.warn('[db] Database unavailable; continuing without persistence.', dbError?.message || '');
    return;
  }

  try {
    await sqlInstance`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        category TEXT NOT NULL,
        size TEXT NOT NULL,
        condition TEXT NOT NULL,
        condition_note TEXT DEFAULT '',
        quantity INTEGER DEFAULT 1,
        images TEXT[] DEFAULT '{}',
        description TEXT DEFAULT '',
        is_sold BOOLEAN DEFAULT FALSE,
        date_added TEXT
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        delivery_method TEXT,
        delivery_address TEXT,
        contact_method TEXT,
        note TEXT,
        items JSONB,
        subtotal NUMERIC,
        status TEXT DEFAULT 'pending',
        date_created TEXT
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS otp_sessions (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        address TEXT,
        date_registered TEXT
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        product_id TEXT REFERENCES products(id),
        quantity INTEGER,
        date_added TEXT
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS wishlists (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        product_id TEXT REFERENCES products(id),
        date_added TEXT
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        date_created TEXT
      )
    `;

    await sqlInstance`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'admin',
        date_created TEXT
      )
    `;
  } catch (error) {
    console.warn('[db] Database initialization failed; continuing without persistence.', error);
  }
}
