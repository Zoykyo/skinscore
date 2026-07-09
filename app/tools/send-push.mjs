// send-push.mjs — the no-backend daily push sender.
// Run hourly by .github/workflows/push-daily.yml. Reads the committed device list
// (push-subscriptions.json) and sends a generic "your plan is ready" nudge to each
// device whose local time matches its chosen reminder hour. The payload is intentionally
// generic — the actual plan is computed on-device when the app opens; nothing personal
// is transmitted. VAPID keys come from repo secrets (env).

import webpush from "web-push";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

let subs = [];
// Committed device list (public repo — keep this empty and use the secret for personal devices).
try {
  const fileSubs = JSON.parse(readFileSync(resolve(here, "push-subscriptions.json"), "utf8"));
  if (Array.isArray(fileSubs)) subs = subs.concat(fileSubs);
} catch { /* no committed file */ }
// Private devices from the PUSH_SUBSCRIPTIONS repo secret (kept out of the public repo).
try {
  if (process.env.PUSH_SUBSCRIPTIONS) {
    const secretSubs = JSON.parse(process.env.PUSH_SUBSCRIPTIONS);
    if (Array.isArray(secretSubs)) subs = subs.concat(secretSubs);
  }
} catch { console.log("PUSH_SUBSCRIPTIONS secret is not valid JSON — ignoring."); }
// De-dupe by endpoint.
const seen = new Set();
subs = subs.filter((e) => { const ep = (e.subscription || e).endpoint; if (!ep || seen.has(ep)) return false; seen.add(ep); return true; });
if (subs.length === 0) {
  console.log("No devices registered — nothing to send.");
  process.exit(0);
}

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("Missing VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY secrets.");
  process.exit(1);
}
webpush.setVapidDetails(VAPID_SUBJECT || "mailto:admin@example.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const now = new Date();
const force = process.env.FORCE === "1" || process.env.FORCE === "true"; // test: send regardless of hour
const payload = JSON.stringify({
  title: "SkinScore ✨",
  body: "Your daily skin plan is ready.",
  url: "./index.html",
});

let sent = 0, skipped = 0, failed = 0;
for (const entry of subs) {
  const sub = entry.subscription || entry;
  const tz = entry.tz || "UTC";
  const targetHour = Number(String(entry.hour || "08:00").split(":")[0]);
  let localHour;
  try {
    localHour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: tz }).format(now));
  } catch {
    localHour = now.getUTCHours();
  }
  if (localHour === 24) localHour = 0; // some ICU builds report midnight as 24
  if (!force && localHour !== targetHour) { skipped++; continue; }
  try {
    await webpush.sendNotification(sub, payload);
    sent++;
  } catch (e) {
    failed++;
    // 404/410 = subscription expired; remove that entry from push-subscriptions.json when convenient.
    console.log(`send failed (${e.statusCode || e.message})`);
  }
}
console.log(`Done — sent ${sent}, skipped ${skipped} (not their hour), failed ${failed}.`);
