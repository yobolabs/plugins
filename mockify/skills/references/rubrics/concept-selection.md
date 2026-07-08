# Concept-Selection Rubric — pick-gate scoring

Scores the 2–3 concept cards before the pick. **Hard rule: scores inform the human pick; they never make it.** The judge presents scorecards side by side and stops — no winner declaration, no recommendation, no ranking header. Taste decisions stay human. After the pick, rejected directions get one-line why-nots recorded in the mock-ledger — those why-nots stand and are never rewritten (verdict-integrity R4).

## Dimensions

### 1. Audience/job fit
Does the direction's IA/layout bet serve THIS persona's job-to-be-done, standing on recon's user/flow facts?
- **strong** — the bet cites `checked`/`reasoned` recon facts and the mechanism serves this persona's job specifically.
- **adequate** — grounded but generic: true of this persona, but equally true of most personas in most apps.
- **weak** — stands on `guessing` tags, on facts recon didn't return, or on no citation at all.

### 2. Usability argument
Is the card's usability claim falsifiable and evidence-backed?
- **strong** — names the mechanism (scan order, step count, disclosure structure), cites recon's existing-screen sweep or pattern hunts, and states what would prove it wrong.
- **adequate** — plausible but uncited; an assertion recon could probably back.
- **weak** — "it will feel intuitive" without mechanism or evidence — a usability argument that can't fail isn't one.

### 3. Distinctiveness within the design system
Judged against recon's existing-screen sweep: would this direction read as ITSELF next to the app's current screens — while staying inside the token/component system?
- **strong** — visibly not the default screen grammar; the difference is purposeful and achieved WITH system components and tokens.
- **adequate** — differentiated in execution but familiar in shape.
- **weak** — the cookie-cutter default (ai-slop-ui trap) with tokens swapped in, or distinctiveness bought by forking the system (design-system-drift trap).

### 4. Execution risk
The card's risk note, challenged: is the biggest risk honestly named, and can the direction be delivered in real components?
- **strong** — the risk is real and specific with an early sign; the key-screen mockups prove the direction renders in system components; trap exposure (which trap files this direction flirts with) is acknowledged.
- **adequate** — risk named but soft; deliverability plausible, unproven.
- **weak** — "might not resonate" non-risks, or a direction that demands components the system can't provide with no new-component plan.

## Scorecard format

One per concept, in card order, no comparative ranking:

```
Concept <id>: <name>
  audience/job fit:    <band> — <one-line observable, tags cited>
  usability argument:  <band> — <one-line observable, evidence cited>
  distinctiveness:     <band> — <one-line observable vs the existing-screen sweep>
  execution risk:      <band> — <one-line observable>
  flip condition: <the single new fact or change that would most move this scorecard>
```

Verdict-integrity applies in full: a low score on any dimension states the concept's steelman first (R1); praise bands cite their evidence (R2); bands are the closed vocabulary — no "interesting", no "has potential" (R3).

## After the pick

Record in the mock-ledger: the winner (human-picked) and each rejected direction with its one-line why-not, in the picker's words where given. The spec's integrity note points at this record. The why-nots feed calibration — they are data, not drafts.
