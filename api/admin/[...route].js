import express from 'express';
import { initDb } from '../../server/db.js';
import { adminRouter } from '../../server/routes/admin.js';

const app = express();
app.use(express.json());
app.use('/', adminRouter);

export default async function handler(req, res) {
  await initDb();

  const normalizedUrl = req.url?.startsWith('/api/admin')
    ? req.url.replace(/^\/api\/admin/, '') || '/'
    : req.url;

  req.url = normalizedUrl || '/';
  return app(req, res);
}
