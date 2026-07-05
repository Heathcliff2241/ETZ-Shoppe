import { Router, Request, Response } from 'express';
import { sql, isDbAvailable } from '../db.js';
import { requireAdmin } from './admin.js';
import { assertRequiredFields, asyncHandler, parsePositiveNumber } from '../utils/validation.js';

export const productsRouter = Router();

const fallbackProducts = [
  {
    id: 'etz-p1',
    name: 'Vintage Brown Corduroy Jacket',
    price: 450,
    category: 'mens',
    size: 'L (Chest: 44", Length: 28")',
    condition: 'Like New',
    condition_note: 'Crisp collar, deep color, zero fading or fabric wear. All original brass buttons intact.',
    quantity: 1,
    images: [
      '/images/mens_vintage_jacket_1783176811459.jpg',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'A heavyweight, incredibly warm corduroy jacket in a rich chestnut brown. Perfect for cool evenings. Hand-brushed and sanitized.',
    is_sold: false,
    date_added: '2026-06-30'
  },
  {
    id: 'etz-p2',
    name: 'Cottagecore Linen Floral Dress',
    price: 490,
    category: 'womens',
    size: 'M (Bust: 36", Waist: 28-30" stretch, Length: 42")',
    condition: 'Like New',
    condition_note: 'Perfect seams, no piling or color fading. Includes the original linen belt tie.',
    quantity: 1,
    images: [
      '/images/womens_floral_dress_1783176824055.jpg',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'An elegant floral print midi dress made of durable, breathable flax linen. Fitted waist with a flowing skirt. Perfect for weekend markets or beach strolls.',
    is_sold: false,
    date_added: '2026-07-01'
  }
];

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

async function getProductsFromDb() {
  if (!isDbAvailable() || !sql) {
    return fallbackProducts.map(toProduct);
  }

  try {
    const rows = await sql`SELECT * FROM products ORDER BY date_added DESC` as Array<Record<string, unknown>>;
    return rows.map(toProduct);
  } catch (error) {
    console.warn('[products] Falling back to demo products because the database is unavailable.', error);
    return fallbackProducts.map(toProduct);
  }
}

// ── GET /api/products  (public) ───────────────────────────────────────────────
productsRouter.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const products = await getProductsFromDb();
  return res.json(products);
}));

// ── GET /api/products/:id  (public) ──────────────────────────────────────────
productsRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  if (!isDbAvailable() || !sql) {
    const match = fallbackProducts.find((product) => product.id === req.params.id);
    if (!match) return res.status(404).json({ error: 'Not found.' });
    return res.json(toProduct(match));
  }

  try {
    const rows = await sql`SELECT * FROM products WHERE id = ${req.params.id}` as Array<Record<string, unknown>>;
    if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    return res.json(toProduct(rows[0]));
  } catch (error) {
    console.warn('[products] Could not read product from DB, returning fallback result.', error);
    const match = fallbackProducts.find((product) => product.id === req.params.id);
    if (!match) return res.status(404).json({ error: 'Not found.' });
    return res.json(toProduct(match));
  }
}));

// ── POST /api/products  (admin) ───────────────────────────────────────────────
productsRouter.post('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const p = req.body as Record<string, unknown>;
  assertRequiredFields(p, ['name', 'price', 'category', 'size', 'condition']);

  if (!isDbAvailable() || !sql) {
    return res.status(503).json({ error: 'Product storage is currently unavailable.' });
  }

  const id = `etz-${Date.now()}`;
  const dateAdded = new Date().toISOString().split('T')[0];
  const price = parsePositiveNumber(p.price, 'price');
  const quantity = typeof p.quantity === 'number' ? p.quantity : 1;

  try {
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
  } catch (error) {
    console.warn('[products] Failed to insert product.', error);
    return res.status(503).json({ error: 'Product storage is currently unavailable.' });
  }
}));

// ── PUT /api/products/:id  (admin) ────────────────────────────────────────────
productsRouter.put('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const p = req.body as Record<string, unknown>;
  const price = p.price !== undefined ? parsePositiveNumber(p.price, 'price') : undefined;
  const quantity = p.quantity !== undefined ? Number(p.quantity) : undefined;

  if (!isDbAvailable() || !sql) {
    return res.status(503).json({ error: 'Product storage is currently unavailable.' });
  }

  try {
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
    const rows = await sql`SELECT * FROM products WHERE id = ${req.params.id}` as Array<Record<string, unknown>>;
    if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    return res.json(toProduct(rows[0]));
  } catch (error) {
    console.warn('[products] Failed to update product.', error);
    return res.status(503).json({ error: 'Product storage is currently unavailable.' });
  }
}));

// ── DELETE /api/products/:id  (admin) ─────────────────────────────────────────
productsRouter.delete('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (!isDbAvailable() || !sql) {
    return res.status(503).json({ error: 'Product storage is currently unavailable.' });
  }

  try {
    await sql`DELETE FROM products WHERE id = ${req.params.id}`;
    return res.json({ ok: true });
  } catch (error) {
    console.warn('[products] Failed to delete product.', error);
    return res.status(503).json({ error: 'Product storage is currently unavailable.' });
  }
}));
