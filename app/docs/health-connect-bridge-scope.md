# Samsung Health → SkinScore: Health Connect bridge — scope

*Research-backed scope (2025 platform state). Sources at the bottom. Confidence is flagged per claim; a few
items are fast-changing and marked **re-verify at build time**.*

## TL;DR

- A pure PWA **cannot** read Samsung Health — Health Connect is an Android system API with **no web surface**, so a
  thin **native wrapper is mandatory**.
- Wrap the *existing* PWA in **Capacitor** (not a TWA — a TWA can't pass native data into the page). Same HTML/JS,
  no UI rewrite.
- Go through **Android Health Connect**, not Samsung's partner-gated Data SDK. Samsung Health already syncs the data
  we care about into Health Connect.
- **Distribute by sideloading** a release-signed APK to your own phone — this legitimately skips the entire Google
  Play "health apps" declaration/review. (Play publishing is only needed for public distribution.)
- **Realistic MVP effort: ~2–3 focused days** (most of it Android/Gradle/signing friction, not code). I can write
  essentially all the code; you handle the device-side steps (keystore, sideload, granting permissions, testing).

## What you'd actually get (and not get)

| SkinScore habit / signal | Health Connect record | Status | Result |
|---|---|---|---|
| **Sleep 7–9 h** | `SleepSessionRecord` (+ stages) | ✅ syncs from Samsung Health | **Auto-check** from last night's duration |
| **Aerobic exercise** | `ExerciseSessionRecord` | ✅ syncs | **Auto-check** if a workout today |
| Optimizer context (activity) | `StepsRecord` | ✅ syncs | Feed the on-device optimizer |
| Optimizer context (cardio) | `HeartRateRecord` | ✅ syncs (watch/workout) | Feed the optimizer |
| **Hydration** | `HydrationRecord` | ⚠️ **broken** in Samsung Health v6.30 (~Oct 2025) | Auto-check **when Samsung restores it** (needs a small custom plugin regardless) |
| **Managed stress** | — none — | ❌ no HC stress type; not in Samsung's SDK either | **Stays manual** |

Notes that matter:
- **Two-hop consent:** the user must connect Samsung Health → Health Connect *and* grant SkinScore → Health Connect
  (standard Android permission screen).
- **Latency:** phone → Health Connect is near-immediate; the delay is the **Galaxy Watch → phone** leg (battery-
  scheduled). So **poll on app open**, don't expect real-time. Samsung's **phone-only activity-tracker** records are
  excluded from Health Connect.
- Stress: Health Connect added a `MindfulnessSessionRecord` (meditation/breathing) but there is **no continuous
  stress/HRV-derived "stress score" type**, and Samsung's stress metric is proprietary — no supported path.

## Architecture

```
GitHub Pages (browser)  ──────────────  the PWA runs as-is, native branch skipped
        │  (same HTML/CSS/JS, one codebase)
        ▼
Capacitor Android app  ──►  WebView loads the SAME bundled PWA
        │  JS↔native bridge
        ▼
Health Connect read (Kotlin)  ──►  androidx.health.connect.client
        ▲
        │  bidirectional sync (user-enabled)
Samsung Health  ◄──  Galaxy Watch / phone
```

**Why Capacitor, not TWA.** A Trusted Web Activity (Bubblewrap/PWABuilder) is a locked-down Custom Tab: the host
app has no access to the page's JS/DOM/localStorage and the only channel is URL params — there is **no plugin hook to
inject a Health Connect read**. Capacitor runs the web app in a WebView with a **first-class native bridge** (Kotlin
plugin resolves a Promise straight to JS; native can also push via `bridge.eval`), which is exactly what this needs.

**One codebase.** Capacitor can point at the **live GitHub Pages URL** (`server.url`) and plugins still work — but
that needs network every launch and is a dev-only pattern. To keep SkinScore **offline-first**, **bundle** the PWA
assets into the wrapper (`npx cap copy`, automated from the same repo/CI) so identical HTML/JS ships to both Pages
and the APK. A single guarded shim keeps the file working in both places:

```js
if (window.Capacitor?.isNativePlatform?.()) {
  const data = await Capacitor.Plugins.Health.readAll(/* today range */);
  localStorage.setItem('skinscore.health', JSON.stringify(data));  // existing store
  window.dispatchEvent(new Event('health-updated'));               // existing refresh
}
// On the web, window.Capacitor is undefined → branch skipped → zero effect.
```

## Implementation plan

**Plugins (verified capability matrix).** No single off-the-shelf plugin covers all five types:

| Type | `capacitor-health` (mley) | `capacitor-health-extended` (Flomentum fork) | `capacitor-health-connect` (ubie-oss, stale) |
|---|:--:|:--:|:--:|
| Steps | ✅ | ✅ | ✅ |
| Sleep + stages | ❌ | ✅ | ❌ |
| Exercise/workouts | ✅ | ✅ | ❌ |
| Heart rate | ✅ (workout-scoped) | ✅ (+ latest sample) | ✅ |
| Hydration | ❌ | ❌ | ❌ |

→ **Base = `@flomentumsolutions/capacitor-health-extended`** (covers 4/5: steps, sleep+stages, exercise, HR) **plus a
~40-line custom Kotlin plugin** for `HydrationRecord` (no plugin reads hydration anywhere). Custom plugin is a few
hours; hydration may return empty until Samsung fixes the v6.30 regression.

**Manifest / permissions (Android 14+, sideloaded, release-signed):** declare
`android.permission.health.READ_STEPS / READ_SLEEP / READ_EXERCISE / READ_HEART_RATE / READ_HYDRATION`; a `<queries>`
entry for `com.google.android.apps.healthdata`; a **PermissionsRationaleActivity** handling
`androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE`; and (Android 14+) an **activity-alias** handling
`android.intent.action.VIEW_PERMISSION_USAGE` with category `HEALTH_PERMISSIONS`, guarded by
`START_VIEW_PERMISSION_USAGE`. Sign with a real **release keystore** (permission grants are keyed to the signing
identity; re-signing forces re-granting). **Re-verify the exact alias/action names at build time** — HC manifest
requirements have shifted across releases.

**Build + sideload (solo dev):**
1. `npm i @capacitor/core @capacitor/android @capacitor/cli @flomentumsolutions/capacitor-health-extended`
2. Point `webDir` at a copy of the SkinScore site (add `npx cap copy` to the GH Pages deploy so it stays in sync).
3. `npx cap add android` → add the manifest block → drop in the custom Hydration Kotlin plugin, register in `MainActivity`.
4. Add the JS shim; request HC permissions on first launch.
5. `npx cap copy && npx cap sync` → `cd android && ./gradlew assembleRelease` (with your release signingConfig).
6. `adb install app-release.apk` (or transfer + "install unknown apps"); grant permissions in the Health Connect UI.

## Distribution: sideload vs Google Play

- **Sideload (recommended for you):** a release-signed APK reads Health Connect at runtime with **no Play Console
  declaration** — the health-apps declaration is a *Play distribution* gate, not an OS gate (proven by F-Droid readers
  like `com.monkopedia.healthdisconnect` reading 35+ HC metrics with no Play listing). Fastest path; fits "just my phone."
- **Google Play (only if you want public distribution):** requires the **Health apps declaration** (per-package, with
  per-data-type justification), permitted use = **"Fitness, wellness & coaching"** (SkinScore qualifies), a published
  **privacy policy** + **Data safety** section + an **in-app privacy screen that matches**, no published review SLA,
  and **tightening 2026 rules** (stricter justifications, possible org verification). Correction to a common myth:
  **`READ_HEART_RATE` is *not* on Google's heightened-scrutiny list** (that list is menstrual cycle, alcohol, blood
  pressure, skin temperature, cough) — a normal justification suffices. **Re-verify near ship time.**

