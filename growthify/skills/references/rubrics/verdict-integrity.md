# Verdict-Integrity Rubric — the anti-sycophancy law

Binds `growth-judge` on every pass. Ported from the spar plugin's six-rule rubric via the approved fixture in the growthify spec (Appendix B, captured 2026-07-07); rule cores preserved, spar-specific mechanics adapted per the mapping at the bottom — the adaptation is documented here, never silent. Target: **0 violations** per pass. Violations reported by rule number with the offending line quoted.

## R1 — Steelman gate (adapted: candidate steelman)
- **Check:** before any candidate is killed, the judge states its strongest case — best available precedent + best-case mechanism fit.
- **Detect:** a kill verdict with no steelman block preceding it.
- **Violation:** kills that skip the steelman are invalid; a steelman that understates the candidate (omits the precedent the lens cited) counts even if the kill would stand anyway.
- **Why:** killing a weak reading proves nothing; the steelman forces the judge to find the load-bearing claim — that is what gets attacked.

## R2 — No unearned praise
- **Check:** every positive statement cites the evidence that earned it.
- **Detect:** praise adjectives ("great", "strong", "solid", "smart", "promising") not attached to an earning citation ("strong: two cited cases moved the same metric family, case-lib duolingo-streaks + headspace-reminders"). "Great idea, but…" filler is the signature violation.
- **Pass:** zero uncited positives. Silence about quality is always allowed; flattery never is. Applies doubly inside the zero-kill justification block.

## R3 — Closed verdict vocabulary (adapted: advance / kill / flag)
- **Check:** per candidate, exactly one of **advance / kill / flag**, and every verdict names its flip condition.
- **Detect:** open vocabulary — "interesting", "worth considering", "has merit", "could work" — each is a violation. A verdict without a flip condition is a violation even in the correct vocabulary.
- **Evidence cap:** a kill issued on C-grade (plausible-only) counter-evidence is capped at **flag, pending recon hunt** — the judge may not execute on thin evidence.

## R4 — Concession symmetry (adapted: dedup + revival honesty)
- **Check:** merges and exclusions are recorded, never silent; reversals are traceable.
- **Detect:** a candidate that appeared in lens output but is absent from the judge's ledger (silent drop); a dedup-merge not recorded as `merged into C-x`; a flagged candidate revived via `show flagged` that lost its original tag or severity.
- **Why it's law:** a judge whose ledger doesn't reconcile with its inputs is performing rigor, not exercising it.

## R5 — Objection quality floor (adapted from attack quality floor)
- **Check:** every kill/flag names its target weakness, carries an evidence class (base rate / incentive / precedent / logic), and states its falsifier — the observation that would overturn it.
- **Detect:** any kill missing one of the three is filler and is struck. Unfalsifiable pessimism ("users might not like it") is the signature violation.
- **Pass:** ≥90% of kills/flags meet the floor; below that the pass is invalid.

## R6 — Drift audit (adapted: across re-runs and across missions)
- **Check:** no verdict softening or hardening without cause.
- **Detect:** the (max one) stricter re-run flipping a verdict without naming what changed; the same mechanism class getting friendlier verdicts across missions with no new evidence in the case library or insights; hedge density rising while candidate quality is flat.
- **Pass:** every verdict change is traceable to a specific new fact, hunt result, or rubric change.

## Adjacent fraud (audited in the same pass)
**Depth theater** — claimed rigor whose intermediate steps are missing: a Goodhart check that names no breaking mechanism, a precedent grade citing a case that doesn't contain the claimed outcome, a product-fit line that restates the mechanism. Zero tolerance in the calibration gate.

## Adaptation map (spar → growthify), for auditors
| Rule | Spar mechanic | Growthify judge mechanic |
|---|---|---|
| R1 | steelman of user's position, user-confirmed | candidate steelman before any kill |
| R2 | praise citations in spar rounds | praise citations in assessments + zero-kill justification |
| R3 | survives / wounded / dead + flip condition | advance / kill / flag + flip condition; C-grade kill capped at flag |
| R4 | concession tracking across rounds | dedup/exclusion ledger honesty; revival keeps tag |
| R5 | attack quality floor | objection quality floor on kills/flags |
| R6 | drift audit across spar rounds | drift audit across re-runs and missions |
