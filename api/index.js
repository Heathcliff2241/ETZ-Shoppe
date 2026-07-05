import app, { initServer } from './_lib/server.js';

export default async function handler(req, res) {
  await initServer();

  const path = req.url || '/';
  const normalizedPath = path.startsWith('/api') ? path.replace(/^\/api/, '') : path;
  req.url = normalizedPath || '/';

  return app(req, res);
}