## iOS later (deferred, low-risk)

The Capacitor wrapper is reusable: iOS reads **Apple HealthKit** via the same/related plugin, so the JS/UI is shared.
Costs are Apple's gates, not code: **$99/yr Apple Developer**, HealthKit entitlement, two `Info.plist` usage strings,
a privacy policy, and **App Store review (Guideline 5.1.3)** — SkinScore's on-device/no-ads model already satisfies
the policy. Caveats: an iOS PWA **cannot** touch HealthKit (native shell mandatory); HealthKit also **lacks a stress
type**; and the same plugin **sleep/hydration gaps** apply. **Android-first is the right call** (reusable wrapper +
frictionless sideload before paying the Apple tax).

## Recommended phasing

- **Phase 0 — Spike / de-risk (~½ day).** Minimal Capacitor shell + `capacitor-health-extended`, release-signed,
  sideloaded to *your* Samsung; confirm the HC permission screen appears and sleep/steps/exercise/HR reads return
  real data. This resolves the one genuine uncertainty (runtime enforcement on a sideloaded release build).
- **Phase 1 — MVP (~1–2 days).** Bundle the PWA into the wrapper (CI step), add the JS shim, wire **sleep → auto-check
  “sleep 7–9 h”**, **exercise → auto-check “aerobic exercise”**, and **steps/HR → optimizer context**. Ship the APK to
  your phone. Managed stress stays manual.
