import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import { requireAdmin } from './admin.js';
import { assertRequiredFields, asyncHandler, parsePositiveNumber } from '../utils/validation.js';

export const productsRouter = Router();

// Helper: map DB row → frontend Product shape
function toProduct(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    size: row.size,
    condition: row.condition,
    conditionNote: row.condition_note ?? '',
    quantity: Number(row.quantity ?? 1),
    images: (row.images as string[]) ?? [],
    description: row.description ?? '',
    isSold: row.is_sold,
    dateAdded: row.date_added,
  };
}

// ── GET /api/products  (public) ───────────────────────────────────────────────
productsRouter.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const rows = await sql`SELECT * FROM products ORDER BY date_added DESC`;
  return res.json(rows.map(toProduct));
}));

// ── GET /api/products/:id  (public) ──────────────────────────────────────────
productsRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const rows = await sql`SELECT * FROM products WHERE id = ${req.params.id}`;
  if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
  return res.json(toProduct(rows[0]));
}));

// ── POST /api/products  (admin) ───────────────────────────────────────────────
productsRouter.post('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const p = req.body as Record<string, unknown>;
  assertRequiredFields(p, ['name', 'price', 'category', 'size', 'condition']);

  const id = `etz-${Date.now()}`;
  const dateAdded = new Date().toISOString().split('T')[0];
  const price = parsePositiveNumber(p.price, 'price');
  const quantity = typeof p.quantity === 'number' ? p.quantity : 1;

  await sql`
    INSERT INTO products
      (id, name, price, category, size, condition, condition_note, quantity, images, description, is_sold, date_added)
    VALUES
      (${id}, ${String(p.name)}, ${price}, ${String(p.category)}, ${String(p.size)}, ${String(p.condition)},
       ${String(p.conditionNote ?? '')}, ${quantity}, ${Array.isArray(p.images) ? p.images : []},
       ${String(p.description ?? '')}, false, ${dateAdded})
  `;
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  return res.status(201).json(toProduct(rows[0]));
}));

// ── PUT /api/products/:id  (admin) ────────────────────────────────────────────
productsRouter.put('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const p = req.body as Record<string, unknown>;
  const price = p.price !== undefined ? parsePositiveNumber(p.price, 'price') : undefined;
  const quantity = p.quantity !== undefined ? Number(p.quantity) : undefined;

  await sql`
    UPDATE products SET
      name          = ${p.name !== undefined ? String(p.name) : undefined},
      price         = ${price},
      category      = ${p.category !== undefined ? String(p.category) : undefined},
      size          = ${p.size !== undefined ? String(p.size) : undefined},
      condition     = ${p.condition !== undefined ? String(p.condition) : undefined},
      condition_note = ${p.conditionNote !== undefined ? String(p.conditionNote) : undefined},
      quantity      = ${quantity},
      images        = ${Array.isArray(p.images) ? p.images : undefined},
      description   = ${p.description !== undefined ? String(p.description) : undefined},
      is_sold       = ${p.isSold !== undefined ? Boolean(p.isSold) : undefined}
    WHERE id = ${req.params.id}
  `;
  const rows = await sql`SELECT * FROM products WHERE id = ${req.params.id}`;
  if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
  return res.json(toProduct(rows[0]));
}));

// ── DELETE /api/products/:id  (admin) ─────────────────────────────────────────
productsRouter.delete('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  await sql`DELETE FROM products WHERE id = ${req.params.id}`;
  return res.json({ ok: true });
}));
