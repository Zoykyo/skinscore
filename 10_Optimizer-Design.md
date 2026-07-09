# SkinScore Pairing Optimizer — the "iteration loop" feature

*Built 2026-07-09 into the SkinScore PWA (`app/index.html`). Turns the 90-intervention interaction
knowledge into a daily, on-device auto-search that maximizes amplifier pairings and hard-blocks the
cancel-effect pairings, adapts to the user's day, and can drive a daily notification.*

## What it is — the Karpathy loop, made literal

Two nested loops, both running on-device (no cloud, no runtime LLM):

- **Inner loop (per day, ~5 ms):** start from the user's routine → propose *one atomic legal change*
  (move an active AM↔PM↔off) → score it against the interaction graph + fit-flags + today's context →
  keep-if-better → repeat (deterministic seeded hill-climb + 6 simulated-annealing restarts). Out comes
  today's AM/PM plan + a plain-English "why it changed" diff.
- **Outer loop (per day, cross-session):** `learnFromYesterday()` reads yesterday's logged adherence
  and nudges *preference* weights (mainly the effort penalty) — struggled → suggest fewer actives;
  crushing it → allow a little more.

## Safety model (the load-bearing decision)

Pair-contraindications are **hard structural constraints, never learnable weights**:

1. **Single-item floor:** any item `fitFor()` flags `avoid` (e.g. retinoid in pregnancy) is removed from
   the optimizer's decision space entirely — it can't appear in a plan or drive pairing advice.
2. **Pair floor:** every candidate is checked by `blocked()` **before it is scored**; any candidate that
   co-times a `sev:'block'` antagonist (retinol/vitamin C + benzoyl peroxide, retinoid + acid same night,
   ≥2 exfoliants, copper peptide + vitamin C/acid) is discarded, never evaluated.
3. **Slot lock:** photosensitizers (retinoids, exfoliating acids) are PM-only — never scheduled in the AM.

Because block-severity pairs have *no weight*, **no sequence of learning updates can ever surface a
contraindicated pairing.** The learnable weights only rank legal-but-suboptimal choices.

## Fitness function

`score = Σ amplifier bonuses (mag, only when the timing rule holds)
       − Σ soft-antagonist penalties
       + Σ fitFor flag weights (good +, caution −, avoid excluded)
         × context multipliers
       − effort overflow vs the user's learned capacity`

Amplifiers encoded: vitamin C + SPF (AM), retinoid + niacinamide (PM), retinoid + ceramide (PM),
retinoid + SPF (cross AM/PM), niacinamide + barrier. Anchors (SPF, cleanse, moisturizer, sleep, sun
behavior) are always kept.

## Daily-reality context

`state.context` — modulates the fitness, mostly offline:

| Signal | Capture | Offline? | Effect |
|---|---|---|---|
| Yesterday's adherence | derived from `state.checks` | ✅ | effort budget (outer loop) |
| Rough night / stress / new product | one-tap chips on the card | ✅ | ease strong actives; gentle-care advisory |
| Active irritation | existing barrier-recovery button | ✅ | pauses all actives |
| **UV index** | Open-Meteo (keyless), opt-in geolocation | ❌ network | high UV → prioritize SPF, suppress exfoliation |

UV degrades gracefully to the static `profile.sun` field when offline or geolocation is declined.

## UX — suggest-only

The **"Today's optimized plan"** card sits at the top of the Today tab (only once a profile exists). It
shows the why-diff, the amplifiers it kept together, and **Apply today / Keep mine** — nothing changes
until the user applies. Applying pauses the conflicting actives in the AM/PM lists (with reasons) via a
one-line hook in `decorate()`; **Undo** restores them. Framed as decision-support, not medical advice.

## Notifications

Decision: **reliable Web Push from the start.** Client scaffolding is in place (`enablePush()`, SW
`push` handler, Settings toggle). It activates once you paste a VAPID public key + subscribe URL into the
top of the optimizer module and deploy the tiny sender in **`app/server/`** (`subscribe.mjs` +
hourly-cron `send-daily.mjs`). Until then it falls back to local reminders + **catch-up-on-open**
(`catchUpNotify()`), which surfaces today's plan the next time the app opens. Honest constraint: a
guaranteed daily alarm on a *closed* PWA — especially iOS — requires that server + home-screen install.
The push payload is generic ("your plan is ready"); the plan itself is always computed on-device.

## Where it lives in the code

`app/index.html` (one IIFE): `INTERACTIONS` graph · `pairKeys/schedItems/blocked/scoreCand/optimizeDay/
planFromCand` engine · `buildContext/fetchWeather` · `optimizerDefer` (read by `decorate`) ·
`learnFromYesterday` · `catchUpNotify` · `enablePush` · `renderOptimizer` (the card). SW push in `sw.js`
(cache bumped to v4). Backend scaffold in `app/server/`.

## Verified (browser preview, 2026-07-09)

- Acne + wrinkles + high-sun profile → keeps vitamin C (AM) and the retinoid + niacinamide + ceramide
  stack (PM); defers benzoyl peroxide and exfoliation with correct reasons; 4 amplifiers preserved.
- Pregnancy → retinoid excluded, azelaic swapped in, no phantom retinoid advice.
- Context toggles, Apply (pauses 2 conflicting actives) / Undo (restores), no console errors.

## Not yet done / next

- Author a fuller interaction graph (currently ~13 curated edges covering the routine's actives; extend
  toward the ~30–60-pair set across all 90 for the Ranks tab) — clinician sign-off on severities.
- Optional: 1-tap "skin felt better/worse" outcome to strengthen the outer loop beyond adherence.
- Deploy the push backend with real VAPID keys + a KV store (swap `store.mjs`).
