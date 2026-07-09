# Daily push — no-backend (GitHub Actions)

This is the **active** push path for SkinScore. It needs no server and no third-party account —
the daily notification is sent by a scheduled GitHub Actions job in this repo.

- Client subscribes in [`../index.html`](../index.html) using the VAPID **public** key (already set).
- The VAPID **private** key + subject live in repo **secrets** (`VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`).
- [`send-push.mjs`](send-push.mjs) runs hourly via [`../../.github/workflows/push-daily.yml`](../../.github/workflows/push-daily.yml)
  and notifies each registered device at its own chosen local hour.
- Registered devices live in [`push-subscriptions.json`](push-subscriptions.json) (starts empty `[]`).

> The alternative serverless design (auto-capturing subscriptions via a receiver) lives in
> [`../server/`](../server) and is **not** used by this path.

## Register a device (one time per phone/browser)

1. Install the app to your Home Screen (required on iPhone, iOS 16.4+) and open it.
2. **⚙ Settings → Reminders → Daily plan push → on**, grant notifications.
3. Tap **Copy device code** (it copies a small JSON blob).
4. Add that blob as an entry in `push-subscriptions.json`, e.g.:
   ```json
   [
     { "subscription": { "endpoint": "https://…", "keys": { "p256dh": "…", "auth": "…" } }, "hour": "08:00", "tz": "Europe/London" }
   ]
   ```
   (The copied code already has this shape — just paste it into the array.) Commit & push.

The hourly workflow then sends a generic "your plan is ready" nudge at your chosen hour; opening the
app computes and shows the actual plan. Nothing personal is transmitted or stored server-side.

## Notes & limits

- **Timing is approximate.** GitHub's cron can be delayed 10–30+ min under load; fine for a daily nudge.
- **Public repo = free Actions minutes.** An hourly job is well within limits.
- **Expired devices** (send fails with 404/410) can be removed from `push-subscriptions.json` manually.
- Scheduled workflows auto-disable after ~60 days of no repo activity — a push or manual run re-arms them.

## Regenerate VAPID keys (only if needed)

```bash
node -e "const c=require('crypto');const{privateKey}=c.generateKeyPairSync('ec',{namedCurve:'prime256v1'});const j=privateKey.export({format:'jwk'});const u=b=>Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const d=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Buffer.from(s,'base64')};console.log('public',u(Buffer.concat([Buffer.from([4]),d(j.x),d(j.y)])));console.log('private',j.d)"
```
Put `public` into `VAPID_PUBLIC_KEY` in `index.html` + the secret; put `private` into the `VAPID_PRIVATE_KEY` secret.
