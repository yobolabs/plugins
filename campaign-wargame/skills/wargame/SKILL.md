---
name: wargame
description: War-game a campaign, drip flow, segment change, offer, or creative batch BEFORE launching it — fight the plan on paper, move by move, so surprises happen in the document instead of in customers' inboxes. Use when the user says "war-game this campaign", "stress-test this plan", "what could go wrong", "review before send", "is this segment safe", or before any big send, new drip flow, discount promotion, or first use of a new channel. Skip it for tiny routine sends — the review must be worth its time.
---

# Campaign War-Game

A war-game is not a plan review where everyone nods. It's fighting the campaign on paper: every step states what you expect to see if it works, what you'd see instead if it doesn't, the most likely way it goes wrong, and what you do about it — BEFORE anything is sent. The output is a single document the whole team can execute with confidence.

## Why this works

Nobody can hold a whole campaign's consequences in their head — sends, replies, unsubscribes, quality ratings, stacked discounts, next month's list health. Written down and walked one step at a time, anyone can. Four habits do the work:

1. **Facts before moves.** Every plan stands on claims ("this segment is 4,200 people", "these customers haven't heard from us in 30 days"). Check them first — most campaign disasters are fact errors, not idea errors.
2. **One honest pessimist.** Someone whose only job is "how does this go wrong?" — separate from the person who wrote the plan.
3. **Ripples, not just splashes.** A send doesn't end at delivery. It changes list health, quality ratings, customers' patience, and what the NEXT campaign can do. Walk the ripples out two or three steps.
4. **Can't-take-it-back moments get extra care.** A send cannot be unsent. A promised discount must be honored. Spam complaints permanently hurt deliverability. Mark these moments and slow down at exactly those points.

## Honesty rules (apply to every step)

- Every important claim gets a tag: **checked** (you saw the data — say where), **reasoned** (follows from checked facts — show how), **guessing** (be honest, and say what would confirm it), or **don't know**. "Don't know" is never the end — go find out: pull the report, check the segment count, ask the merchant, or run a small test send to a slice of the list.
- Challenge one "that's just how we do it" per war-game. Ask: why? Is the original reason still true? What opens up if we drop it?
- Every war-game says what's IN this campaign, what's deliberately OUT, and what's parked for later (with the trigger that un-parks it).

## The loop

Run the five roles in order. Each role is an agent in this plugin — dispatch them, or wear the hats yourself in sequence for smaller missions.

### 0. Mission brief
Fill `references/templates/campaign-brief.md`: the goal in numbers, the audience, the offer, the channel(s), budget, brand voice, what success looks like, and the **care level** (how deep to war-game — routine sends get a light pass; discounts, full-list sends, and new channels get the deep one).

### 1. Research (`campaign-researcher`)
Build the fact base: real segment counts, recent send history to this audience, current WhatsApp quality rating / channel health, what this merchant promised customers before, what the last similar campaign actually did. Tag every fact. Hunt every "don't know".

### 2. Draft the moves
Lay the campaign out as numbered moves: build segment → prepare creative → submit template → test send → main send → follow-up/drip steps → measure. One line each.

### 3. Devil's advocate (`campaign-devils-advocate`)
For every move: what you expect to see if it worked, what you'd see if it didn't, the most likely failure with its early-warning signal, and the response (both the "it's fine, retry" case and the "this is real, change course" case). A war-game where nothing fails goes back for another pass.

### 4. Ripples (`campaign-ripples`) and Opportunities (`campaign-opportunity-scout`) — run both
Ripples: walk each move's consequences outward — this send → unsubscribes → smaller reachable list → weaker next campaign; discount → margin → customer expects discounts forever. Number the steps (1st ripple, 2nd, 3rd).
Opportunities: same walk, positive direction — what does this campaign make possible? Which segment is being ignored? Which creative angle is reusable? Rank with `references/rubrics/better-marketing.md`.

### 5. Assemble + Review (`campaign-reviewer`)
Merge into the war-game file (`references/templates/wargame-file.md`): moves with expectations and responses, **watch-points** (the numbers to check mid-flight and the thresholds that trigger a pause), the ripple map, the opportunity list, open questions for the merchant/team, and **stop conditions** (the specific numbers or events that mean STOP SENDING and escalate). The reviewer scores it against `references/templates/success.md` — accept, or name exactly what's missing for one more pass.

## Executing the war-game

The accepted file IS the launch runbook. Whoever executes checks each move's expected observation before the next move, watches the watch-points during the send, and honors stop conditions without debate. **After the campaign: record what actually happened vs what the war-game predicted** — every surprise becomes a lesson in `references/traps/` so the next war-game is smarter. The trap library only grows from real campaigns.

## What to war-game (and how deep)

| Mission | Care level |
|---|---|
| Full-list or biggest-segment send | deep — list health is on the line |
| New discount / promo structure | deep — promises can't be unmade; margins stack |
| New drip flow going live | deep — it runs unattended |
| First send on a new channel / new template | deep — platform ratings are slow to recover |
| Segment definition change | medium — wrong audience = wasted send + annoyed customers |
| Creative/caption batch refresh | light — reversible, but check brand + claims |
| Routine weekly send to a warm segment | skip or light |

## References

- `references/templates/` — campaign-brief, wargame-file, success checklist, open-questions ledger
- `references/rubrics/better-marketing.md` — what "better" means (never "more complicated")
- `references/traps/` — known failure patterns by category; grows from your real campaigns
- `references/exemplars/README.md` — index of your best accepted war-games (add your first ones here)
