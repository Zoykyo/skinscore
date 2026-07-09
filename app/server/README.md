# SkinScore push backend (optional)

The app is offline-first and computes each day's plan **on-device**. This tiny backend exists for one
job: **reliably wake a closed PWA once a day** (the only cross-platform way to do that — especially on
iOS — is server-sent Web Push). The server never sees your skin profile or your plan; it only stores an
anonymous push subscription and fires a generic "your plan is ready" nudge. Opening the app runs the
optimizer and shows the actual recommendation.

If you skip this, the app still works: it uses local reminders + "catch-up on open" (it shows today's
plan and a notification the next time you open it). You just don't get a guaranteed daily alarm when the
app is fully closed.

## What you deploy

Two functions on any serverless host (Cloudflare Workers, Vercel, Netlify Functions, AWS Lambda, Deno Deploy):

| File | Route | Runs |
|---|---|---|
| `subscribe.mjs` | `POST /subscribe` | when a user turns on "Daily plan push" — stores `{subscription, hour, tz}` |
| `send-daily.mjs` | cron, every hour | sends the nudge to subscribers whose local time matches their chosen hour |

Storage here is a placeholder (`store.mjs`, in-memory/JSON). Swap it for your host's KV/DB
(Cloudflare KV, Vercel KV, DynamoDB, Postgres — the interface is `list()`, `put()`, `del()`).

## Setup (5 steps)

1. **Generate VAPID keys** (one time):
   ```bash
   cd app/server && npm install && npx web-push generate-vapid-keys
   ```
2. Put the **public** key and your deployed subscribe URL into `index.html` (top of the optimizer module):
   ```js
   var VAPID_PUBLIC_KEY = '<your VAPID public key>';
   var PUSH_ENDPOINT     = 'https://<your-host>/subscribe';
   ```
3. Set env vars on the host: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (a `mailto:` you own).
4. Deploy `subscribe.mjs` and `send-daily.mjs`; schedule `send-daily` on an **hourly** cron.
5. In the app: Settings → Reminders → **Daily plan push** → on. (Install to home screen first on iOS.)

## Platform reality (unchanged by this backend)

- **iOS/iPadOS:** Web Push works **only** for a PWA added to the Home Screen, iOS 16.4+. Safari tabs can't.
- **Android/desktop Chrome, Firefox:** work in-browser once notification permission is granted.
- The push **payload is intentionally generic** ("your plan is ready") — the plan itself is computed
  on-device when the app opens, so nothing personal is transmitted or stored server-side.
