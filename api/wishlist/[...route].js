import app, { initServer } from '../_lib/server.js';

export default async function handler(req, res) {
  await initServer();
  req.url = req.url?.replace(/^\/api\/wishlist/, '') || '/';
  return app(req, res);
}
