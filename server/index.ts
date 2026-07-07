import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDb } from './db.js';
import { adminRouter } from './routes/admin.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { usersRouter } from './routes/users.js';
import { cartRouter } from './routes/cart.js';
import { wishlistRouter } from './routes/wishlist.js';
import { contactRouter } from './routes/contact.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';


dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true, methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '16mb' }));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

app.options('*', (_req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.sendStatus(204);
});

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/contact', contactRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(notFoundHandler);
app.use(errorHandler);

// Start
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] ETZ API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] Failed to initialize DB:', err);
    process.exit(1);
  });
