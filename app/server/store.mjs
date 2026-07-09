// Placeholder subscription store. Swap for your host's KV/DB (Cloudflare KV, Vercel KV, DynamoDB, ...).
// A subscription record: { id, subscription, hour: 'HH:MM', tz: 'Area/City' }
// The `id` is the push endpoint URL (stable, anonymous — no user identity).

import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('./subscriptions.json', import.meta.url);

async function readAll() {
  try { return JSON.parse(await readFile(FILE, 'utf8')); } catch { return {}; }
}
async function writeAll(map) {
  await writeFile(FILE, JSON.stringify(map, null, 2));
}

export async function put(rec) {
  const map = await readAll();
  map[rec.id] = rec;
  await writeAll(map);
}
export async function del(id) {
  const map = await readAll();
  delete map[id];
  await writeAll(map);
}
export async function list() {
  return Object.values(await readAll());
}
