# Phase 4 output schemas — strategy.md + decision-ledger.md

## strategy.md

```markdown
# {Product} GTM — Strategy

**Status:** FINAL for GATE 2 ({date}) · gtm-lifecycle Phase 4
**Inputs:** strategy-brief.md (v{N}) · spar-state.md · wargames/*
**Decision owner:** {human}

## 1. The decision
The chosen motion + positioning, one paragraph. Which competing motions were eliminated
and WHICH ATTACK eliminated each ("B killed by A2.1 — CAC at maturity exceeds ACV under
the no-sales-force constraint"). If the buyer-motion question survived the spar unresolved,
say so and state the discriminating experiment that decides it.

## 2. Positioning (post-spar)
Wedge · differentiator · one-liner, as amended by the spar. ICP + buyer as decided.

## 3. The bets — final verdicts
| Bet | Verdict | Evidence that decided it | Flip condition |
|---|---|---|---|
| B-Differentiator | survived / amended / killed | attack id or citation | the observable that reopens it |

Every bet from the brief appears — none silently dropped. Amended bets show old → new
wording. Killed bets stay in the table, struck, with what killed them.

## 4. Sequenced moves
Ordered plan. Each move: the action · what observation gates advancing to the next ·
whether it's a two-way or one-way door · pointer to wargames/<move>.md if one-way.
Sequencing rationale in one line (which bet the order de-risks first).

## 5. Surviving unknowns
Open hunts and human-only decisions carried out of the spar — surfaced, never dropped.
Each with: what would resolve it, and which decision waits on it.

## 6. Abort / flip conditions
The observables that mean STOP or REPLAN, pulled up from the war-games and the ledger —
specific and checkable, not vibes.
```

## decision-ledger.md

```markdown
# {Product} GTM — Decision Ledger

**Updated:** {date} · companion to strategy.md

| # | Decision | Load-bearing assumption | Reversibility | Flip observable |
|---|---|---|---|---|
| 1 | lead with the boards wedge | B-Differentiator survived: buyers pay for SOP-driven agents | two-way (messaging) / one-way once publicly committed | 2 consecutive design partners who value X but won't pay |
```

One row per decision the strategy embeds — including the quiet ones (what was ruled OUT
counts as a decision). Columns:
- **Decision** — what was decided, imperative voice.
- **Load-bearing assumption** — the bet (by `B-` name where applicable) it rests on.
- **Reversibility** — `two-way` or `one-way`; one-way rows MUST have a `wargames/<move>.md`.
- **Flip observable** — the concrete observation that would flip the decision. An
  unfalsifiable row is a smell — rewrite until observable.

Two-way doors get a ledger row and nothing else (no war-game — the ceremony must pay
for itself).

## wargames/<move>.md

Owned by spar: written by `spar:wargame` per the spar plugin's wargame-file schema
(moves · expected observations · failures + countermoves · order-N consequences ·
opportunities · fork triggers · abort conditions; executor = the human). Do not
duplicate or fork that schema here — link the files from strategy.md §4 and the ledger.
