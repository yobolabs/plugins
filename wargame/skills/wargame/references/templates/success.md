# War-Game Acceptance Criteria (seed — copy per mission folder, tighten per mission)

A war-game is accepted only when ALL hold:

1. **Runs cold** — the named executor model could run it with zero additional context: every path, command, and observation literal; no "as discussed"; no unstated environment.
2. **Every move complete** — action + success observation + failure observation + most-likely reaction (cause + signals) + both countermove branches. Success and failure observations discriminable, or the discriminating probe given.
3. **Reality pressure real** — failures plausible, grounded (fact or trap citation), and discriminable from each other. A war-game where no move fails is rejected outright.
4. **Depth walked = depth claimed** — order numbers on every consequence finding; chains shown one step at a time; cross-repo edges walked; honest terminations (`map-exhausted` distinct from "no consequences"). Depth knob reached or shortfall explained.
5. **Epistemic integrity** — no untagged load-bearing claim; `verified` means cited from this run; unknowns closed only by hunts; survivors in the ledger with failed hunts listed, never dropped.
6. **Both directions walked** — opportunity register present and ranked on the Better rubric; every "later" has a promotion trigger, every "designed-for" a named seam; risk-only drafts rejected.
7. **First-principles pass done** — inherited constraints challenged once; any "it's the way it is" converted to either a verified reason or an opportunity entry.
8. **Fork triggers & aborts** — divergence observables defined before execution; abort conditions specific and observable, present at the end.
9. **Taste** — the war-gamed route itself scores on the Better rubric; if a simpler route exists, the draft either takes it or shows why not.

**Design-quality checks** (apply when the war-gamed artifact ships a gate or a human-review loop — calibration-sourced):
- **Derived over self-reported gate metrics** — a gate fed by a self-reported model quantity (confidence, severity, quality grade) is rejected at design time; the v1 contract must supply a derived, checkable computation (citations resolve, rubric named, class membership), not a post-eval countermove.
- **Review-gate integrity** — a human-review gate over machine-generated candidates carries a blind-first sample (reviewer answers before seeing the candidate) to measure pipeline context-sufficiency; holdout splits are made at the SOURCE-UNIT level (session/file), never the item level, when items from one source can alias.
