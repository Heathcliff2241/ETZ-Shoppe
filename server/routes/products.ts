import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import { requireAdmin } from './admin.js';

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
productsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await sql`SELECT * FROM products ORDER BY date_added DESC`;
    return res.json(rows.map(toProduct));
  } catch (err) {
    console.error('[products] GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// ── GET /api/products/:id  (public) ──────────────────────────────────────────
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const rows = await sql`SELECT * FROM products WHERE id = ${req.params.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    return res.json(toProduct(rows[0]));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

// ── POST /api/products  (admin) ───────────────────────────────────────────────
productsRouter.post('/', requireAdmin, async (req: Request, res: Response) => {
  const p = req.body;
  const id = `etz-${Date.now()}`;
  const dateAdded = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO products
        (id, name, price, category, size, condition, condition_note, quantity, images, description, is_sold, date_added)
      VALUES
        (${id}, ${p.name}, ${p.price}, ${p.category}, ${p.size}, ${p.condition},
         ${p.conditionNote ?? ''}, ${p.quantity ?? 1}, ${p.images ?? []},
         ${p.description ?? ''}, false, ${dateAdded})
    `;
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
    return res.status(201).json(toProduct(rows[0]));
  } catch (err) {
    console.error('[products] POST error:', err);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
});

// ── PUT /api/products/:id  (admin) ────────────────────────────────────────────
productsRouter.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const p = req.body;
  try {
    await sql`
      UPDATE products SET
        name          = ${p.name},
        price         = ${p.price},
        category      = ${p.category},
        size          = ${p.size},
        condition     = ${p.condition},
        condition_note = ${p.conditionNote ?? ''},
        quantity      = ${p.quantity ?? 1},
        images        = ${p.images ?? []},
        description   = ${p.description ?? ''},
        is_sold       = ${p.isSold ?? false}
      WHERE id = ${req.params.id}
    `;
    const rows = await sql`SELECT * FROM products WHERE id = ${req.params.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    return res.json(toProduct(rows[0]));
  } catch (err) {
    console.error('[products] PUT error:', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

// ── DELETE /api/products/:id  (admin) ─────────────────────────────────────────
productsRouter.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await sql`DELETE FROM products WHERE id = ${req.params.id}`;
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});
