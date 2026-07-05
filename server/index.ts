import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

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
