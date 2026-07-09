// Hourly cron: send the "your plan is ready" nudge to any subscriber whose LOCAL time is their chosen hour.
// The payload is deliberately generic — the actual daily plan is computed on-device when the app opens.
//
//   env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:you@example.com)
//   run: node send-daily.mjs   (schedule hourly: e.g. cron "0 * * * *")

import webpush from 'web-push';
import { list, del } from './store.mjs';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Current 'HH:MM' in a given IANA timezone
function localHM(tz) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const h = parts.find(p => p.type === 'hour').value;
  const m = parts.find(p => p.type === 'minute').value;
  return `${h}:${m}`;
}

const PAYLOAD = JSON.stringify({
  title: 'Today’s skin plan ✨',
  body: 'Your routine is re-tuned for today — tap to see what changed.',
  url: './index.html'
});

export async function sendDaily() {
  const subs = await list();
  let sent = 0;
  for (const rec of subs) {
    try {
      const nowHM = localHM(rec.tz || 'UTC');
      // fire when we're in the same hour as their chosen time (hourly cron granularity)
      if (nowHM.slice(0, 2) !== (rec.hour || '08:00').slice(0, 2)) continue;
      await webpush.sendNotification(rec.subscription, PAYLOAD);
      sent++;
    } catch (err) {
      // 404/410 => subscription expired; clean it up
      if (err && (err.statusCode === 404 || err.statusCode === 410)) await del(rec.id);
    }
  }
  return sent;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  sendDaily().then(n => { console.log(`pushed to ${n} subscriber(s)`); process.exit(0); });
}