- **Phase 2 — Hydration (optional).** Add the custom `HydrationRecord` plugin; enable the hydration auto-check once
  Samsung restores v6.30 hydration sync.
- **Phase 3 — Reach (optional, later).** iOS/HealthKit build, and/or Google Play publishing if you go public.

## Risks & open questions

- **Plugin maintenance is the top risk.** `capacitor-health-extended` is a small community fork; verify it still
  supports the current Capacitor major before committing. Fallback: read every type in a custom Kotlin plugin.
- **Hydration** has zero plugin coverage and a live Samsung regression — treat as Phase 2, not MVP.
- **Runtime enforcement on sideloaded release builds** — high confidence it works (F-Droid precedent) but **prove it
  in Phase 0** on the actual device.
- **Maintenance:** re-bundle + rebuild + re-sign on PWA changes (automate in CI); periodic `targetSdk`/Gradle bumps;
  re-check Samsung hydration and Play 2026 rules.

## Decisions for you

1. **Distribution:** sideload-only (recommended) vs eventually Google Play?
2. **Hydration:** include the custom plugin now (accepting it may be empty until Samsung's fix) or defer to Phase 2?
3. **iOS:** plan for it later (pick the unified plugin now) or Android-only?
4. **Who builds:** I can write the wrapper, custom plugin, JS shim, and CI bundling; you run the device steps
   (keystore, sideload, permission grants, on-device testing). Want me to start Phase 0?

## Sources

Samsung: [Health Connect FAQ](https://developer.samsung.com/health/health-connect-faq.html) ·
[Accessing Samsung Health via Health Connect](https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect) ·
[Data SDK types](https://developer.samsung.com/health/data/guide/features/data-types.html) ·
[hydration regression thread](https://r2.community.samsung.com/t5/Samsung-Health/Samsung-health-not-syncing-hydration-with-health-connect/td-p/20885873).
Android/Health Connect: [publish](https://developer.android.com/health-and-fitness/health-connect/publish) ·
[data types](https://developer.android.com/health-and-fitness/health-connect/data-types) ·
[13→14 migration](https://developer.android.com/health-and-fitness/health-connect/migration/android-13-to-14) ·
[permissions guidance](https://support.google.com/googleplay/android-developer/answer/12991134) ·
[mindfulness](https://developer.android.com/health-and-fitness/health-connect/features/mindfulness).
Wrapper/plugins: [Capacitor Android bridge](https://capacitorjs.com/docs/core-apis/android) ·
[TWA overview](https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities) ·
[mley/capacitor-health](https://github.com/mley/capacitor-health) ·
[capacitor-health-extended](https://github.com/Flomentum-Solutions/capacitor-health-extended) ·
[ubie-oss/capacitor-health-connect](https://github.com/ubie-oss/capacitor-health-connect) ·
[F-Droid Health Disconnect (sideload precedent)](https://f-droid.org/en/packages/com.monkopedia.healthdisconnect/).
iOS: [HealthKit auth](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data) ·
[App Review 5.1.3](https://developer.apple.com/app-store/review/guidelines/).
