import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { sql, isDbAvailable } from '../db.js';
import { requireAdmin } from './admin.js';
import { assertRequiredFields, asyncHandler, parsePositiveNumber } from '../utils/validation.js';

export const productsRouter = Router();

const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');

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

function toProduct(row: Record<string, unknown>) {
  const imageValue = typeof row.image === 'string' && row.image ? row.image : undefined;
  let parsedImages: string[] = [];

  if (typeof imageValue === 'string' && imageValue) {
    try {
      const parsed = JSON.parse(imageValue);
      if (Array.isArray(parsed)) {
        parsedImages = parsed.filter((item): item is string => typeof item === 'string' && Boolean(item));
      } else if (typeof parsed === 'string' && parsed) {
        parsedImages = [parsed];
      }
    } catch {
      parsedImages = imageValue.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  const images = Array.isArray(row.images)
    ? (row.images as string[]).filter(Boolean)
    : parsedImages.length
      ? parsedImages
      : imageValue
        ? [imageValue]
        : [];
  const stock = Number(row.currentStock ?? row.quantity ?? 1);
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    price: Number(row.price ?? 0),
    category: (row.category as string) ?? 'mens',
    size: (row.size as string) ?? '',
    condition: (row.condition as string) ?? 'Gently Loved',
    conditionNote: (row.conditionNote as string) ?? '',
    quantity: Number.isFinite(stock) && stock > 0 ? stock : 1,
    images,
    description: String(row.description ?? ''),
    isSold: Boolean(row.isSold ?? (Number(row.currentStock ?? 1) <= 0)),
    dateAdded: String(row.createdAt ?? row.dateAdded ?? ''),
  };
}

async function getProductsFromDb() {
  if (!isDbAvailable() || !sql) {
    return fallbackProducts.map(toProduct);
  }

  try {
    const rows = await sql.query(
      'SELECT "id", "name", "description", "price", "image", "isActive", "isFeatured", "sortOrder", "createdAt", "updatedAt", "currentStock", "lowStockThreshold", "trackInventory" FROM products ORDER BY "createdAt" DESC'
    ) as Array<Record<string, unknown>>;
    return rows.map(toProduct);
  } catch (error) {
    console.warn('[products] Falling back to demo products because the database schema does not match the expected shape.', error);
    return fallbackProducts.map(toProduct);
  }
}

productsRouter.post('/upload', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const filename = typeof body.filename === 'string' ? body.filename : '';
  const data = typeof body.data === 'string' ? body.data : '';

  if (!filename || !data) {
    return res.status(400).json({ error: 'An image file is required.' });
  }

  const match = data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid image payload.' });
  }

  const [, mimeType, base64Data] = match;
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(safeName) || (mimeType.includes('png') ? '.png' : mimeType.includes('jpeg') ? '.jpg' : '.jpg');
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const fileBuffer = Buffer.from(base64Data, 'base64');

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(uniqueName, fileBuffer, {
      access: 'public',
      contentType: mimeType,
    });
    return res.json({ url: blob.url });
  }

  const filePath = path.join(uploadDir, uniqueName);
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, fileBuffer);

  return res.json({ url: `/images/uploads/${uniqueName}` });
}));

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
    const rows = await sql.query(
      'SELECT "id", "name", "description", "price", "image", "isActive", "isFeatured", "sortOrder", "createdAt", "updatedAt", "currentStock", "lowStockThreshold", "trackInventory" FROM products WHERE "id" = $1',
      [req.params.id]
    ) as Array<Record<string, unknown>>;
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

  const now = new Date().toISOString();
  const price = parsePositiveNumber(p.price, 'price');
  const quantity = typeof p.quantity === 'number' ? p.quantity : 1;
  const imageUrls = Array.isArray(p.images)
    ? p.images.filter((item): item is string => typeof item === 'string' && Boolean(item))
    : [];
  const imageValue = imageUrls.length > 0 ? JSON.stringify(imageUrls) : '';
  const description = [
    String(p.description ?? ''),
    p.conditionNote ? `Condition note: ${String(p.conditionNote)}` : '',
    p.size ? `Size: ${String(p.size)}` : '',
    p.condition ? `Condition: ${String(p.condition)}` : '',
  ].filter(Boolean).join('\n');

  try {
    const rows = await sql.query(
      `
        INSERT INTO products
          ("tenantId", "name", "description", "price", "image", "isActive", "isFeatured", "sortOrder", "createdAt", "updatedAt", "currentStock", "lowStockThreshold", "trackInventory")
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING "id", "name", "description", "price", "image", "isActive", "isFeatured", "sortOrder", "createdAt", "updatedAt", "currentStock", "lowStockThreshold", "trackInventory"
      `,
      [1, String(p.name), description, price, imageValue || null, true, false, 0, now, now, quantity, 10, true]
    ) as Array<Record<string, unknown>>;
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
    const imageUrls = Array.isArray(p.images)
      ? p.images.filter((item): item is string => typeof item === 'string' && Boolean(item))
      : [];
    const imageValue = imageUrls.length > 0 ? JSON.stringify(imageUrls) : undefined;

    const rows = await sql.query(
      `
        UPDATE products SET
          "name" = $1,
          "description" = $2,
          "price" = $3,
          "image" = $4,
          "isActive" = $5,
          "updatedAt" = $6,
          "currentStock" = $7,
          "lowStockThreshold" = $8,
          "trackInventory" = $9
        WHERE "id" = $10
        RETURNING "id", "name", "description", "price", "image", "isActive", "isFeatured", "sortOrder", "createdAt", "updatedAt", "currentStock", "lowStockThreshold", "trackInventory"
      `,
      [
        p.name !== undefined ? String(p.name) : undefined,
        p.description !== undefined ? String(p.description) : undefined,
        price,
        imageValue,
        p.isSold !== undefined ? !Boolean(p.isSold) : undefined,
        new Date().toISOString(),
        quantity,
        10,
        true,
        req.params.id,
      ]
    ) as Array<Record<string, unknown>>;
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
    await sql.query('DELETE FROM products WHERE "id" = $1', [req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    console.warn('[products] Failed to delete product.', error);
    return res.status(503).json({ error: 'Product storage is currently unavailable.' });
  }
}));
