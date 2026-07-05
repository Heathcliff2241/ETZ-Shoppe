import app, { initServer } from '../_lib/server.js';

export default async function handler(req, res) {
  await initServer();

  const normalizedUrl = req.url?.startsWith('/api/wishlist')
    ? req.url.replace(/^\/api\/wishlist/, '') || '/'
    : req.url;

  req.url = normalizedUrl || '/';
  return app(req, res);
}
