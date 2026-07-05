import app, { initServer } from '../_lib/server.js';

export default async function handler(req, res) {
  await initServer();

  const normalizedUrl = req.url?.startsWith('/api/users')
    ? req.url.replace(/^\/api\/users/, '') || '/'
    : req.url;

  req.url = normalizedUrl || '/';
  return app(req, res);
}
