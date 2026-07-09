# SkinScore — the app

A daily, evidence-graded skin companion built from the research in `../` (the 90-intervention SkinScore
leaderboard and protocol). It's a **PWA** — installs to your phone's home screen, works offline, and keeps
all your data on-device.

## What's in the box

| File | Purpose |
|---|---|
| `index.html` | The app (full PWA — this is the one to host/install) |
| `manifest.webmanifest` | App name, icons, colours, standalone display |
| `sw.js` | Service worker — offline app shell + notification handling |
| `icons/` | App icons (192, 512, maskable, apple-touch) |
| `data/skinscore-data.json` | The 90-item leaderboard + changelog, generated from the research (auto-loaded by the app) |
| `tools/build-data.mjs` | Regenerates `data/…json` from the research Markdown |
| `SkinScore.html` | A single-file copy used for the claude.ai live preview (no service worker) |

## Three ways to use it

**1. Instant preview (no setup).**
Open the published artifact — works on any device, state saved in that browser:
<https://claude.ai/code/artifact/02f6cb53-bb50-4df4-894b-e798395e3659>
*(This preview can't register a service worker, so it isn't installable and can't send reminders — it's for looking, not installing.)*

**2. Run locally on your PC** (to try the full PWA, including offline):
```powershell
# from this folder:
python -m http.server 8137
# then open http://localhost:8137 in Chrome/Edge — localhost counts as a secure context,
# so Install and reminders work.
```

**3. Install on your phone** (the real goal). PWAs need **https**, so host the folder on any free static host,
then open the URL on your phone and choose *Add to Home Screen*:
- **Netlify Drop** — drag this `app` folder onto <https://app.netlify.com/drop>. Instant https URL, no account needed.
- **Cloudflare Pages / GitHub Pages / Vercel** — connect the folder/repo, deploy, done.
- On the phone: **Android/Chrome** shows an *Install* prompt (also the ⬇ Install button in the app).
  **iPhone/Safari** → tap **Share → Add to Home Screen**.

## Features

- **Personalize** — enter your profile (age, skin tone/Fitzpatrick, skin type, concerns, conditions, health &
  medications, sun exposure, climate, budget) and a rules engine flags every intervention 🟢 good-fit / 🟡 careful /
  🔴 avoid for *you*. It also reshapes the day: contraindicated items are paused (e.g. retinoids in pregnancy, with
  azelaic acid swapped in), the routine reorders around your concerns, and the daily focus adapts. On-device only.
- **Today** — AM/PM ritual checklists, a completion dial, an anchor-step **streak**, day↔night theme by the hour.
- **Barrier check-in** — flag irritation and the app enters *recovery mode*: it pauses the actives and coaches
  cleanse–moisturize–SPF for 2–4 weeks (straight from Cycle 6).
- **Trials** — start one change at a time, track days elapsed, and log *helped / no change / worse* at the review
  date. This is the protocol's own "test one thing for a few weeks" method, enforced.
- **Progress photos** — stored in-browser (IndexedDB), for honest week-over-week comparison.
- **Ranks** — all 90 interventions, searchable, filterable by tier.
- **Research** — the six takeaways, the 8 cycles, the SkinScore weighting, and a changelog.
- **Settings (⚙)** — reminder times, theme, install, JSON export/backup, and reset.

## Auto-sync with the research

The app doesn't hardcode the leaderboard — it **fetches `data/skinscore-data.json` on load** and falls back to a
built-in copy when that file isn't reachable (offline, or the claude.ai preview). The Research tab shows a
"Synced from the research — updated …" stamp.

To refresh it after the weekly deepening task edits the research Markdown:

```powershell
node tools/build-data.mjs   # parses Cycle-09 leaderboard + Charter changelog -> data/skinscore-data.json
```

Wire this one line into the weekly task (run it after the deepening step) and every research update flows into the
app automatically — no hand-copying. The service worker serves this file **network-first**, so an installed app
picks up changes on next launch while still working offline.

## Notes

- **Privacy:** everything (check-ins, trials, photos) lives only in your browser/device. *Export a backup* in
  Settings to move it. There is no server and nothing is uploaded.
- **Reminders** are most reliable once the app is **installed**; some browsers won't fire them when a plain browser
  tab is fully closed.
- **Personalization is decision-support, not diagnosis.** The 🟢/🟡/🔴 flags come from the profile you enter and are
  deliberately conservative. Pregnancy, medications, prescriptions, and procedures must be confirmed with a clinician.
- **Not medical advice.**
