# War-Game — <mission-name>

> Executor: <model + harness>. Depth walked: order <N>. Domain agent: <…>. Status: <draft-1 | judged-accept>.

## 1. Epistemic base

The facts this war-game stands on. Every entry tagged `verified` (citation) / `inferred` (chain) / `assumed` (ledger ref) / `unknown → hunted → outcome`.

| # | Fact | Tag | Source |
|---|------|-----|--------|

## 2. Dependency map (summary)

Who reads / writes / assumes each thing this mission touches. Cross-repo edges marked ⇄.

## 3. Move tree

Numbered moves; branches lettered (4a, 4b). One line each here; full triples below.

## 4. Moves

### Move <n> — <name>

- **Action:** <literal — command, edit, dispatch. No "as discussed".>
- **Expected observation (success):** <exact output/status/log/UI state>
- **Expected observation (failure):** <what the executor sees instead; if identical to success, the probe that discriminates>
- **Most-likely reaction:** <cause → observable signals. Trap-library refs where they apply — those are guaranteed, not hypothetical.>
- **Countermove (pessimistic):** <failure is structural — recovery path; does the plan fork?>
- **Countermove (optimistic):** <failure is superficial — cheap fix + how to confirm it was superficial>
- **Fork triggers:** <observe X → route A; observe Y → route B>
- **Consequences:** <order-numbered, from §5, that this move causes>

## 5. Consequence tree (cascade)

Order-numbered findings per move, each with the map edge it rode, severity (blocks / degrades / cosmetic), and disposition (new move / fork trigger / abort condition / accepted risk).

## 6. Opportunity register (scout)

| Finding | Enabled by (move/order) | Better axes (+cost) | Consumers now→plausible | Partition | Trigger/Seam |
|---------|------------------------|---------------------|------------------------|-----------|--------------|

Partition values: now / designed-for (seam named) / later (trigger named) / rejected (why, one line).

## 7. Now/later partition (mission scope)

- **Now:** <…>
- **Designed-for:** <item — seam: …>
- **Later:** <item — promotes when: … — reversibility: two-way/one-way>
- **Out / rejected:** <…>

## 8. Assumptions & surviving unknowns

Ledger refs. Each: what would verify it, and which moves it underpins (blast radius if false).

## 9. Abort conditions

States where the executor STOPS and escalates to the human. Specific, observable, no judgment calls: <e.g. "no access to X after countermove 3b", "migration touches rows > N", "any RLS policy change required that the war-game didn't enumerate">.

## 10. Mission success criteria

The final observations that mean done — the executor verifies each before reporting.
