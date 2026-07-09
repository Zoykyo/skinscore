// POST /subscribe  — body: { subscription, hour: 'HH:MM', tz: 'Area/City' }
// Stores an anonymous push subscription so the daily cron can wake this device.
// Node http handler; adapt the wrapper to your host (Workers/Vercel/Netlify all pass a Request/Response).

import { put } from './store.mjs';

export async function handleSubscribe(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }
  let body = '';
  for await (const chunk of req) body += chunk;
  let data;
  try { data = JSON.parse(body); } catch { res.statusCode = 400; return res.end('Bad JSON'); }

  const sub = data && data.subscription;
  if (!sub || !sub.endpoint) { res.statusCode = 400; return res.end('Missing subscription'); }

  await put({
    id: sub.endpoint,                 // stable, anonymous key
    subscription: sub,
    hour: /^\d{2}:\d{2}$/.test(data.hour) ? data.hour : '08:00',
    tz: typeof data.tz === 'string' ? data.tz : 'UTC'
  });

  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true }));
}

// --- Standalone dev server: `node subscribe.mjs` ---
if (import.meta.url === `file://${process.argv[1]}`) {
  const { createServer } = await import('node:http');
  createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    if (new URL(req.url, 'http://x').pathname === '/subscribe') return handleSubscribe(req, res);
    res.statusCode = 404; res.end('Not Found');
  }).listen(8790, () => console.log('subscribe dev server on :8790'));
}
