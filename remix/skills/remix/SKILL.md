---
name: remix
description: "Use when working on Ad Studio Remix (spec p131): remaking an existing video ad (Ad Library ad, YouTube/IG/TikTok link or upload) for a merchant's own business, in slides, yobo, msg-api or the Cadra agent and functions, on the web or on WhatsApp. Covers the fixed pipeline, the brief, storyboards, the AI review gate, human approval, video parts, join with the ad's own music, export and post. Also use when the user mentions \"remix\", \"remix video\", \"storyboard\", \"storyboard review\", \"line drawing\", \"brief\", \"Use these\", \"go:yes\", \"needs:use\", \"join\", \"remix stuck\", \"remix journey\", or \"remix_make\". Invoked with or without an ad link: first-time setup if needed (Remix KB MCP), then open the team Remix Lab in the browser with the ad loaded, then follow the pipeline below."
---

# Remix (p131)

Remix = take an existing video ad (or a script) and make something NEW for THIS merchant. It is the main entry of Ad
Studio video; general Ad Studio video, Higgsfield routes and the editor stay in `yobo:ad-studio-video`.

**How this file is written (p152 §2a).** Principles first (why, what good looks like, the harm). State a principle
once; no case rule overrides one; every never/always names its harm. Facts and case rules live in `references/` (one
stage or ad type per file); never a brand, customer or run name here. On a miss, ask "which principle should have
covered it?" before adding a rule.

