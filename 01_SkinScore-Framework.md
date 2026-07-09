# SkinScore — the scoring framework

*Version 1.0. The engine that judges every intervention in this project on one honest scale.*

## Why a score

Skincare mixes real medicine with expensive theater. A common rubric forces every candidate —
a prescription retinoid, a sauna habit, a $90 serum, a magnesium bath — to compete on the same
terms: **does the evidence hold, how big is the effect, is it safe, can you sustain it, what does
it cost?** Frontier interventions are welcome, but they earn their place; novelty is not a score.

## The five dimensions

Each is scored **1–5** against explicit anchors.

### 1. Evidence strength — weight 30%
How good is the human evidence that it works *for skin*?

| Score | Anchor |
|---|---|
| 5 | Multiple well-designed human RCTs and/or meta-analyses agree |
| 4 | At least one solid human RCT, or consistent controlled human studies |
| 3 | Mixed or small human trials; mechanistic plausibility strong |
| 2 | Mostly animal / in-vitro; little or conflicting human data |
| 1 | Anecdote, tradition, or marketing only |

### 2. Impact (effect size) — weight 25%
If it works, how much does it actually matter?

| Score | Anchor |
|---|---|
| 5 | Large, visible, durable change (e.g., tretinoin on photoaging) |
| 4 | Clear, measurable benefit most users would notice |
| 3 | Modest but real benefit; needs consistency to see it |
| 2 | Marginal / cosmetic-only / very slow |
| 1 | Negligible or unverifiable |

### 3. Safety — weight 20%
Risk of harm, irritation, or systemic effect.

| Score | Anchor |
|---|---|
| 5 | Very safe, well-tolerated, no supervision needed |
| 4 | Generally safe; minor/manageable side effects |
| 3 | Needs care (technique, dose, or timing) to stay safe |
| 2 | Real risks; medical guidance advisable |
| 1 | Significant risk / requires professional supervision |

### 4. Effort & adherence — weight 15%
Can a normal person keep doing it?

| Score | Anchor |
|---|---|
| 5 | Trivial — seconds a day or fully passive |
| 4 | Easy — fits existing routine |
| 3 | Moderate — a real habit to build |
| 2 | Demanding — time, equipment, or discipline |
| 1 | High-friction; most people quit |

### 5. Cost — weight 10%
Affordability, including recurring cost.

| Score | Anchor |
|---|---|
| 5 | Free or near-free |
| 4 | Cheap one-off or low monthly |
| 3 | Moderate recurring cost |
| 2 | Expensive |
| 1 | Very expensive / needs a clinic |

## Composite & tiers

```
SkinScore = 20 × (0.30·Evidence + 0.25·Impact + 0.20·Safety + 0.15·Effort + 0.10·Cost)
```

Result is 20–100. Tiers:

- **Core (75–100)** — adopt; protocol backbone.
- **Promising (55–74)** — worth a personal trial.
- **Experimental (35–54)** — frontier or thin evidence; track, don't rely on.
- **Skip (20–34)** — hype, negligible benefit, or poor risk/reward.

## Personal-fit flag

Once the owner's skin profile is known, each intervention also gets a fit flag —
🟢 good fit · 🟡 depends / trial carefully · 🔴 poor fit or contraindicated — based on skin type,
concerns, conditions, medications, climate, and budget. Fit can promote or bench an item
regardless of its generic score (e.g., a strong active that your sensitive skin can't tolerate).

## Worked examples (illustrative — refined in later cycles)

| Intervention | Ev | Imp | Saf | Eff | Cost | **Score** | Tier |
|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| Daily broad-spectrum sunscreen | 5 | 5 | 5 | 4 | 4 | **95** | Core |
| Prescription tretinoin (topical) | 5 | 5 | 3 | 3 | 4 | **84** | Core |
| Not smoking | 5 | 4 | 5 | 3 | 5 | **89** | Core |
| Oral collagen peptides | 3 | 3 | 5 | 4 | 3 | **71** | Promising |
| Red-light (LED) face devices | 3 | 3 | 4 | 3 | 2 | **62** | Promising |
| "Collagen-boosting" facial mist | 1 | 1 | 4 | 4 | 3 | **45** | Experimental (generous — real-world evidence often pushes these to Skip) |

*These illustrate the method; each gets a fully sourced score in its cycle.*

## Master scoreboard

**First pass complete — 90 interventions scored across Cycles 2–8.**
Tally: **26 Core · 49 Promising · 14 Experimental · 1 Skip.**

The full ranked leaderboard (all 90, with cycle references) lives in
**`Cycle-09_Synthesis-and-Leaderboard.md`**. Top of the board:

| Rank | Intervention | Cycle | SkinScore | Tier |
|:--:|---|:--:|:--:|---|
| 1 | Broad-spectrum sunscreen | C6 | 95 | Core |
| 2 | Behavioral sun protection | C8 | 94 | Core |
| 3 | Oral nicotinamide (high-risk only) | C5 | 89 | Core |
| 4 | Consistent simple routine | C6 | 86 | Core |
| 5 | Smoking cessation | C8 | 86 | Core |
| 6 | Soak-and-seal bathing | C7 | 84 | Core |
| 7 | Tretinoin / prescription retinoid | C2·C6 | 84 | Core |
| … | *(see Cycle 9 for the full 90)* | — | — | — |
| 90 | Whole-body cryotherapy (skin) | C3 | 27 | Skip |
