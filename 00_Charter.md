# Skin Health Research Project — Charter

*Founding document. Version 1.0 — July 9, 2026.*

## 1. Purpose

Understand the science of skin health from first principles, discover what genuinely
influences it (across medicine, genetics, treatments, nutrition, supplements, baths,
saunas, light therapy, and daily habits), and converge on a **personalized, evidence-graded
protocol** the owner can actually follow — beyond the one thing everyone already knows
(avoid the sun).

This is a **living research project**. It runs in **cycles**: each cycle deep-dives one
domain, scores every intervention on a common scale, and folds the winners into the protocol.

## 2. Configuration (agreed at kickoff)

| Decision | Choice |
|---|---|
| **Purpose** | Build the science base **and** translate it into a personal protocol |
| **Depth** | **Deep scientific** — mechanisms, genetics, human studies, effect sizes, graded evidence |
| **Scope order** | **Frontier-first** — lead with cutting-edge advances, then backfill fundamentals |
| **Deliverable** | **Protocol checklist**, backed by a deep evidence appendix (the cycle write-ups) |
| **Cadence** | **Scheduled** — one cycle runs automatically per week; the knowledge base builds itself |

## 3. The scoring engine — SkinScore

Every intervention we investigate is scored 0–100 on five weighted dimensions
(evidence 30%, impact 25%, safety 20%, effort 15%, cost 10%) and sorted into tiers:
**Core (75+) · Promising (55–74) · Experimental (35–54) · Skip (<35)**. A personal-fit
flag is applied once the owner's skin profile is known. Full rubric: `01_SkinScore-Framework.md`.

## 4. Cycle roadmap

| # | Cycle | Covers | Status |
|---|---|---|---|
| 1 | The biology of skin aging | Barrier, collagen/elastin, glycation, senescence, inflammaging, the exposome | ✅ Complete |
| 2 | Frontier medical & genetic | Retinoids, peptides, exosomes, growth factors, microneedling/PRP, lasers, injectables, nutrigenomics, senolytics | ✅ First pass |
| 3 | Light, heat & cold | Red/near-infrared photobiomodulation, LED, IPL, saunas, cold exposure | ✅ First pass |
| 4 | Diet & the gut–skin axis | Glycemic load, dairy, omega-3s, polyphenols, dietary collagen, the microbiome | ✅ First pass |
| 5 | Supplements & nutraceuticals | Collagen peptides, oral vit C / niacinamide, astaxanthin, vitamin D, zinc, Polypodium | ✅ First pass |
| 6 | Topical actives & routine | What works, layering vs. minimalism, barrier care, the daily habit stack | ✅ First pass |
| 7 | Baths, minerals & hydrotherapy | Balneotherapy, Dead Sea / magnesium salts, thermal springs, water hardness, bathing habits | ✅ First pass |
| 8 | Lifestyle habits | Sleep, stress/cortisol, exercise, smoking, alcohol, pollution — and sun, done properly | ✅ First pass |
| 9 | Synthesis | Final SkinScore leaderboard + complete personalized protocol | ✅ First pass |

Order may be adjusted; frontier cycles (2, 3) lead deliberately.

## 5. Knowledge base structure

```
Skincare-Research/
├── README.md                         Index + status + scoreboard
├── 00_Charter.md                     This document
├── 01_SkinScore-Framework.md         The scoring rubric + master scoreboard
├── 02_Cycle-01_Biology-of-Skin-Aging.md
├── 03_Protocol.md                    The evolving checklist (the endpoint)
└── (one new cycle file per week)
```

## 6. Methodology & guardrails

- **Evidence hierarchy.** Human RCTs and meta-analyses outrank observational studies,
  which outrank animal/in-vitro work, which outranks expert opinion, which outranks
  marketing. Each claim is tagged with its evidence level.
- **Honesty about hype.** Much of the skincare market is marketing. Low-evidence and
  overhyped items will score low and be labeled as such.
- **Safety first.** Anything prescription, procedural, or that interacts with medication
  gets a safety flag and a "consult a professional" note rather than a recommendation.
- **Not medical advice.** This is an educational evidence synthesis, not a diagnosis or
  treatment plan. Final decisions — especially on drugs, procedures, and supplements —
  should be made with a qualified dermatologist or physician.

## 7. Personalization intake (needed before the protocol cycles)

To turn the generic scoreboard into *your* protocol, provide when ready:
skin type (dry/oily/combination/sensitive) and main concerns; age; Fitzpatrick type /
how you tan or burn; current routine and products; any skin conditions, allergies, or
medications; climate and typical sun exposure; and budget/effort appetite.

## 8. Change log

- **v1.0 (2026-07-09):** Project chartered. SkinScore defined. Cycle 1 completed. Weekly
  cadence scheduled (Cycle 2 onward).
- **v1.1 (2026-07-09):** First pass of Cycles 2–9 completed — 90 interventions scored (26 Core,
  49 Promising, 14 Experimental, 1 Skip). Protocol populated. Weekly task repurposed to *deepen*
  the shallowest cycle each week rather than create new ones.
- **v1.2 (2026-07-09):** Added the pairing optimizer — an on-device auto-search loop that
  re-sequences your routine each day to keep amplifier pairings together (vitamin C + SPF;
  retinoid + niacinamide + ceramide) and hard-block the cancel-effect pairs (benzoyl peroxide +
  retinol/vitamin C; retinoid + acid the same night; over-exfoliation). Adapts to your day
  (sleep, stress, new products, UV) and suggests — you approve. Optional Web Push for a reliable
  daily nudge.
- **v1.3 (2026-07-09):** Medications now feed the analysis — add the drugs and supplements you
  take and the app maps them to skin-safety flags (photosensitizers → stricter SPF; blood
  thinners → procedure caution; isotretinoin → hold strong actives; thiazides/hormonal
  contraceptives → sun/pigment care; and more), with a one-line caution per medicine that always
  defers to your pharmacist. Unknown drugs get an honest "ask your pharmacist" note; the app never
  tells you to start or stop a medicine. UV upgraded to a current-hour reading with the day's peak
  and a manual "Set UV" entry so you can type the number your Galaxy Watch shows (the app already
  uses the same forecast source your watch does; it can't read the watch directly).
