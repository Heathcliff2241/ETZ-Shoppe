import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from '../../server/db.js';
import { adminRouter } from '../../server/routes/admin.js';
import { productsRouter } from '../../server/routes/products.js';
import { ordersRouter } from '../../server/routes/orders.js';
import { usersRouter } from '../../server/routes/users.js';
import { cartRouter } from '../../server/routes/cart.js';
import { wishlistRouter } from '../../server/routes/wishlist.js';
import { contactRouter } from '../../server/routes/contact.js';
import { notFoundHandler, errorHandler } from '../../server/middleware/errorHandler.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/admin', adminRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/contact', contactRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

export async function initServer() {
  await initDb();
}
