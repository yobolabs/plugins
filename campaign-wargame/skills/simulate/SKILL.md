---
name: simulate
description: Train the team's war-gaming muscle on PAST campaigns — pick a campaign that already ran, war-game it as if it hadn't launched yet (blind to the results), then reveal what actually happened and score the difference. Every miss becomes a trap-library entry; every accurate war-game becomes an exemplar. Use when the user says "run a simulation", "practice war-game", "train on past campaigns", "build our trap library", or when the team is new to war-gaming and the library is empty.
---

# Simulation — Train on Your Own History

The fastest way to build war-gaming skill (and the trap library) is not theory — it's your own past campaigns, where reality already graded the exam. A simulation war-games a campaign that already ran, WITHOUT peeking at the results, then compares.

## Why this works

- **Zero risk** — nothing gets sent.
- **Ground truth is free** — the results already exist; no waiting weeks to find out if the war-game was right.
- **The library builds itself** — every miss ("we never predicted the unsubscribe spike") becomes a trap entry sourced to a real campaign. After 5–10 simulations, the trap library reflects YOUR merchants, YOUR audiences, YOUR channels — not generic marketing advice.

## Instructions

### Step 1: Pick a past campaign
Good picks: one that surprised you (best), one that flopped, one that went great but nobody knows why. Need: its original plan/brief (or enough to reconstruct it) AND its actual results (sends, opens/reads, clicks, redemptions, unsubs, complaints, revenue).

### Step 2: Quarantine the results
Whoever runs the simulation must NOT look at the results yet. Reconstruct only the "night before launch" picture: the brief as it was, the segment as it was, the creative as it was. Write it into `references/templates/campaign-brief.md` format.

### Step 3: War-game it blind
Run the full loop from the `wargame` skill (researcher → moves → devil's advocate → ripples + opportunity scout → assemble → reviewer) exactly as if launch were tomorrow. Facts get tagged from what was knowable THEN. Produce the complete war-game file, reviewed and accepted.

### Step 4: Reveal and compare
Now open the actual results. Dispatch `campaign-reviewer` in **comparison mode**:
- **Predicted and happened** — credit; these moves/watch-points were real foresight.
- **Predicted, didn't happen** — over-caution; fine in moderation, note if a pattern.
- **Missed entirely** — the gold. Each miss gets written up: what happened → why → the early signal that WAS visible → what to do next time.

### Step 5: Bank the learning
- Every real miss → an entry in `references/traps/` (correct category file), sourced to the campaign by name/date.
- Process misses ("nobody checked segment overlap") → a one-line addition to the templates or checklist instead.
- If the blind war-game held up well against reality → copy it to `references/exemplars/` and index it in the README; it becomes the standard future war-games are judged against.

### Step 6: Repeat
One simulation per week beats ten in one day. Rotate who runs them. After each, the next one gets sharper — the trap library is doing its job when the devil's advocate starts citing it.

## Examples

### Example 1: The flop
"Simulate the March win-back blast." Blind war-game predicts modest opens, flags frequency fatigue as top risk. Reality: opens fine, but redemptions near zero — the offer required an app the customers didn't have installed. MISS → new trap: "offer redemption path unverified — check the redemption journey end-to-end before send."

### Example 2: The mystery hit
"Simulate the Raya bundle that outperformed 3×." Blind war-game rates it routine. Reality: 3× conversions. Comparison digs: send landed the day salaries cleared. → opportunity pattern banked: "payday-timing" enters the playbook, testable on the next two campaigns.

## Notes

- Blindness is the whole game — a simulation run by someone who remembers the outcome trains nothing. Pick campaigns the runner wasn't close to, or old enough to be foggy.
- Keep simulated war-game files in a `simulations/` folder wherever the team keeps campaign docs — don't mix them with live launch runbooks.
- The first 2–3 simulations will feel slow. That's the point at which most teams quit; the fourth is where the trap library starts paying.
