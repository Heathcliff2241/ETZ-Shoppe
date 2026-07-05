import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import { adminRouter } from './routes/admin.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

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
