import app, { initServer } from '../_lib/server.js';

export default async function handler(req, res) {
  await initServer();
  req.url = req.url?.replace(/^\/api\/cart/, '') || '/';
  return app(req, res);
}
