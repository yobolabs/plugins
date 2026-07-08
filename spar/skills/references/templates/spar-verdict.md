# Spar Formats — state file, round, close

Three formats the spar skill uses: the persistent state file (resumability + the judge's audit substrate), the per-round display, and the close.

## 1. spar-state.md (`SPAR_HOME/missions/<slug>/spar-state.md`)

Fixed sections — the judge drift-audits exactly this file; keep the structure machine-walkable.

```markdown
# Spar — <slug>

> Type: <opinion|proposal|design|goal> · Domain: <domain> · Depth: <light|deep> ·
> Status: <open|closed> · Brief: <path | none — degraded L<1–4>> · Pack: <path | none>

## Position log
- **v0** (<date>): <the position as stated>
- **v1** (<date>): <amended position — forced by A2.1>

## Concessions
- (round <n>, <date>) USER conceded: <ground> — never re-litigated
- (round <n>, <date>) RED TEAM conceded: A1.3 dead — defeated by <the counter that killed it>

## Attacks & verdicts
### Round <n> — vs v<N> (<date>)
Steelman: <confirmed verbatim | revised ×k then confirmed>
- **A<n>.<i> — <persona/stance>** [<evidence class>]: <attack, naming target assumption>
  Evidence: <grounding, cited> · Falsifier: <observation that kills this attack>
  → **<surface>: <survives|wounded|dead|wounded (pending verification — hunt: X)>** · Flip: <condition>
  [tag: unresearched — verdict capped]
- Deep-dive findings folded in (if "go deep" ran): <cascade/scout refs>

## Unknowns
- U<i>: <claim> — hunts run: <list> — status: open | resolved (<date>, <source, grade>)

## Ledger
(entries per ledger.md format)
```

## 2. Round format (what the user sees each round)

1. **Steelman** (round 1, and after any amendment): the position restated stronger — then **"Is this steelman fair?"** No attack until confirmed.
2. **Attacks** (3–5, each on its own surface where possible):
   `A2.1 — <persona> [base rate]: <attack>` · Evidence: <cited> · Falsifier: <observation>
3. **Verdicts** — one per attack surface, closed vocabulary:
   `<surface>: WOUNDED — <one line why>. Flip: <the single thing that would most change this verdict>`
4. Prompt: concede / counter / amend — plus the standing options `go deep`, `check that <claim>`, `done`.

## 3. Close format

1. **Verdict table:** | surface | final verdict | flip condition |
2. **Position delta:** v0 → vN — what changed, which attacks forced it. (No delta? Then the verdict summary must show an evidence-backed "survives" — never polite agreement.)
3. **Surviving unknowns** + open hunts; every verdict capped by missing research listed, with the offer to resolve now.
4. **Ledger** — assumptions/decisions carried out.
5. **Offers:** promote to mission mode (if a one-way door surfaced) · run deferred research · **distill diff** (redacted; one confirm) → pack writeback.
6. Judge drift-audit result, violations reported verbatim.