**Every invocation, first:** connect the `remix-context` MCP (the users' only source: `search` → `read_document`, cite
the URI; not connected → `references/setup.md`; never guess a rule from memory, it drifts from the team's record), then
open and drive the lab per `references/lab.md` (Sean 2026-11-04: "You're supposed to drive it"). Users install nothing.

## Principles

**P1 The storyboard is the contract** (Sean 2026-11-03; 2026-11-05: "the key is we get to a storyboard, and the
storyboard has all the elements to generate the video").
- Why: a clean storyboard (clear scenes, picture or clip each, lines that make sense, beats mapped to the audio)
  means the video comes out close; every fault is visible before a cent is spent.
- Good: brief + storyboard decide the video; the brief says what each scene shows (cast, set, lines, beats,
  keep/change/never) and gains a field when a check needs one; code checks + AI review gate every set before the
  merchant sees it. A source ad is optional: a script becomes the brief and runs the same pipeline. Every way in
  becomes a template, the one plan on the run record. The lab's defaults are the product defaults.
- Harm guarded: a check that invents its own target, or a spec that silently diverges from the lab, ships a video
  nobody agreed to (that is how the ad's own music and per-shot line drawings shipped off).
- Example: a 2 s scene carrying a 10 s beat is caught on the storyboard, not after the paid render.

**P2 Benchmark, not blueprint** (Sean 2026-11-05: "The original ad is a BENCHMARK for quality, not the exact
BLUEPRINT. Lower our thresholds.").
- Why: merchants want a good video, not a scene-by-scene copy; nitpicking fails sets that are good enough.
- Good: every check judges the ad's job (hook hooks, product is the hero, the call to action lands, quality at least
  the original's). Block only what harms the merchant: wrong product, another brand, unsafe, broken quality.
- Harm guarded: an AI verdict alone that stops a run turns a fine video into a dead end. Detail: `references/review.md`.
- Example: a different presenter than the source ad is info on the run, never a fail.

**P3 One owner per step, in yobo** (Sean 2026-11-05: "move everything to Yobo out of slides").
- Why: two paths for one step drift apart and the merchant gets whichever broke.
- Good: every remix runs in yobo on one run record. Every step is a button tap; code moves the run and ends the
  agent's turn; the agent only talks (free text, questions, typed remix tools). It never presses Approve, states a
  price or promises AI-drawn text, because each of those is a promise the record cannot keep.
- Harm guarded: a second path in slides, or an agent "say nothing" instruction, leaves a run stalled or doubly sent.
- Example: a tap reaches yobo `tap.ts` and advances the run without an agent turn. Detail: `references/whatsapp-journey.md`.

**P4 Reuse first, pay once** (Sean 2026-11-03: "minimize the generation, maximize the reuse").
- Why: every paid second bills the platform key; most of a source ad has no product in it.
- Good: keep every part with no product, remake the fewest seconds (stills as one picture, neighbours merged),
  regenerate only what changed, save every paid output the moment it lands. Nothing paid without a cleared budget
  (the remix lead clears runs inside the day's budget); pricing is parked: the merchant sees one all-inclusive video
  price, never a new credit UX.
- Harm guarded: paying for seconds the ad already had, or a surprise cost (`fast-swap.md`, `engineering.md` § Who decides).
- Example: an 8 s ad with one 2 s product shot bills 4 s of video (Seedance floor), not 8.

**P5 The merchant's product, true to life** (Sean 2026-11-04: "make sure the dimensions are correct").
- Why: a merchant who sees their product at the wrong size, the wrong kind or with the old brand stops trusting it.
- Good: real size and proportions next to hands and people; same product type as the one replaced; shown as itself
  (not printed, on a screen or reflected); label exact; a product sheet from the merchant's own photos first; overlay
  text removed; captions and logos added in post.
- Harm guarded: the old brand's words, products or art in the merchant's ad, or a tub drawn the size of a bag.
- Example: a cross-type swap (beauty into food) goes to the storyboard pipeline. Detail: `references/fast-swap.md`.

**P6 Never silent, never false** (Sean 2026-11-05: "It should be a problem solver").
- Why: a stop with no reason and no button is the merchant's remix dying in front of them.
- Good: every check fixes once, then asks ONE question with buttons, then stops well on judgment, with one plain line
  in the chat's language and a forward option beside any change option. Say only what the record shows; log every fix
  and ask on the run; every finished or failed paid remix leaves a learnings note in the KB (`references/learnings.md`).
- Harm guarded: silence, a contradicting line, an endless loop, or a lesson the next run pays for again.
- Example: "The new plan adds a person. [Keep original people] [Allow new person]" (`whatsapp-journey.md` § Problem solver).

## The fixed pipeline (no step optional, none skippable)

1. **Read the ad**: cuts, shots, still/moving, music bpm from pixels and audio (code, never the LLM: an LLM guesses cut times and the beats drift), then one
   reading (`video_blueprint`) fed the measured cut list. A script start skips this.
2. **Brief** → `references/brief.md`. Rewritten when the merchant's answers come in.
3. **Needs / questions**: ask everything missing ONCE, filled first from what the business already has.
4. **Line drawings**: position and framing only, per shot, from its own source frame; never sent to a video model alone (it copies the sketch look into the video).
5. **Storyboard images** → `references/storyboard.md`: line drawing redrawn with new cast, set, product.
6. **AI review + code checks** → `references/review.md`.
7. **Human approval** of each storyboard. Only the merchant approves; the agent never does.
8. **Video parts** (draft 480p first, final on request). Type decides how: `references/types/`.
9. **Join** → `references/join-and-sound.md`: the ad's own music laid ONCE, cuts on its beats.
10. **Final → approve / export → post**.
Exception: "Just swap the product" (merchant's choice only) skips 2–7 → `references/fast-swap.md`.

## Pick the type

Decide from the reading, before the brief: people talking -> people-dialogue, else product-hero; the merchant's pick wins.

| Source ad is | Load |
|---|---|
| people on screen, speech or dialogue | `references/types/people-dialogue.md` |
| a product moving through shots, no people speaking | `references/types/product-hero.md` |
| fast cuts of stills held on beats | `references/types/montage.md` |
| video and stills mixed (keep/mine clips) | `references/types/mixed.md` |
| a phone / app / website screen shown | `references/types/screens.md` (also applies inside any other type) |
| the ad beside a static prompt panel (template post) | `references/types/template-reel.md` (also applies inside any other type) |
| ingredients turning into the product (making-of) | `references/types/product-hero.md` "A making-of ad needs a real recipe" (any type) |

## References (load on demand)

| File | When |
|---|---|
| `references/lab.md` | every invocation: open the lab, drive it, who does what, lab defaults |
| `references/fast-swap.md` | "Just swap the product", templates, reuse, source download, swap allowed or not |
| `references/brief.md` | writing, rewriting or feeding the brief |
| `references/storyboard.md` | line drawings, storyboard cards, per-card fields |
| `references/review.md` | AI review, fit, benchmark verdicts, set check, code checks, known gaps |
| `references/join-and-sound.md` | joining parts, music, beats, export |
| `references/whatsapp-journey.md` | tap ids, words, copy rows, buttons, problem solver, failure lines |
| `references/engineering.md` | builders: shipping and proof rules, who decides, budget, pricing |
| `references/code-map.md` | where each step runs in slides / yobo / msg-api / Cadra |
| `references/learnings.md` | after every finished or failed paid remix: the learnings note + Remix KB upload |
| `references/setup.md` | first use on a machine: connect the Remix KB MCP (nothing else) |
| `references/types/*.md` | one per ad type |

Related: `yobo:ad-studio-video`, `yobo:whatsapp`, `yobo:social`, `yobo:messaging`; KB search "p131", "remix lab", "higgsfield gotchas".
