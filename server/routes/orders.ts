import { Router, Request, Response } from 'express';
import { sql } from '../db.js';
import { requireAdmin } from './admin.js';

export const ordersRouter = Router();

function toOrder(row: Record<string, unknown>) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    deliveryMethod: row.delivery_method,
    deliveryAddress: row.delivery_address,
    contactMethod: row.contact_method,
    note: row.note,
    items: row.items,
    subtotal: Number(row.subtotal),
    status: row.status,
    dateCreated: row.date_created,
  };
}

// ── POST /api/orders  (public — place order) ─────────────────────────────────
ordersRouter.post('/', async (req: Request, res: Response) => {
  const o = req.body;
  const id = `ETZ-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateCreated = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

  try {
    await sql`
      INSERT INTO orders
        (id, customer_name, customer_phone, customer_email, delivery_method,
         delivery_address, contact_method, note, items, subtotal, status, date_created)
      VALUES
        (${id}, ${o.customerName}, ${o.customerPhone}, ${o.customerEmail},
         ${o.deliveryMethod}, ${o.deliveryAddress ?? null}, ${o.contactMethod},
         ${o.note ?? null}, ${JSON.stringify(o.items)}, ${o.subtotal},
         'pending', ${dateCreated})
    `;

    // Mark ordered products as sold
    if (Array.isArray(o.items)) {
      for (const item of o.items as { productId: string }[]) {
        await sql`UPDATE products SET is_sold = true WHERE id = ${item.productId}`;
      }
    }

    const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
    return res.status(201).json(toOrder(rows[0]));
  } catch (err) {
    console.error('[orders] POST error:', err);
    return res.status(500).json({ error: 'Failed to create order.' });
  }
});

// ── GET /api/orders  (admin only) ────────────────────────────────────────────
ordersRouter.get('/', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rows = await sql`SELECT * FROM orders ORDER BY date_created DESC`;
    return res.json(rows.map(toOrder));
  } catch (err) {
    console.error('[orders] GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// ── PUT /api/orders/:id/status  (admin only) ──────────────────────────────────
ordersRouter.put('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };
  const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${req.params.id}`;

    // If cancelled, un-mark products as sold
    if (status === 'cancelled') {
      const rows = await sql`SELECT items FROM orders WHERE id = ${req.params.id}`;
      if (rows.length > 0) {
        const items = rows[0].items as { productId: string }[];
        for (const item of items) {
          await sql`UPDATE products SET is_sold = false WHERE id = ${item.productId}`;
        }
      }
    }

    const rows = await sql`SELECT * FROM orders WHERE id = ${req.params.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    return res.json(toOrder(rows[0]));
  } catch (err) {
    console.error('[orders] PUT status error:', err);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});
